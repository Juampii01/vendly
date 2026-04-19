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

  // ── Validar firma ─────────────────────────────────────────────────────────
  // storeId no está disponible aún — validamos con secret global.
  // Para multi-tenant con secrets por store, el storeId se pasa después de
  // resolver la orden. Esta validación previene requests maliciosas antes
  // de cualquier operación costosa.
  const dataId = body.data?.id ?? String(body.id)
  const isValid = await validateWebhookSignature(xSignature, xRequestId, dataId)

  if (!isValid && process.env.MP_WEBHOOK_SECRET) {
    console.warn('[mp-webhook] Invalid signature — ignoring')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (body.type !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment id' }, { status: 400 })
  }

  // ── Obtener detalles del pago desde MP ────────────────────────────────────
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

  // ── Actualizar orden ──────────────────────────────────────────────────────
  //
  // No filtramos por store_id aquí: el orderId es un UUID globalmente único
  // y el webhook de MP no tiene contexto de hostname para resolver el tenant.
  // Obtenemos el store_id del propio registro de la orden.
  //
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
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (mpStatus !== 'approved') {
    return NextResponse.json({ received: true })
  }

  // Resolver store_id desde la orden (multi-tenant safe)
  const storeId: string = order.store_id

  // ── Operaciones post-aprobación en paralelo ───────────────────────────────

  const stockUpdates = (order.items ?? [])
    .filter((item: { variant_id: string | null; quantity: number }) => item.variant_id)
    .map((item: { variant_id: string; quantity: number }) =>
      supabase.rpc('decrement_variant_stock', {
        variant_id: item.variant_id,
        qty: item.quantity,
      }),
    )

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

  // ── Notificaciones en paralelo ────────────────────────────────────────────
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
