import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { CarritosClient } from '@/components/admin/CarritosClient'
import type { Metadata } from 'next'
import type { AbandonedCart } from '@/types'

export const metadata: Metadata = { title: 'Carritos abandonados — Admin' }

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'
const IS_DEV = process.env.NODE_ENV === 'development'

export default async function CarritosPage() {
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  const [{ data: carts }, { data: store }] = await Promise.all([
    supabase
      .from('abandoned_carts')
      .select('id, buyer_name, email, phone, cart_data, subtotal, recovered, recovery_token, whatsapp_count, email_count, created_at, updated_at')
      .eq('store_id', storeId)
      .eq('recovered', false)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('store_config')
      .select('name, slug, base_url')
      .eq('id', storeId)
      .single(),
  ])

  const storeUrl = IS_DEV
    ? `http://${store?.slug}.localhost:3000`
    : store?.base_url ?? `https://${store?.slug}.${ROOT_DOMAIN}`

  return (
    <CarritosClient
      initialCarts={(carts ?? []) as AbandonedCart[]}
      storeUrl={storeUrl}
      storeName={store?.name ?? 'la tienda'}
    />
  )
}
