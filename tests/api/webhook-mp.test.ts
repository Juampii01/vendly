/**
 * Tests del endpoint POST /api/webhooks/mp.
 *
 * Cubrimos los paths críticos del webhook de MercadoPago. La idempotencia es
 * la pieza más crítica: si MP reenvía el mismo evento (replay), NO podemos
 * decrementar stock dos veces ni mandar el email/whatsapp duplicado.
 *
 * Cobertura:
 *   - Validación de input (JSON inválido, missing payment id)
 *   - Firma HMAC: global válida/inválida + tenant válida/inválida
 *   - Tipo de evento: solo 'payment' procesa, otros tipos retornan {received:true}
 *   - Lookup: order not found → 404
 *   - Status mapping: approved/rejected/in_process/unknown
 *   - Idempotencia: orden ya approved → no stock decrement, no emails (replay)
 *   - Transición pending → approved: decrementa stock por variante,
 *     marca abandoned_cart como recovered, manda email+whatsapp
 *   - getPayment falla → 502
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSupabaseMock, type SupabaseMock } from '../helpers/supabase-mock'

// ─── Mocks de módulos importados por la route ──────────────────────────────

let supabase: SupabaseMock
let getPaymentMock: ReturnType<typeof vi.fn>
let validateSignatureMock: ReturnType<typeof vi.fn>
let sendEmailMock: ReturnType<typeof vi.fn>
let sendWhatsAppMock: ReturnType<typeof vi.fn>

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => supabase.client,
  createClient: () => supabase.client,
}))

vi.mock('@/lib/mercadopago', () => ({
  getPayment: (...args: unknown[]) => getPaymentMock(...args),
  validateWebhookSignature: (...args: unknown[]) => validateSignatureMock(...args),
}))

vi.mock('@/lib/resend', () => ({
  sendOrderConfirmation: (...args: unknown[]) => sendEmailMock(...args),
}))

vi.mock('@/lib/whatsapp', () => ({
  sendOrderConfirmationWA: (...args: unknown[]) => sendWhatsAppMock(...args),
}))

// ─── Helpers ────────────────────────────────────────────────────────────────

const STORE_A = 'store-a-uuid'
const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000'

async function callWebhook(opts: {
  body: unknown
  signature?: string | null
  requestId?: string | null
}) {
  const { POST } = await import('@/app/api/webhooks/mp/route')
  const headers = new Headers({ 'content-type': 'application/json' })
  if (opts.signature !== null) headers.set('x-signature', opts.signature ?? 'ts=1,v1=abc')
  if (opts.requestId !== null) headers.set('x-request-id', opts.requestId ?? 'req-123')

  const req = new Request('http://test.vendly.com/api/webhooks/mp', {
    method: 'POST',
    headers,
    body: typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body),
  })
  const res = await POST(req as unknown as import('next/server').NextRequest)
  return { status: res.status, body: await res.json() }
}

const mpPaymentBody = (over: Partial<{ id: number; type: string; data_id: string }> = {}) => ({
  id: 12345,
  live_mode: true,
  type: over.type ?? 'payment',
  date_created: '2026-05-08T00:00:00Z',
  user_id: 'user-1',
  api_version: 'v1',
  action: 'payment.updated',
  data: { id: over.data_id ?? 'pay-12345' },
  ...over,
})

const mpPayment = (over: Partial<{
  status: string; metadata: { order_id?: string }; external_reference?: string; id?: string
}> = {}) => ({
  id: 'pay-12345',
  status: 'approved',
  metadata: { order_id: ORDER_ID },
  external_reference: ORDER_ID,
  ...over,
})

const orderRow = (over: Partial<{
  payment_status: string; mp_payment_id: string | null; store_id: string
}> = {}) => ({
  id: ORDER_ID,
  store_id: STORE_A,
  payment_status: 'pending',
  mp_payment_id: null,
  ...over,
})

const fullOrderRow = (over: Partial<{
  buyer_email: string; payment_status: string; items: unknown[]
}> = {}) => ({
  id: ORDER_ID,
  store_id: STORE_A,
  buyer_email: 'juan@test.com',
  payment_status: 'approved',
  total: 21500,
  items: over.items ?? [
    { id: 'oi-1', variant_id: 'v-rem-001-m', quantity: 2 },
    { id: 'oi-2', variant_id: 'v-rem-001-l', quantity: 1 },
  ],
  ...over,
})

const storeConfigFull = () => ({
  id: STORE_A,
  name: 'Spriovani',
  email: 'hola@spriovani.com',
  whatsapp_number: '5491144556677',
  color_primary: '#0A0A0A',
})

beforeEach(() => {
  supabase = createSupabaseMock()
  validateSignatureMock = vi.fn(async () => true)
  getPaymentMock = vi.fn(async () => mpPayment())
  sendEmailMock = vi.fn(async () => {})
  sendWhatsAppMock = vi.fn(async () => {})
})

// ════════════════════════════════════════════════════════════════════════════
// Validación de input
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/webhooks/mp — validación', () => {
  it('400 si el body no es JSON válido', async () => {
    const res = await callWebhook({ body: '{not json' })
    expect(res.status).toBe(400)
  })

  it('200 con received:true si el type no es "payment"', async () => {
    const res = await callWebhook({ body: mpPaymentBody({ type: 'merchant_order' }) })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true })
    // No debe haber consultado MP ni la DB
    expect(getPaymentMock).not.toHaveBeenCalled()
  })

  it('400 si data.id está vacío en evento de payment', async () => {
    const res = await callWebhook({ body: mpPaymentBody({ data_id: '' }) })
    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/missing payment id/i)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Firma HMAC (autenticación)
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/webhooks/mp — firma HMAC', () => {
  it('401 si la firma global es inválida (rechaza antes de tocar DB)', async () => {
    validateSignatureMock = vi.fn(async () => false)

    const res = await callWebhook({ body: mpPaymentBody() })
    expect(res.status).toBe(401)
    // No tocó DB ni MP
    expect(getPaymentMock).not.toHaveBeenCalled()
    expect(supabase.callsFor('orders', 'select')).toHaveLength(0)
  })

  it('401 si la firma del tenant es inválida (después del lookup)', async () => {
    // Global pasa, tenant falla
    validateSignatureMock = vi
      .fn()
      .mockResolvedValueOnce(true)   // global
      .mockResolvedValueOnce(false)  // tenant

    supabase.scriptResponse('orders', 'select', { data: orderRow(), error: null })

    const res = await callWebhook({ body: mpPaymentBody() })
    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/tenant signature/i)
    // El order update no se debe haber disparado
    expect(supabase.callsFor('orders', 'update')).toHaveLength(0)
  })

  it('SIN signature header → rechaza (401)', async () => {
    // validateWebhookSignature recibe null y devuelve false
    validateSignatureMock = vi.fn(async (sig) => sig !== null)

    const res = await callWebhook({ body: mpPaymentBody(), signature: null })
    expect(res.status).toBe(401)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Lookup de orden + getPayment
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/webhooks/mp — lookup', () => {
  it('502 si getPayment tira (probablemente timeout/red)', async () => {
    getPaymentMock = vi.fn(async () => { throw new Error('MP timeout') })

    const res = await callWebhook({ body: mpPaymentBody() })
    expect(res.status).toBe(502)
    expect(res.body.error).toMatch(/failed to fetch/i)
  })

  it('200 con received:true si payment.metadata.order_id está vacío', async () => {
    getPaymentMock = vi.fn(async () => mpPayment({ metadata: {}, external_reference: undefined }))

    const res = await callWebhook({ body: mpPaymentBody() })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ received: true })
    // No tocamos orders en DB
    expect(supabase.callsFor('orders', 'select')).toHaveLength(0)
  })

  it('404 si la orden no existe en DB', async () => {
    supabase.scriptResponse('orders', 'select', { data: null, error: null })

    const res = await callWebhook({ body: mpPaymentBody() })
    expect(res.status).toBe(404)
    expect(res.body.error).toMatch(/order not found/i)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Status mapping
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/webhooks/mp — status mapping', () => {
  function setupSuccessFlow(over: { paymentStatus: string }) {
    getPaymentMock = vi.fn(async () => mpPayment({ status: over.paymentStatus }))
    supabase.scriptResponse('orders', 'select', { data: orderRow(), error: null })
    supabase.scriptResponse('orders', 'update', { data: fullOrderRow({ payment_status: over.paymentStatus }), error: null })
    // Side effects (solo los corre si transitionsToApproved)
    supabase.scriptResponse('store_config', 'select', { data: storeConfigFull(), error: null })
    supabase.scriptResponse('abandoned_carts', 'update', { data: null, error: null })
    supabase.scriptResponse('decrement_variant_stock', 'rpc', { data: null, error: null }, { sticky: true })
  }

  it('approved → payment_status:approved, status:confirmed', async () => {
    setupSuccessFlow({ paymentStatus: 'approved' })

    const res = await callWebhook({ body: mpPaymentBody() })
    expect(res.status).toBe(200)

    const orderUpdate = supabase.callsFor('orders', 'update')[0]
    expect(orderUpdate.payload).toMatchObject({
      payment_status: 'approved',
      status: 'confirmed',
      mp_payment_id: 'pay-12345',
    })
  })

  it('rejected → payment_status:rejected, status:pending (no confirmamos)', async () => {
    setupSuccessFlow({ paymentStatus: 'rejected' })

    await callWebhook({ body: mpPaymentBody() })

    const orderUpdate = supabase.callsFor('orders', 'update')[0]
    expect(orderUpdate.payload).toMatchObject({
      payment_status: 'rejected',
      status: 'pending',
    })
  })

  it('in_process → payment_status:in_process, status:pending', async () => {
    setupSuccessFlow({ paymentStatus: 'in_process' })

    await callWebhook({ body: mpPaymentBody() })

    const orderUpdate = supabase.callsFor('orders', 'update')[0]
    expect(orderUpdate.payload).toMatchObject({
      payment_status: 'in_process',
      status: 'pending',
    })
  })

  it('status desconocido → fallback a payment_status:pending', async () => {
    setupSuccessFlow({ paymentStatus: 'estado_raro_de_mp' })

    await callWebhook({ body: mpPaymentBody() })

    const orderUpdate = supabase.callsFor('orders', 'update')[0]
    expect(orderUpdate.payload).toMatchObject({ payment_status: 'pending' })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Idempotencia (la pieza crítica)
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/webhooks/mp — idempotencia (replay-safe)', () => {
  it('orden YA approved + nuevo evento approved → no decrementa stock, no manda email, returns replay:true', async () => {
    // Setup: la orden ya estaba approved (replay)
    supabase.scriptResponse('orders', 'select', {
      data: orderRow({ payment_status: 'approved', mp_payment_id: 'pay-12345' }),
      error: null,
    })
    supabase.scriptResponse('orders', 'update', {
      data: fullOrderRow({ payment_status: 'approved' }),
      error: null,
    })

    const res = await callWebhook({ body: mpPaymentBody() })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ received: true, replay: true })

    // Lo crítico: NADA de side effects
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(sendWhatsAppMock).not.toHaveBeenCalled()
    // No se llamó al RPC de stock
    const stockCalls = supabase.callsFor('decrement_variant_stock', 'rpc')
    expect(stockCalls).toHaveLength(0)
    // No se tocó abandoned_carts
    expect(supabase.callsFor('abandoned_carts', 'update')).toHaveLength(0)
  })

  it('transición pending → approved: decrementa stock por variant, marca abandoned_cart, manda email+whatsapp', async () => {
    supabase.scriptResponse('orders', 'select', { data: orderRow({ payment_status: 'pending' }), error: null })
    supabase.scriptResponse('orders', 'update', { data: fullOrderRow(), error: null })
    supabase.scriptResponse('store_config', 'select', { data: storeConfigFull(), error: null })
    supabase.scriptResponse('abandoned_carts', 'update', { data: null, error: null })
    supabase.scriptResponse('decrement_variant_stock', 'rpc', { data: null, error: null }, { sticky: true })

    const res = await callWebhook({ body: mpPaymentBody() })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ received: true })

    // Stock decrementado para cada item con variant_id (2 items en fullOrderRow default)
    const stockCalls = supabase.callsFor('decrement_variant_stock', 'rpc')
    expect(stockCalls).toHaveLength(2)
    expect(stockCalls[0].payload).toMatchObject({ variant_id: 'v-rem-001-m', qty: 2 })
    expect(stockCalls[1].payload).toMatchObject({ variant_id: 'v-rem-001-l', qty: 1 })

    // Abandoned cart marcado como recovered
    expect(supabase.callsFor('abandoned_carts', 'update')).toHaveLength(1)
    expect(supabase.callsFor('abandoned_carts', 'update')[0].payload).toMatchObject({ recovered: true })

    // Notificaciones disparadas
    expect(sendEmailMock).toHaveBeenCalledTimes(1)
    expect(sendWhatsAppMock).toHaveBeenCalledTimes(1)
  })

  it('transición pending → rejected: NO decrementa stock, NO manda emails (no es approved)', async () => {
    getPaymentMock = vi.fn(async () => mpPayment({ status: 'rejected' }))
    supabase.scriptResponse('orders', 'select', { data: orderRow({ payment_status: 'pending' }), error: null })
    supabase.scriptResponse('orders', 'update', {
      data: fullOrderRow({ payment_status: 'rejected' }), error: null,
    })

    await callWebhook({ body: mpPaymentBody() })

    // No side effects en rejected — solo los corre si transitionsToApproved
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(supabase.callsFor('decrement_variant_stock', 'rpc')).toHaveLength(0)
    expect(supabase.callsFor('abandoned_carts', 'update')).toHaveLength(0)
  })

  it('items sin variant_id no disparan decrement_variant_stock (productos sin variantes)', async () => {
    supabase.scriptResponse('orders', 'select', { data: orderRow({ payment_status: 'pending' }), error: null })
    supabase.scriptResponse('orders', 'update', {
      data: fullOrderRow({
        items: [
          { id: 'oi-1', variant_id: null, quantity: 1 },
          { id: 'oi-2', variant_id: 'v-real', quantity: 3 },
        ],
      }),
      error: null,
    })
    supabase.scriptResponse('store_config', 'select', { data: storeConfigFull(), error: null })
    supabase.scriptResponse('abandoned_carts', 'update', { data: null, error: null })
    supabase.scriptResponse('decrement_variant_stock', 'rpc', { data: null, error: null }, { sticky: true })

    await callWebhook({ body: mpPaymentBody() })

    // Solo 1 RPC — el que tiene variant_id
    const stockCalls = supabase.callsFor('decrement_variant_stock', 'rpc')
    expect(stockCalls).toHaveLength(1)
    expect(stockCalls[0].payload).toMatchObject({ variant_id: 'v-real', qty: 3 })
  })
})

// ════════════════════════════════════════════════════════════════════════════
// Errores no fatales en notificaciones
// ════════════════════════════════════════════════════════════════════════════

describe('POST /api/webhooks/mp — robustness', () => {
  it('si email falla, la orden queda confirmada igual (no bloqueante)', async () => {
    sendEmailMock = vi.fn(async () => { throw new Error('Resend down') })
    supabase.scriptResponse('orders', 'select', { data: orderRow({ payment_status: 'pending' }), error: null })
    supabase.scriptResponse('orders', 'update', { data: fullOrderRow(), error: null })
    supabase.scriptResponse('store_config', 'select', { data: storeConfigFull(), error: null })
    supabase.scriptResponse('abandoned_carts', 'update', { data: null, error: null })
    supabase.scriptResponse('decrement_variant_stock', 'rpc', { data: null, error: null }, { sticky: true })

    const res = await callWebhook({ body: mpPaymentBody() })

    // 200 — la orden ya está confirmada en DB, el email no es bloqueante
    expect(res.status).toBe(200)
    // Pero stock SÍ se decrementó (eso pasó antes del email)
    expect(supabase.callsFor('decrement_variant_stock', 'rpc').length).toBeGreaterThan(0)
  })

  it('si store_config no existe (impossible-state), retorna 200 sin tirar', async () => {
    supabase.scriptResponse('orders', 'select', { data: orderRow({ payment_status: 'pending' }), error: null })
    supabase.scriptResponse('orders', 'update', { data: fullOrderRow(), error: null })
    supabase.scriptResponse('store_config', 'select', { data: null, error: null })
    supabase.scriptResponse('abandoned_carts', 'update', { data: null, error: null })
    supabase.scriptResponse('decrement_variant_stock', 'rpc', { data: null, error: null }, { sticky: true })

    const res = await callWebhook({ body: mpPaymentBody() })

    expect(res.status).toBe(200)
    // Sin store_config, no se mandan notificaciones
    expect(sendEmailMock).not.toHaveBeenCalled()
  })
})
