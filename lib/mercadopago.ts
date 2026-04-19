import 'server-only'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createHmac } from 'crypto'
import { formatVariantLabel } from '@/lib/format'
import { getMPAccessToken, getMPWebhookSecret } from '@/lib/tenant-credentials'
import type { CartItem, CheckoutFormData } from '@/types'

// ─── Client factory (per-store, no singleton) ─────────────────────────────────
//
// En multi-tenant cada store puede tener su propio MP_ACCESS_TOKEN.
// Creamos el cliente fresh por request usando las credenciales del store.
// La instancia es liviana, el overhead es mínimo.

async function getMPClient(storeId: string): Promise<MercadoPagoConfig> {
  const accessToken = await getMPAccessToken(storeId)
  if (!accessToken) throw new Error('[mp] MP_ACCESS_TOKEN no configurado')
  return new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } })
}

// ─── Create preference ────────────────────────────────────────────────────────

export interface CreatePreferenceParams {
  orderId: string
  items: CartItem[]
  buyer: CheckoutFormData
  shippingAmount: number
  discountAmount: number
  /** store_id para resolver credenciales del tenant */
  storeId: string
  /** Moneda ISO 4217 del store (ej: 'ARS', 'USD'). Default: 'ARS' */
  currency?: string
  /** URL base del store para back_urls y webhook (ej: 'https://ona.vendly.com') */
  baseUrl?: string
}

export async function createPreference(params: CreatePreferenceParams) {
  const {
    orderId, items, buyer, shippingAmount,
    storeId, currency = 'ARS', baseUrl,
  } = params

  const resolvedBaseUrl = baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL!
  const client = await getMPClient(storeId)
  const preference = new Preference(client)

  const body = {
    external_reference: orderId,
    items: items.map((item) => ({
      id: item.product_id,
      title: item.variant
        ? `${item.product.name} — ${formatVariantLabel(item.variant.attributes)}`
        : item.product.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: currency,
      picture_url: item.product.images[0] ?? undefined,
    })),
    payer: {
      name: buyer.full_name,
      email: buyer.email,
      phone: { number: buyer.phone },
      address: {
        street_name: buyer.street,
        zip_code: buyer.zip,
      },
    },
    back_urls: {
      success: `${resolvedBaseUrl}/orden/${orderId}?status=approved`,
      failure: `${resolvedBaseUrl}/orden/${orderId}?status=rejected`,
      pending: `${resolvedBaseUrl}/orden/${orderId}?status=pending`,
    },
    auto_return: 'approved' as const,
    notification_url: `${resolvedBaseUrl}/api/webhooks/mp`,
    shipments: shippingAmount > 0
      ? { cost: shippingAmount, mode: 'not_specified' as const }
      : undefined,
    metadata: { order_id: orderId },
  }

  const result = await preference.create({ body })
  return {
    preference_id: result.id!,
    init_point: result.init_point!,
    sandbox_init_point: result.sandbox_init_point!,
  }
}

// ─── Get payment details ──────────────────────────────────────────────────────
//
// getPayment se llama desde el webhook ANTES de conocer el store.
// Intentamos con el token del store si storeId está disponible, si no
// usamos el env var global (compatible con escenarios donde todos los stores
// comparten la misma cuenta MP).

export async function getPayment(paymentId: string, storeId?: string) {
  let client: MercadoPagoConfig
  if (storeId) {
    client = await getMPClient(storeId)
  } else {
    const token = process.env.MP_ACCESS_TOKEN
    if (!token) throw new Error('[mp] MP_ACCESS_TOKEN no configurado')
    client = new MercadoPagoConfig({ accessToken: token, options: { timeout: 5000 } })
  }
  const payment = new Payment(client)
  return payment.get({ id: paymentId })
}

// ─── Validate webhook signature ───────────────────────────────────────────────
//
// La firma del webhook se valida con el secret global o del store.
// Se llama antes de conocer el store, así que soporta ambos modos:
// - storeId disponible → usa el secret del tenant_config si existe
// - sin storeId → usa MP_WEBHOOK_SECRET del env (multi-store comparten endpoint)

export async function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  storeId?: string,
): Promise<boolean> {
  const secret = storeId
    ? await getMPWebhookSecret(storeId)
    : process.env.MP_WEBHOOK_SECRET

  if (!secret || !xSignature || !xRequestId) return false

  const parts: Record<string, string> = {}
  xSignature.split(',').forEach((part) => {
    const [key, value] = part.trim().split('=')
    if (key && value) parts[key] = value
  })

  const { ts, v1 } = parts
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expectedHash = createHmac('sha256', secret).update(manifest).digest('hex')
  return expectedHash === v1
}
