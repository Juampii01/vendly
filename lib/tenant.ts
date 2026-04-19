import { cache } from 'react'
import { headers } from 'next/headers'

/**
 * Resolves the store_id for the current request.
 *
 * Resolution order:
 *  1. `x-store-id` request header — injected by middleware from hostname lookup.
 *     Covers every storefront page, every admin page, and every API route called
 *     from the browser (checkout, coupons, newsletter, etc.).
 *  2. `NEXT_PUBLIC_STORE_ID` env var — fallback for single-tenant deploys,
 *     local dev, and server-side contexts that have no hostname (cron, webhooks).
 *
 * Wrapped in React.cache() so repeated calls within the same Server Component
 * render tree (or Route Handler invocation) are free after the first call.
 *
 * Note: cron routes and the MercadoPago webhook must NOT rely on this — they have
 * no request hostname and should iterate all stores or resolve from order data.
 */
export const getStoreId = cache(async (): Promise<string> => {
  const h = await headers()
  const fromHeader = h.get('x-store-id')
  if (fromHeader) return fromHeader

  const envId = process.env.NEXT_PUBLIC_STORE_ID
  if (envId) return envId

  throw new Error(
    '[tenant] Could not resolve store_id. ' +
      'Set NEXT_PUBLIC_STORE_ID or configure NEXT_PUBLIC_ROOT_DOMAIN for hostname routing.',
  )
})
