import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import { ProductsClient } from '@/components/admin/ProductsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Productos — Admin' }

export default async function AdminProductosPage() {
  const storeId = await getStoreId()
  const supabase = createServiceClient()

  const [store, { data: products }, { data: categories }] = await Promise.all([
    getStoreConfig(),
    supabase
      .from('products')
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('id, name, slug')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('position'),
  ])

  return (
    <ProductsClient
      initialProducts={products ?? []}
      categories={categories ?? []}
      store={store}
      storeId={storeId}
    />
  )
}
