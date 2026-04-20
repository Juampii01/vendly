import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { OrdersClient } from '@/components/admin/OrdersClient'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Órdenes — Admin' }

const PER_PAGE = 25

interface PageProps {
  searchParams: Promise<{ status?: string; id?: string; pagina?: string }>
}

export default async function AdminOrdenesPage({ searchParams }: PageProps) {
  const { status, id, pagina } = await searchParams
  const page = Math.max(1, Number(pagina ?? 1))
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*)', { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (status) query = query.eq('payment_status', status)

  const { data: orders, count } = await query
  const total = count ?? 0

  return (
    <div className="flex h-full min-h-screen flex-col">
      <OrdersClient
        initialOrders={orders ?? []}
        activeStatus={status}
        openOrderId={id}
        page={page}
        total={total}
        perPage={PER_PAGE}
      />
      {/* Paginación fuera del split-view, visible en el listado */}
      <Suspense>
        <div className="border-t border-slate-100 bg-white px-6 py-3">
          <AdminPagination page={page} total={total} perPage={PER_PAGE} />
        </div>
      </Suspense>
    </div>
  )
}
