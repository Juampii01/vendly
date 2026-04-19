import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServiceClient()
  // Resolución dinámica del store y base URL para soporte multi-tenant
  const store = await getStoreConfig()
  const storeId = store.id
  const BASE_URL = store.base_url ?? process.env.NEXT_PUBLIC_BASE_URL!

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('slug, updated_at')
      .eq('store_id', storeId)
      .eq('is_active', true),
    supabase
      .from('categories')
      .select('slug, updated_at')
      .eq('store_id', storeId)
      .eq('is_active', true),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/productos`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${BASE_URL}/productos?categoria=${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/productos/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
