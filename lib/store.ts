import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import type { StoreConfig, Product, Category } from '@/types'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'

// ─── Store config ─────────────────────────────────────────────────────────────
//
// Dos capas de caché:
//   1. React cache()       → deduplication dentro del mismo request (gratis, siempre)
//   2. unstable_cache()    → caché cross-request, 30s TTL en dev / 60s en prod
//      Usa el service client (sin cookies) para que la query sea stateless y cacheable.
//
const _fetchStoreConfig = unstable_cache(
  async (storeId: string): Promise<StoreConfig> => {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('store_config')
      .select('*')
      .eq('id', storeId)
      .single()
    if (error || !data) throw new Error('Store config not found')
    return data as StoreConfig
  },
  ['store-config'],
  { revalidate: process.env.NODE_ENV === 'development' ? 30 : 60 },
)

export const getStoreConfig = cache(async (): Promise<StoreConfig> => {
  const storeId = await getStoreId()
  return _fetchStoreConfig(storeId)
})

// ─── Categories ───────────────────────────────────────────────────────────────

const _fetchCategories = unstable_cache(
  async (storeId: string): Promise<Category[]> => {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('categories')
      .select('*, products(images)')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('position', { ascending: true })
    return (data ?? []) as Category[]
  },
  ['categories'],
  { revalidate: process.env.NODE_ENV === 'development' ? 30 : 60 },
)

export const getCategories = cache(async (): Promise<Category[]> => {
  const storeId = await getStoreId()
  return _fetchCategories(storeId)
})

// ─── Products ─────────────────────────────────────────────────────────────────

export interface ProductFilters {
  category_slug?: string
  search?: string
  page?: number
  per_page?: number
  featured?: boolean
  tag?: string
}

export async function getProducts(filters: ProductFilters = {}): Promise<{
  products: Product[]
  total: number
}> {
  const [supabase, storeId] = await Promise.all([createClient(), getStoreId()])
  const { category_slug, search, page = 1, per_page = 24, featured, tag } = filters

  let categoryId: string | null = null
  if (category_slug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('store_id', storeId)
      .eq('slug', category_slug)
      .single()
    categoryId = cat?.id ?? null
  }

  let query = supabase
    .from('products')
    .select(
      `*, category:categories(id, name, slug), variants:product_variants(*)`,
      { count: 'exact' },
    )
    .eq('store_id', storeId)
    .eq('is_active', true)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (featured) {
    query = query.eq('is_featured', true)
  }

  if (search) {
    // Escapar % y _ para que el usuario no pueda matchear más de lo que tipea.
    const escaped = search.replace(/[%_\\]/g, ch => `\\${ch}`)
    query = query.ilike('name', `%${escaped}%`)
  }

  if (tag) {
    query = query.contains('tags', [tag])
  }

  const from = (page - 1) * per_page
  query = query.range(from, from + per_page - 1).order('created_at', { ascending: false })

  const { data, count, error } = await query
  if (error) throw error

  return { products: (data ?? []) as Product[], total: count ?? 0 }
}

// ─── Product by slug (cached per request) ────────────────────────────────────

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const [supabase, storeId] = await Promise.all([createClient(), getStoreId()])
  const { data } = await supabase
    .from('products')
    .select(`*, category:categories(id, name, slug), variants:product_variants(*)`)
    .eq('store_id', storeId)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  return (data ?? null) as Product | null
})

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<Product[]> {
  const [supabase, storeId] = await Promise.all([createClient(), getStoreId()])
  let query = supabase
    .from('products')
    .select(`*, variants:product_variants(*)`)
    .eq('store_id', storeId)
    .eq('is_active', true)
    .neq('id', productId)
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data } = await query
  return (data ?? []) as Product[]
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

export async function validateCoupon(code: string) {
  // Usamos service_role: tras el RLS hardening, anon ya no puede leer coupons.
  // El endpoint que llama a esta función filtra por el storeId del request,
  // así que no hay riesgo de cross-tenant.
  const [supabase, storeId] = [createServiceClient(), await getStoreId()]
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .maybeSingle()

  if (!data) return null

  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  if (data.max_uses !== null && data.uses_count >= data.max_uses) return null

  return data
}
