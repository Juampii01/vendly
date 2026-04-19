import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendAbandonedCartEmail } from '@/lib/resend'
import { sendAbandonedCartWA } from '@/lib/whatsapp'
import type { AbandonedCart, StoreConfig } from '@/types'

/**
 * Cron de carritos abandonados — se ejecuta cada 30 minutos via Vercel Cron.
 *
 * Procesa TODOS los stores registrados (multi-tenant).
 * Fallback single-tenant: si no hay stores en la tabla, usa NEXT_PUBLIC_STORE_ID.
 *
 *   Pasada 1 (email_count = 0, 30min):  email #1 "dejaste algo en tu carrito"
 *   Pasada 2 (email_count = 1, 2h):     email #2 "última oportunidad"
 *   WhatsApp independiente (2h, una vez)
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()

  // Obtener todos los stores activos
  const { data: allStores } = await supabase
    .from('store_config')
    .select('*')

  let stores: StoreConfig[] = allStores ?? []

  // Fallback single-tenant
  if (stores.length === 0 && process.env.NEXT_PUBLIC_STORE_ID) {
    const { data } = await supabase
      .from('store_config')
      .select('*')
      .eq('id', process.env.NEXT_PUBLIC_STORE_ID)
      .single()
    if (data) stores = [data as StoreConfig]
  }

  const globalResults = {
    stores_processed: 0,
    email1_sent: 0,
    email2_sent: 0,
    whatsapp_sent: 0,
    errors: [] as string[],
  }

  // Procesar cada store en paralelo (carritos por store son independientes)
  await Promise.allSettled(
    stores.map(async (store) => {
      const results = await processStoreAbandonedCarts(store, supabase)
      globalResults.stores_processed++
      globalResults.email1_sent += results.email1_sent
      globalResults.email2_sent += results.email2_sent
      globalResults.whatsapp_sent += results.whatsapp_sent
      globalResults.errors.push(...results.errors)
    }),
  )

  console.log('[cron/abandoned-carts]', globalResults)

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    ...globalResults,
  })
}

async function processStoreAbandonedCarts(
  store: StoreConfig,
  supabase: ReturnType<typeof createServiceClient>,
) {
  const storeId = store.id
  const now = new Date()
  const thirtyMinAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString()
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()

  const results = {
    email1_sent: 0,
    email2_sent: 0,
    whatsapp_sent: 0,
    errors: [] as string[],
  }

  // ── Obtener los 3 batches en paralelo ─────────────────────────────────────

  const [{ data: firstBatch }, { data: secondBatch }, { data: waBatch }] =
    await Promise.all([
      supabase
        .from('abandoned_carts')
        .select('*')
        .eq('store_id', storeId)
        .eq('recovered', false)
        .eq('email_count', 0)
        .not('email', 'is', null)
        .lt('created_at', thirtyMinAgo)
        .limit(50),
      supabase
        .from('abandoned_carts')
        .select('*')
        .eq('store_id', storeId)
        .eq('recovered', false)
        .eq('email_count', 1)
        .not('email', 'is', null)
        .lt('email_sent_at', twoHoursAgo)
        .limit(50),
      supabase
        .from('abandoned_carts')
        .select('*')
        .eq('store_id', storeId)
        .eq('recovered', false)
        .eq('whatsapp_count', 0)
        .not('phone', 'is', null)
        .lt('created_at', twoHoursAgo)
        .limit(50),
    ])

  // ── Pasada 1: primer email ────────────────────────────────────────────────

  await Promise.allSettled(
    (firstBatch ?? []).map(async (rawCart) => {
      const cart = rawCart as AbandonedCart
      try {
        await sendAbandonedCartEmail(cart, store)
        await supabase
          .from('abandoned_carts')
          .update({
            email_count: 1,
            email_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', cart.id)
        results.email1_sent++
      } catch (err) {
        console.error(`[cron] email1 error for cart ${cart.id} (store: ${storeId})`, err)
        results.errors.push(`email1:${cart.id}`)
      }
    }),
  )

  // ── Pasada 2: segundo email ───────────────────────────────────────────────

  await Promise.allSettled(
    (secondBatch ?? []).map(async (rawCart) => {
      const cart = { ...rawCart, email_count: 1 } as AbandonedCart
      try {
        await sendAbandonedCartEmail(cart, store)
        await supabase
          .from('abandoned_carts')
          .update({
            email_count: 2,
            email_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', cart.id)
        results.email2_sent++
      } catch (err) {
        console.error(`[cron] email2 error for cart ${cart.id} (store: ${storeId})`, err)
        results.errors.push(`email2:${cart.id}`)
      }
    }),
  )

  // ── WhatsApp drip ─────────────────────────────────────────────────────────

  await Promise.allSettled(
    (waBatch ?? []).map(async (rawCart) => {
      const cart = rawCart as AbandonedCart
      try {
        await sendAbandonedCartWA(cart, store)
        await supabase
          .from('abandoned_carts')
          .update({
            whatsapp_count: 1,
            whatsapp_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq('id', cart.id)
        results.whatsapp_sent++
      } catch (err) {
        console.error(`[cron] whatsapp error for cart ${cart.id} (store: ${storeId})`, err)
        results.errors.push(`whatsapp:${cart.id}`)
      }
    }),
  )

  return results
}
