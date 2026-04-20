import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { CategoriasClient } from '@/components/admin/CategoriasClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Categorías — Admin' }

export default async function CategoriasPage() {
  const service = createServiceClient()
  const storeId = await getStoreId()

  const { data: categories } = await service
    .from('categories')
    .select('*, products(count)')
    .eq('store_id', storeId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  return <CategoriasClient initialCategories={categories ?? []} />
}
