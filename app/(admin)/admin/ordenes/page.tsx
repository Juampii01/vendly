import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { OrdersClient } from '@/components/admin/OrdersClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Órdenes — Admin' }

export default async function AdminOrdenesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; id?: string }>
}) {
  const { status, id } = await searchParams
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (status) query = query.eq('payment_status', status)

  const { data: orders } = await query

  return (
    <OrdersClient
      initialOrders={orders ?? []}
      activeStatus={status}
      openOrderId={id}
    />
  )
}
