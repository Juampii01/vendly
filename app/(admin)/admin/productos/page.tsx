import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import { ProductsClient } from '@/components/admin/ProductsClient'
import { AdminSearchInput } from '@/components/admin/AdminSearchInput'
import { AdminPagination } from '@/components/admin/AdminPagination'
import { Suspense } from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Productos — Admin' }

const PER_PAGE = 50

interface PageProps {
  searchParams: Promise<{ pagina?: string; busqueda?: string }>
}

export default async function AdminProductosPage({ searchParams }: PageProps) {
  const { pagina, busqueda } = await searchParams
  const page = Math.max(1, Number(pagina ?? 1))
  const storeId = await getStoreId()
  const supabase = createServiceClient()

  // Consulta con filtro, paginación y total
  let query = supabase
    .from('products')
    .select('*, category:categories(id, name, slug), variants:product_variants(*)', { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)

  if (busqueda) {
    query = query.ilike('name', `%${busqueda}%`)
  }

  const [store, { data: products, count }, { data: categories }] = await Promise.all([
    getStoreConfig(),
    query,
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('position'),
  ])

  const total = count ?? 0

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} producto{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <Suspense>
          <AdminSearchInput
            placeholder="Buscar productos..."
            defaultValue={busqueda}
          />
        </Suspense>
      </div>

      {/* Table */}
      <ProductsClient
        initialProducts={products ?? []}
        categories={categories ?? []}
        store={store}
        storeId={storeId}
      />

      {/* Paginación */}
      <Suspense>
        <AdminPagination page={page} total={total} perPage={PER_PAGE} />
      </Suspense>
    </div>
  )
}
