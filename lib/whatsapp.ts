/**
 * WhatsApp Business via 360dialog Cloud API
 * Docs: https://docs.360dialog.com/
 *
 * Usamos template messages aprobadas por Meta.
 * Las plantillas se configuran en el hub de 360dialog.
 *
 * Cada store puede tener sus propias credenciales en tenant_config.
 * Los mensajes de monitor usan el env var global (son alertas de plataforma).
 */

import { formatPrice } from '@/lib/format'
import { getWAApiKey } from '@/lib/tenant-credentials'
import type { Order, AbandonedCart, StoreConfig } from '@/types'

const BASE_URL = 'https://waba.360dialog.io/v1'

// ─── Headers por store ────────────────────────────────────────────────────────

async function getStoreHeaders(storeId: string): Promise<Record<string, string>> {
  const apiKey = await getWAApiKey(storeId)
  if (!apiKey) throw new Error('[whatsapp] WHATSAPP_360DIALOG_API_KEY no configurado')
  return {
    'Content-Type': 'application/json',
    'D360-API-KEY': apiKey,
  }
}

/** Headers para alertas de plataforma (siempre env var global) */
function getDevHeaders(): Record<string, string> | null {
  const apiKey = process.env.WHATSAPP_360DIALOG_API_KEY
  if (!apiKey) return null
  return { 'Content-Type': 'application/json', 'D360-API-KEY': apiKey }
}

// ─── Low-level send ───────────────────────────────────────────────────────────

async function sendTemplate(
  to: string,
  templateName: string,
  languageCode: string,
  components: unknown[],
  headers: Record<string, string>,
) {
  const phone = normalizePhone(to)
  const body = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  }

  const res = await fetch(`${BASE_URL}/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`360dialog error ${res.status}: ${text}`)
  }

  return res.json()
}

// ─── Order confirmation WhatsApp ──────────────────────────────────────────────

/**
 * Template: `order_confirmation`
 * Parámetros (body): {{1}} buyer_name, {{2}} order_id, {{3}} total
 */
export async function sendOrderConfirmationWA(order: Order, store: StoreConfig) {
  if (!order.buyer_phone) return null

  const headers = await getStoreHeaders(store.id)
  // Convertir locale "es-AR" → "es_AR" para WhatsApp
  const langCode = store.locale.replace('-', '_')

  return sendTemplate(order.buyer_phone, 'order_confirmation', langCode, [
    {
      type: 'header',
      parameters: [{ type: 'text', text: store.name }],
    },
    {
      type: 'body',
      parameters: [
        { type: 'text', text: order.buyer_name },
        { type: 'text', text: order.id.slice(0, 8).toUpperCase() },
        { type: 'text', text: formatPrice(order.total, store.currency, store.locale) },
      ],
    },
  ], headers)
}

// ─── Abandoned cart WhatsApp ──────────────────────────────────────────────────

/**
 * Template: `abandoned_cart_recovery`
 * Parámetros (body): {{1}} buyer_name, {{2}} store_name, {{3}} recovery_url
 */
export async function sendAbandonedCartWA(cart: AbandonedCart, store: StoreConfig) {
  if (!cart.phone) return null

  const headers = await getStoreHeaders(store.id)
  // Usar base_url del store si está configurada, fallback a env var
  const storeBaseUrl = store.base_url ?? process.env.NEXT_PUBLIC_BASE_URL!
  const recoveryUrl = `${storeBaseUrl}/checkout?recover=${cart.recovery_token}`
  const langCode = store.locale.replace('-', '_')

  return sendTemplate(cart.phone, 'abandoned_cart_recovery', langCode, [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: cart.buyer_name ?? 'cliente' },
        { type: 'text', text: store.name },
        { type: 'text', text: recoveryUrl },
      ],
    },
    {
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [{ type: 'text', text: cart.recovery_token }],
    },
  ], headers)
}

// ─── Dev Monitor Alerts (plataforma — siempre env var global) ─────────────────

export async function sendMonitorAlert(
  failingChecks: { label: string; message?: string }[],
  baseUrl: string,
): Promise<void> {
  const phone = process.env.DEV_ALERT_PHONE
  const headers = getDevHeaders()
  if (!phone || !headers) return

  const lines = failingChecks
    .map(c => `• *${c.label}*${c.message ? `\n  _${c.message}_` : ''}`)
    .join('\n')

  const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })

  const body =
    `🚨 *Vendly Monitor — ALERTA*\n\n` +
    `${lines}\n\n` +
    `🕐 ${now}\n` +
    `🔗 ${baseUrl}/admin/dev`

  try {
    await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(phone),
        type: 'text',
        text: { body },
      }),
    })
  } catch {
    // No crashear si falla el alerta
  }
}

export async function sendMonitorRecovery(
  recoveredChecks: { label: string }[],
  baseUrl: string,
): Promise<void> {
  const phone = process.env.DEV_ALERT_PHONE
  const headers = getDevHeaders()
  if (!phone || !headers) return

  const lines = recoveredChecks.map(c => `• ${c.label}`).join('\n')
  const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })

  const body =
    `✅ *Vendly Monitor — RECUPERADO*\n\n` +
    `${lines}\n\n` +
    `🕐 ${now}`

  try {
    await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(phone),
        type: 'text',
        text: { body },
      }),
    })
  } catch {
    // silencioso
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Devuelve el número en formato E.164 (solo dígitos, sin `+`).
 *
 * Si el input ya tiene country code (11+ dígitos) o empieza con `+`, lo respeta.
 * Si parece un número AR local (10 dígitos comenzando con `0` o `1[1-9]`),
 * agrega el prefijo 54 — fallback para tiendas legacy AR.
 *
 * Para soportar otros países, los store owners deben guardar el teléfono
 * con country code completo (ej: 5491100000000, 521555000000, 5511900000000).
 */
function normalizePhone(phone: string): string {
  const trimmed = phone.trim()
  // Si viene con `+`, sacamos el `+` y devolvemos los dígitos
  if (trimmed.startsWith('+')) {
    return trimmed.slice(1).replace(/\D/g, '')
  }
  const digits = trimmed.replace(/\D/g, '')
  // Si tiene 11+ dígitos asumimos que ya incluye country code
  if (digits.length >= 11) return digits
  // Fallback AR: 10 dígitos sin country code
  if (digits.startsWith('0')) return `54${digits.slice(1)}`
  return `54${digits}`
}
