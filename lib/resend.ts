import { Resend } from 'resend'
import { createElement } from 'react'
import { OrderConfirmation } from '@/emails/OrderConfirmation'
import { AbandonedCart as AbandonedCartEmail } from '@/emails/AbandonedCart'
import { Reactivation } from '@/emails/Reactivation'
import { getResendApiKey, getResendFromDomain } from '@/lib/tenant-credentials'
import type { Order, AbandonedCart, StoreConfig } from '@/types'

// ─── Client factory (per-store) ───────────────────────────────────────────────
//
// Cada store puede tener su propio RESEND_API_KEY en tenant_config.
// Creamos el cliente fresh usando las credenciales del store.

async function getResendClient(storeId: string): Promise<Resend> {
  const apiKey = await getResendApiKey(storeId)
  if (!apiKey) throw new Error('[resend] RESEND_API_KEY no configurado')
  return new Resend(apiKey)
}

async function fromAddress(store: StoreConfig): Promise<string> {
  const domain = await getResendFromDomain(store.id)
  return `${store.name} <noreply@${domain}>`
}

// ─── Send order confirmation ──────────────────────────────────────────────────

export async function sendOrderConfirmation(order: Order, store: StoreConfig) {
  const [client, from] = await Promise.all([
    getResendClient(store.id),
    fromAddress(store),
  ])

  const { data, error } = await client.emails.send({
    from,
    to: order.buyer_email,
    subject: `Tu pedido #${order.id.slice(0, 8).toUpperCase()} fue confirmado`,
    react: createElement(OrderConfirmation, { order, store }),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// ─── Send abandoned cart recovery email ──────────────────────────────────────

export async function sendAbandonedCartEmail(
  cart: AbandonedCart,
  store: StoreConfig,
) {
  if (!cart.email) return null

  const [client, from] = await Promise.all([
    getResendClient(store.id),
    fromAddress(store),
  ])

  const isSecondEmail = cart.email_count === 1
  const subject = isSecondEmail
    ? `¿Todavía estás pensando? Tu carrito te espera 🛍️`
    : `Olvidaste algo en tu carrito`

  const { data, error } = await client.emails.send({
    from,
    to: cart.email,
    subject,
    react: createElement(AbandonedCartEmail, { cart, store, isSecondEmail }),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}

// ─── Send reactivation email ──────────────────────────────────────────────────

export async function sendReactivationEmail(
  customer: { email: string; full_name: string },
  store: StoreConfig,
) {
  const [client, from] = await Promise.all([
    getResendClient(store.id),
    fromAddress(store),
  ])

  const { data, error } = await client.emails.send({
    from,
    to: customer.email,
    subject: `¡Te extrañamos! Volvé a ver las novedades`,
    react: createElement(Reactivation, { customer, store }),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return data
}
