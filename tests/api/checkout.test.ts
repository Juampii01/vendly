/**
 * Tests del endpoint POST /api/checkout.
 *
 * Cubrimos los paths que tocan plata o seguridad multi-tenant:
 *   - Happy path: orden creada con totales correctos
 *   - Validación de input
 *   - Cross-tenant: variantes de otro store no se aceptan
 *   - Stock insuficiente
 *   - Variant ownership: variant.product_id debe matchear item.product_id
 *   - Price tampering: el server ignora unit_price del cliente y usa DB
 *   - Cupones: percentage + fixed + expirado + max_uses agotado
 *   - Race condition de cupón: optimistic lock bumpea uses_count
 *   - Free shipping threshold
 *   - Falla de MP: 502, sin orden huérfana sin preference_id
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSupabaseMock, type SupabaseMock } from '../helpers/supabase-mock'
import {
  STORE_A, productRow, variantRow, storeConfigRow, couponRow, cartItem, buyer,
} from '../helpers/fixtures'

// ─── Mocks de módulos importados por la route ──────────────────────────────

let supabase: SupabaseMock
let createPreferenceMock: ReturnType<typeof vi.fn>

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => supabase.client,
  // createClient existe pero la route usa solo createServiceClient.
  createClient: () => supabase.client,
}))

vi.mock('@/lib/tenant', () => ({
  getStoreId: vi.fn(async () => STORE_A),
}))

vi.mock('@/lib/mercadopago', () => ({
  createPreference: (...args: unknown[]) => createPreferenceMock(...args),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

async function callCheckout(body: unknown) {
  // Importamos lazy para que los vi.mock arriba se apliquen antes
  const { POST } = await import('@/app/api/checkout/route')
  const req = new Request('http://test.vendly.com/api/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  // NextRequest es un wrapper compatible con Request — el cast funciona porque
  // la route solo usa req.json()
  const res = await POST(req as unknown as import('next/server').NextRequest)
  return { status: res.status, body: await res.json() as { data: unknown; error: string | null } }
}

function scriptHappyPathDeps(sb: SupabaseMock, opts: {
  product?: ReturnType<typeof productRow>
  variant?: ReturnType<typeof variantRow> | null
  storeConfig?: ReturnType<typeof storeConfigRow>
  coupon?: ReturnType<typeof couponRow> | null
  customerId?: string
} = {}) {
  const product = opts.product ?? productRow()
  const variant = opts.variant === null ? null : (opts.variant ?? variantRow())
  const storeConfig = opts.storeConfig ?? storeConfigRow()
  const customerId = opts.customerId ?? 'cust-1'

  sb.scriptResponse('products', 'select', { data: [product], error: null })
  if (variant) {
    sb.scriptResponse('product_variants', 'select', { data: [variant], error: null })
  }
  sb.scriptResponse('store_config', 'select', { data: storeConfig, error: null })
  sb.scriptResponse('coupons', 'select', { data: opts.coupon ?? null, error: null })
  sb.scriptResponse('customers', 'upsert', { data: { id: customerId }, error: null })
  sb.scriptResponse('orders', 'insert', { data: null, error: null })
  sb.scriptResponse('order_items', 'insert', { data: null, error: null })
  sb.scriptResponse('abandoned_carts', 'update', { data: null, error: null })
  sb.scriptResponse('orders', 'update', { data: null, error: null })
}

beforeEach(() => {
  supabase = createSupabaseMock()
  createPreferenceMock = vi.fn(async () => ({
    preference_id: 'PREF-123',
    init_point: 'https://mp.com/pay/PREF-123',
    sandbox_init_point: 'https://mp.com/sandbox/PREF-123',
  }))
})

// ════════════════════════════════════════════════════════════════════════════
// Validación de input
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/checkout — validación', () => {
  it('400 si el body no es JSON válido', async () => {
    const res = await callCheckout('{not json')
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/json/i)
  })

  it('400 si no hay items', async () => {
    const res = await callCheckout({ items: [], buyer: buyer(), session_id: 's1' })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/missing/i)
  })

  it('400 si falta email del buyer', async () => {
    const res = await callCheckout({
      items: [cartItem()],
      buyer: { ...buyer(), email: '' },
      session_id: 's1',
    })
    expect(res.status).toBe(400)
  })

  it('400 si quantity no es entero positivo', async () => {
    scriptHappyPathDeps(supabase)
    const res = await callCheckout({
      items: [cartItem({ quantity: 0 })],
      buyer: buyer(),
      session_id: 's1',
    })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/quantity/i)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Happy path
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/checkout — happy path', () => {
  it('crea orden, devuelve init_point + preference_id + order_id', async () => {
    scriptHappyPathDeps(supabase)

    const res = await callCheckout({
      items: [cartItem({ quantity: 2 })],
      buyer: buyer(),
      session_id: 's-happy',
    })

    expect(res.status).toBe(200)
    expect(res.body.error).toBeNull()
    expect(res.body.data).toMatchObject({
      preference_id: 'PREF-123',
      // En NODE_ENV=test el route devuelve sandbox_init_point (no es 'production')
      init_point: 'https://mp.com/sandbox/PREF-123',
      order_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
    })
    expect(createPreferenceMock).toHaveBeenCalledTimes(1)
  })

  it('IGNORA unit_price del cliente — usa el precio real de la DB', async () => {
    // El cliente envía unit_price: 1 (trampa). DB dice price: 19500.
    // El order debe registrarse con subtotal = 19500 * 2 = 39000, no 1*2.
    scriptHappyPathDeps(supabase, {
      product: productRow({ price: 19500 }),
      variant: variantRow({ price_override: null, stock: 10 }),
    })

    const res = await callCheckout({
      items: [cartItem({ quantity: 2, unit_price: 1 })],
      buyer: buyer(),
      session_id: 's-tamper',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    expect(orderInsert.payload).toMatchObject({
      subtotal: 39000,
      // 39000 + shipping (2500, threshold es 30000 — pero subtotal >= threshold → free)
      shipping_amount: 0,
      total: 39000,
    })
    // Y los items también con el precio correcto
    const itemsInsert = supabase.callsFor('order_items', 'insert')[0]
    expect(itemsInsert.payload).toMatchObject([
      expect.objectContaining({ unit_price: 19500, subtotal: 39000 }),
    ])
  })

  it('aplica shipping cuando subtotal está debajo del free_shipping_threshold', async () => {
    // 19500 * 1 = 19500 < threshold 30000 → debería cobrar shipping
    scriptHappyPathDeps(supabase)

    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      session_id: 's-ship',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    expect(orderInsert.payload).toMatchObject({
      subtotal: 19500,
      shipping_amount: 2500,
      total: 22000,
    })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Multi-tenant isolation
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/checkout — multi-tenant isolation', () => {
  it('400 si el product_id no pertenece al store actual', async () => {
    // El SELECT products filtra por store_id, así que un producto de otro
    // store no aparece en la respuesta → productPriceMap.has() falla.
    // (products.select y product_variants.select corren en Promise.all,
    // así que ambos se ejecutan aunque products devuelva vacío.)
    supabase.scriptResponse('products', 'select', { data: [], error: null })
    supabase.scriptResponse('product_variants', 'select', { data: [], error: null })

    const res = await callCheckout({
      items: [cartItem()],
      buyer: buyer(),
      session_id: 's-xt',
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Producto no disponible/i)
    // Asegurarnos de que NO se intentó crear orden ni preferencia MP
    expect(supabase.callsFor('orders', 'insert')).toHaveLength(0)
    expect(createPreferenceMock).not.toHaveBeenCalled()
  })

  it('400 si la variant_id es de otro store (filtro JOIN store_id)', async () => {
    // El SELECT product_variants tiene join `products!inner(store_id)` con
    // .eq('products.store_id', storeId). Una variant de otro store no aparece.
    supabase.scriptResponse('products', 'select', { data: [productRow()], error: null })
    supabase.scriptResponse('product_variants', 'select', { data: [], error: null })

    const res = await callCheckout({
      items: [cartItem()],
      buyer: buyer(),
      session_id: 's-xt-v',
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/Variante no disponible/i)
    expect(supabase.callsFor('orders', 'insert')).toHaveLength(0)
  })

  it('400 si la variant declara un product_id distinto al del item', async () => {
    // Cliente envía item.product_id = p-rem-001, pero variant_id pertenece
    // a otro producto (p-rem-002). Esto es un intento de mezclar precios.
    supabase.scriptResponse('products', 'select', { data: [productRow({ id: 'p-rem-001' })], error: null })
    supabase.scriptResponse('product_variants', 'select', {
      data: [variantRow({ id: 'v-rem-001-m', product_id: 'p-rem-002' })],
      error: null,
    })

    const res = await callCheckout({
      items: [cartItem()],
      buyer: buyer(),
      session_id: 's-mix',
    })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/no pertenece al producto/i)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Stock
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/checkout — stock', () => {
  it('409 si quantity > stock de la variant', async () => {
    supabase.scriptResponse('products', 'select', { data: [productRow()], error: null })
    supabase.scriptResponse('product_variants', 'select', {
      data: [variantRow({ stock: 1 })],
      error: null,
    })

    const res = await callCheckout({
      items: [cartItem({ quantity: 5 })],
      buyer: buyer(),
      session_id: 's-stock',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/stock insuficiente/i)
    expect(supabase.callsFor('orders', 'insert')).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Cupones
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/checkout — cupones', () => {
  it('aplica descuento percentage correctamente', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ type: 'percentage', value: 10 }),
    })
    // Optimistic lock — el bump del uses_count tiene éxito en el primer intento
    supabase.scriptResponse('coupons', 'update', { data: { id: 'cpn-1' }, error: null })

    const res = await callCheckout({
      items: [cartItem({ quantity: 2 })],   // subtotal 39000
      buyer: buyer(),
      coupon_code: 'WELCOME10',
      session_id: 's-cup-pct',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    // 10% de 39000 = 3900
    expect(orderInsert.payload).toMatchObject({
      subtotal: 39000,
      discount_amount: 3900,
      coupon_code: 'WELCOME10',
    })
  })

  it('aplica descuento fixed capeado al subtotal', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ type: 'fixed', value: 50000, code: 'BIGOFF' }),
    })
    supabase.scriptResponse('coupons', 'update', { data: { id: 'cpn-1' }, error: null })

    // Subtotal = 19500, cupón fijo $50000 → descuento debe ser 19500 (capeado)
    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      coupon_code: 'BIGOFF',
      session_id: 's-cup-fix',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    expect(orderInsert.payload).toMatchObject({
      discount_amount: 19500,
    })
  })

  it('IGNORA cupón expirado (orden se crea sin descuento, sin error)', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ expires_at: '2020-01-01T00:00:00Z' }),
    })

    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      coupon_code: 'WELCOME10',
      session_id: 's-cup-exp',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    expect(orderInsert.payload).toMatchObject({
      discount_amount: 0,
      coupon_code: null,
    })
    // No se debe haber tocado el uses_count
    expect(supabase.callsFor('coupons', 'update')).toHaveLength(0)
  })

  it('IGNORA cupón con max_uses agotado', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ max_uses: 5, uses_count: 5 }),
    })

    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      coupon_code: 'WELCOME10',
      session_id: 's-cup-out',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    expect(orderInsert.payload).toMatchObject({
      discount_amount: 0,
      coupon_code: null,
    })
  })

  it('IGNORA cupón si subtotal < min_order_amount', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ min_order_amount: 100000 }),
    })

    // Subtotal 19500 < min 100000
    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      coupon_code: 'WELCOME10',
      session_id: 's-cup-min',
    })

    expect(res.status).toBe(200)
    const orderInsert = supabase.callsFor('orders', 'insert')[0]
    expect(orderInsert.payload).toMatchObject({ discount_amount: 0 })
  })

  it('race condition: optimistic lock falla 1ª vez, retry exitoso', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ max_uses: 10, uses_count: 3 }),
    })
    // 1er UPDATE optimistic lock → null (otra request ganó la carrera)
    supabase.scriptResponse('coupons', 'update', { data: null, error: null })
    // SELECT refresh → uses_count subió a 4 pero max_uses es 10 → still usable
    supabase.scriptResponse('coupons', 'select', {
      data: { uses_count: 4, max_uses: 10 }, error: null,
    })
    // 2do UPDATE optimistic lock → éxito
    supabase.scriptResponse('coupons', 'update', { data: { id: 'cpn-1' }, error: null })

    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      coupon_code: 'WELCOME10',
      session_id: 's-race-ok',
    })

    expect(res.status).toBe(200)
    expect(supabase.callsFor('coupons', 'update')).toHaveLength(2)
  })

  it('race condition: optimistic lock falla y refresh muestra agotado → 409', async () => {
    scriptHappyPathDeps(supabase, {
      coupon: couponRow({ max_uses: 5, uses_count: 4 }),
    })
    // UPDATE optimistic lock → null
    supabase.scriptResponse('coupons', 'update', { data: null, error: null })
    // Refresh muestra que ya se agotó (otra request usó el último)
    supabase.scriptResponse('coupons', 'select', {
      data: { uses_count: 5, max_uses: 5 }, error: null,
    })

    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      coupon_code: 'WELCOME10',
      session_id: 's-race-gone',
    })

    expect(res.status).toBe(409)
    expect(res.body.error).toMatch(/no está disponible/i)
    // No se debe haber creado la orden
    expect(supabase.callsFor('orders', 'insert')).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Falla de MercadoPago
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/checkout — falla de MP', () => {
  it('502 si createPreference tira error (la orden YA fue creada en DB)', async () => {
    scriptHappyPathDeps(supabase)
    createPreferenceMock = vi.fn(async () => { throw new Error('MP timeout') })

    const res = await callCheckout({
      items: [cartItem({ quantity: 1 })],
      buyer: buyer(),
      session_id: 's-mp-fail',
    })

    expect(res.status).toBe(502)
    expect(res.body.error).toMatch(/mercado pago/i)
    // La orden quedó creada (con payment_status pending) — el cliente puede
    // re-intentar. Esto está documentado en el comportamiento del endpoint.
    expect(supabase.callsFor('orders', 'insert')).toHaveLength(1)
    // Pero NO se updateó el mp_preference_id porque MP falló
    expect(supabase.callsFor('orders', 'update')).toHaveLength(0)
  })
})
