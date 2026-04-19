import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import DesignStudio from './DesignStudio'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editor IA — Admin' }

// Sin padding de layout — el studio ocupa todo el espacio disponible
export default async function EstudioPage() {
  const supabase = createServiceClient()
  const [store, storeId] = await Promise.all([getStoreConfig(), getStoreId()])

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('id, name, price, compare_at_price, is_active, is_featured, tags, description, slug, category_id')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('categories')
      .select('id, name, slug, is_active')
      .eq('store_id', storeId)
      .order('position'),
  ])

  return (
    <DesignStudio
      store={store}
      storeId={storeId}
      initialProducts={products ?? []}
      initialCategories={categories ?? []}
    />
  )
}
