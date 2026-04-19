import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PlatformDesignStudio from './PlatformDesignStudio'
import type { Metadata } from 'next'
import type { StoreConfig, Product, Category } from '@/types'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const service = createServiceClient()
  const { data } = await service.from('store_config').select('name').eq('id', id).single()
  return { title: `Editor IA — ${data?.name ?? 'Store'} — Platform` }
}

export default async function StoreDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()

  const [storeRes, productsRes, categoriesRes] = await Promise.all([
    service.from('store_config').select('*').eq('id', id).single(),
    service
      .from('products')
      .select('id, name, price, compare_at_price, is_active, is_featured, tags, description, category:categories(id, name, slug)')
      .eq('store_id', id)
      .order('created_at', { ascending: false }),
    service
      .from('categories')
      .select('id, name, slug, is_active, position')
      .eq('store_id', id)
      .order('position', { ascending: true }),
  ])

  if (!storeRes.data) notFound()

  return (
    <PlatformDesignStudio
      store={storeRes.data as StoreConfig}
      initialProducts={(productsRes.data ?? []) as unknown as Product[]}
      initialCategories={(categoriesRes.data ?? []) as Category[]}
    />
  )
}
