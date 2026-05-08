import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { createPreference } from '@/lib/mercadopago'
import { getStoreId } from '@/lib/tenant'
import type { CreateCheckoutPayload, ApiResponse, CreateCheckoutResponse } from '@/types'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  let body: CreateCheckoutPayload

  try {
    body = await req.json()
  } catch {
    return NextResponse.json<ApiResponse>(
      { data: null, error: 'Invalid JSON' },
      { status: 400 },
    )
  }

  const { items, buyer, coupon_code, session_id } = body

  if (!items?.length || !buyer?.email) {
    return NextResponse.json<ApiResponse>(
      { data: null, error: 'Missing items or buyer data' },
      { status: 400 },
    )
  }

  const supabase = createServiceClient()
  const storeId = await getStoreId()

  // ── 1. Re-validar precios + stock + ownership de variantes ──────────────
  //
  // CRÍTICO multi-tenant: las variantes deben pertenecer al store actual.
  // Hacemos JOIN con products para forzar el filtro `products.store_id = storeId`,
  // de lo contrario un cliente malicioso podría enviar variant_id de otro tenant
  // con `price_override` bajísimo.
  //
  const productIds = [...new Set(items.map((i) => i.product_id))]
  const variantIds = [...new Set(items.map((i) => i.variant_id).filter(Boolean) as string[])]

  const [{ data: dbProducts }, { data: dbVariants }] = await Promise.all([
    supabase
      .from('products')
      .select('id, price, is_active')
      .in('id', productIds)
      .eq('store_id', storeId)
      .eq('is_active', true),
    variantIds.length
      ? supabase
          .from('product_variants')
          .select('id, price_override, is_active, stock, product_id, products!inner(store_id)')
          .in('id', variantIds)
          .eq('is_active', true)
          .eq('products.store_id', storeId)
      : Promise.resolve({ data: [] as Array<{
          id: string; price_override: number | null; is_active: boolean; stock: number; product_id: string
        }> }),
  ])

  const productPriceMap = new Map<string, number>(
    (dbProducts ?? []).map((p) => [p.id, Number(p.price)]),
  )
  const variantInfoMap = new Map<string, { price: number | null; stock: number; productId: string }>(
    (dbVariants ?? []).map((v) => [
      v.id,
      {
        price: v.price_override !== null ? Number(v.price_override) : null,
        stock: Number(v.stock ?? 0),
        productId: v.product_id,
      },
    ]),
  )

  for (const item of items) {
    if (!productPriceMap.has(item.product_id)) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: `Producto no disponible: ${item.product_id}` },
        { status: 400 },
      )
    }
    if (item.variant_id) {
      const variantInfo = variantInfoMap.get(item.variant_id)
      if (!variantInfo) {
        return NextResponse.json<ApiResponse>(
          { data: null, error: `Variante no disponible: ${item.variant_id}` },
          { status: 400 },
        )
      }
      // Variant tiene que pertenecer al producto declarado (otro guard)
      if (variantInfo.productId !== item.product_id) {
        return NextResponse.json<ApiResponse>(
          { data: null, error: 'Variante no pertenece al producto' },
          { status: 400 },
        )
      }
      // Stock check: evitar oversell
      if (item.quantity > variantInfo.stock) {
        return NextResponse.json<ApiResponse>(
          { data: null, error: `Stock insuficiente para una variante. Disponible: ${variantInfo.stock}` },
          { status: 409 },
        )
      }
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      return NextResponse.json<ApiResponse>(
        { data: null, error: 'quantity inválido' },
        { status: 400 },
      )
    }
  }

  // Construir items con precios reales — ignorar unit_price del cliente
  const verifiedItems = items.map((item) => {
    const basePrice = productPriceMap.get(item.product_id)!
    const variantOverride = item.variant_id
      ? (variantInfoMap.get(item.variant_id)?.price ?? null)
      : null
    const unitPrice = variantOverride ?? basePrice
    return { ...item, unit_price: unitPrice }
  })

  // ── 2. Calcular totales ──────────────────────────────────────────────────

  const subtotal = verifiedItems.reduce((s, i) => s + i.unit_price * i.quantity, 0)

  const [{ data: storeConfig }, couponResult] = await Promise.all([
    supabase
      .from('store_config')
      .select('free_shipping_threshold, shipping_base_price, currency, base_url')
      .eq('id', storeId)
      .single(),
    coupon_code
      ? supabase
          .from('coupons')
          .select('*')
          .eq('store_id', storeId)
          .ilike('code', coupon_code.trim())
          .eq('is_active', true)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const freeThreshold = storeConfig?.free_shipping_threshold ?? null
  const baseShipping = storeConfig?.shipping_base_price ?? 0
  const shippingAmount =
    freeThreshold !== null && subtotal >= freeThreshold ? 0 : baseShipping

  let discountAmount = 0
  let validatedCoupon = null
  const coupon = couponResult.data
  if (coupon) {
    const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date()
    const withinUseLimit = coupon.max_uses === null || coupon.uses_count < coupon.max_uses
    const meetsMinAmount = coupon.min_order_amount === null || subtotal >= coupon.min_order_amount

    if (notExpired && withinUseLimit && meetsMinAmount) {
      validatedCoupon = coupon
      discountAmount =
        coupon.type === 'percentage'
          ? Math.round((subtotal * coupon.value) / 100)
          : Math.min(coupon.value, subtotal)
    }
  }

  const total = subtotal - discountAmount + shippingAmount

  // ── 3. Upsert customer ──────────────────────────────────────────────────

  const { data: customer } = await supabase
    .from('customers')
    .upsert(
      {
        store_id: storeId,
        email: buyer.email,
        full_name: buyer.full_name,
        phone: buyer.phone || null,
        address_street: buyer.street,
        address_city: buyer.city,
        address_state: buyer.state,
        address_zip: buyer.zip,
        address_country: buyer.country,
      },
      { onConflict: 'store_id,email' },
    )
    .select('id')
    .single()

  // ── 4. Reservar el cupón atómicamente ANTES de crear la orden ────────────
  //
  // Race condition: dos checkouts simultáneos pueden leer el mismo `uses_count`
  // y ambos pasar el chequeo de `max_uses`. Lo resolvemos con un UPDATE
  // condicional que solo acepta el incremento si no superamos el límite.
  //
  if (validatedCoupon) {
    const { data: bumped } = await supabase
      .from('coupons')
      .update({ uses_count: validatedCoupon.uses_count + 1 })
      .eq('id', validatedCoupon.id)
      .eq('uses_count', validatedCoupon.uses_count) // optimistic lock
      .select('id')
      .maybeSingle()

    if (!bumped) {
      // Otra request ganó la carrera o el cupón ya alcanzó el max_uses.
      // Re-leemos para confirmar y re-calcular.
      const { data: refreshed } = await supabase
        .from('coupons')
        .select('uses_count, max_uses')
        .eq('id', validatedCoupon.id)
        .single()
      const stillUsable = refreshed && (refreshed.max_uses === null || refreshed.uses_count < refreshed.max_uses)
      if (!stillUsable) {
        return NextResponse.json<ApiResponse>(
          { data: null, error: 'El cupón ya no está disponible' },
          { status: 409 },
        )
      }
      // Si quedan usos, reintentar una vez con el conteo actualizado
      const { data: retry } = await supabase
        .from('coupons')
        .update({ uses_count: refreshed.uses_count + 1 })
        .eq('id', validatedCoupon.id)
        .eq('uses_count', refreshed.uses_count)
        .select('id')
        .maybeSingle()
      if (!retry) {
        return NextResponse.json<ApiResponse>(
          { data: null, error: 'Conflicto en el cupón. Intentá de nuevo.' },
          { status: 409 },
        )
      }
    }
  }

  // ── 5. Crear orden + items ──────────────────────────────────────────────

  const orderId = randomUUID()

  const orderItems = verifiedItems.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product.name,
    variant_label: item.variant
      ? Object.entries(item.variant.attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' / ')
      : null,
    product_image: item.product.images[0] ?? null,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.unit_price * item.quantity,
  }))

  const { error: orderError } = await supabase.from('orders').insert({
    id: orderId,
    store_id: storeId,
    customer_id: customer?.id ?? null,
    buyer_name: buyer.full_name,
    buyer_email: buyer.email,
    buyer_phone: buyer.phone || null,
    shipping_street: buyer.street,
    shipping_city: buyer.city,
    shipping_state: buyer.state,
    shipping_zip: buyer.zip,
    shipping_country: buyer.country,
    subtotal,
    discount_amount: discountAmount,
    shipping_amount: shippingAmount,
    total,
    coupon_code: validatedCoupon?.code ?? null,
    status: 'pending',
    payment_status: 'pending',
    notes: buyer.notes || null,
  })

  if (orderError) {
    console.error('[checkout] order insert error:', orderError)
    // Rollback del cupón reservado
    if (validatedCoupon) {
      await supabase
        .from('coupons')
        .update({ uses_count: validatedCoupon.uses_count })
        .eq('id', validatedCoupon.id)
    }
    return NextResponse.json<ApiResponse>(
      { data: null, error: 'Error al crear la orden' },
      { status: 500 },
    )
  }

  await Promise.all([
    supabase.from('order_items').insert(orderItems),
    session_id
      ? supabase
          .from('abandoned_carts')
          .update({ updated_at: new Date().toISOString() })
          .eq('store_id', storeId)
          .eq('session_id', session_id)
          .eq('recovered', false)
      : Promise.resolve(),
  ])

  // ── 6. Crear preferencia en MercadoPago ─────────────────────────────────

  let mpResult: { preference_id: string; init_point: string; sandbox_init_point: string }

  try {
    mpResult = await createPreference({
      orderId,
      items: verifiedItems,
      buyer,
      shippingAmount,
      discountAmount,
      storeId,
      currency: storeConfig?.currency ?? 'ARS',
      baseUrl: storeConfig?.base_url ?? process.env.NEXT_PUBLIC_BASE_URL,
    })
  } catch (err) {
    console.error('[checkout] MP preference error:', err)
    return NextResponse.json<ApiResponse>(
      { data: null, error: 'Error al conectar con Mercado Pago. Intentá de nuevo.' },
      { status: 502 },
    )
  }

  await supabase
    .from('orders')
    .update({ mp_preference_id: mpResult.preference_id })
    .eq('id', orderId)

  const responseData: CreateCheckoutResponse = {
    init_point:
      process.env.NODE_ENV === 'production'
        ? mpResult.init_point
        : mpResult.sandbox_init_point,
    preference_id: mpResult.preference_id,
    order_id: orderId,
  }

  return NextResponse.json<ApiResponse<CreateCheckoutResponse>>({
    data: responseData,
    error: null,
  })
}
