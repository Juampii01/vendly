import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPayment, validateWebhookSignature } from '@/lib/mercadopago'
import { sendOrderConfirmation } from '@/lib/resend'
import { sendOrderConfirmationWA } from '@/lib/whatsapp'
import type { MPWebhookBody, StoreConfig } from '@/types'

export async function POST(req: NextRequest) {
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')

  let body: MPWebhookBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── 1. Validar firma con secret global ───────────────────────────────────
  //
  // Validamos siempre, sin excepciones. Si el secret global no está configurado,
  // RECHAZAMOS la request — el comportamiento anterior (skip cuando faltaba
  // env var) dejaba el endpoint público.
  //
  // Para multi-tenant con secrets por store: tras resolver la orden,
  // re-validamos con el secret del tenant_config si está presente.
  //
  const dataId = body.data?.id ?? String(body.id)
  const globalValid = await validateWebhookSignature(xSignature, xRequestId, dataId)
  if (!globalValid) {
    console.warn('[mp-webhook] Invalid signature (global) — rejecting')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (body.type !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }

  // ── 2. Obtener pago desde MP ─────────────────────────────────────────────
  // Primero sin storeId (token global) para obtener el order_id, luego, si la
  // orden vive en otro tenant, re-fetcheamos con el token del store.
  let payment
  try {
    payment = await getPayment(paymentId)
  } catch (err) {
    console.error('[mp-webhook] getPayment error:', err)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 502 })
  }

  const orderId: string | undefined = payment.metadata?.order_id ?? payment.external_reference
  if (!orderId) {
    console.error('[mp-webhook] No order_id in payment metadata')
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  // ── 3. Lookup orden + estado previo (ANTES del update) ───────────────────
  //
  // Leer estado actual primero permite detectar replay:
  //   - si payment_status ya es 'approved' Y mp_payment_id coincide → idempotent skip
  //   - si payment_status es 'approved' pero distinto mp_payment_id → orden ya
  //     procesada, ignoramos para no doble-disparar stock + emails
  //
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, store_id, payment_status, mp_payment_id')
    .eq('id', orderId)
    .single()

  if (!existingOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const storeId: string = existingOrder.store_id

  // Re-validar con el secret del store (tenant_config) si difiere del global.
  const tenantValid = await validateWebhookSignature(xSignature, xRequestId, dataId, storeId)
  if (!tenantValid) {
    console.warn('[mp-webhook] Invalid tenant signature — rejecting')
    return NextResponse.json({ error: 'Invalid tenant signature' }, { status: 401 })
  }

  const paymentStatusMap: Record<string, string> = {
    approved: 'approved',
    rejected: 'rejected',
    cancelled: 'cancelled',
    refunded: 'refunded',
    in_process: 'in_process',
    in_mediation: 'in_mediation',
    pending: 'pending',
  }
  const mpStatus = payment.status ?? 'pending'
  const newPaymentStatus = paymentStatusMap[mpStatus] ?? 'pending'
  const newOrderStatus = mpStatus === 'approved' ? 'confirmed' : 'pending'

  const wasAlreadyApproved = existingOrder.payment_status === 'approved'
  const transitioningToApproved = !wasAlreadyApproved && newPaymentStatus === 'approved'

  // ── 4. Actualizar orden ───────────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .update({
      payment_status: newPaymentStatus,
      status: newOrderStatus,
      mp_payment_id: String(paymentId),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .select('*, items:order_items(*)')
    .single()

  if (orderError || !order) {
    console.error('[mp-webhook] order update error:', orderError)
    return NextResponse.json({ error: 'Order update failed' }, { status: 500 })
  }

  // ── 5. Side effects SOLO en transición pending → approved ────────────────
  //
  // Idempotencia: si la orden ya estaba approved (replay), NO descontamos
  // stock de nuevo NI volvemos a enviar emails/WhatsApp.
  //
  if (!transitioningToApproved) {
    return NextResponse.json({ received: true, replay: wasAlreadyApproved })
  }

  // 5a. Decrement de stock por variante (en paralelo)
  const stockUpdates = (order.items ?? [])
    .filter((item: { variant_id: string | null; quantity: number }) => item.variant_id)
    .map((item: { variant_id: string; quantity: number }) =>
      supabase.rpc('decrement_variant_stock', {
        variant_id: item.variant_id,
        qty: item.quantity,
      }),
    )

  // 5b. Resolver store_config + marcar carrito como recovered + stock — paralelo
  const [{ data: storeConfig }] = await Promise.all([
    supabase
      .from('store_config')
      .select('*')
      .eq('id', storeId)
      .single(),
    supabase
      .from('abandoned_carts')
      .update({ recovered: true, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .eq('email', order.buyer_email)
      .eq('recovered', false),
    ...stockUpdates,
  ])

  if (!storeConfig) {
    return NextResponse.json({ received: true })
  }

  const store = storeConfig as StoreConfig

  // 5c. Notificaciones (no bloqueantes — si fallan, la orden ya está confirmada)
  await Promise.allSettled([
    sendOrderConfirmation(order, store).catch((err) =>
      console.error('[mp-webhook] email error:', err),
    ),
    sendOrderConfirmationWA(order, store).catch((err) =>
      console.error('[mp-webhook] whatsapp error:', err),
    ),
  ])

  return NextResponse.json({ received: true })
}

// MP también hace GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
