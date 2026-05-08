import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requirePlatformAccess } from '@/lib/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function resolveCategory(
  service: ReturnType<typeof createServiceClient>,
  storeId: string,
  categorySlug: string | null | undefined,
): Promise<string | null> {
  if (!categorySlug) return null
  const { data } = await service
    .from('categories')
    .select('id')
    .eq('store_id', storeId)
    .eq('slug', categorySlug)
    .maybeSingle()
  return data?.id ?? null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { id: storeId } = await params
  const service = createServiceClient()

  const { data, error } = await service
    .from('products')
    .select('*, category:categories(id, name, slug), variants:product_variants(*)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ products: data ?? [] })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { id: storeId } = await params
  const service = createServiceClient()

  const body = await req.json() as {
    action: 'create' | 'update' | 'delete'
    product_id?: string
    data?: {
      name?: string
      slug?: string
      description?: string
      price?: number
      compare_at_price?: number | null
      is_active?: boolean
      is_featured?: boolean
      tags?: string[]
      category_slug?: string | null
      images?: string[]
    }
  }

  const { action, product_id, data } = body

  if (action === 'delete') {
    if (!product_id) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })
    const { error } = await service
      .from('products')
      .delete()
      .eq('id', product_id)
      .eq('store_id', storeId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'deleted', product_id })
  }

  if (!data) return NextResponse.json({ error: 'data requerido' }, { status: 400 })

  if (action === 'create') {
    if (!data.name) return NextResponse.json({ error: 'name requerido' }, { status: 400 })
    if (data.price == null) return NextResponse.json({ error: 'price requerido' }, { status: 400 })

    const baseSlug = data.slug || slugify(data.name)
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data: existing } = await service
        .from('products')
        .select('id')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const category_id = await resolveCategory(service, storeId, data.category_slug)

    const { data: product, error } = await service
      .from('products')
      .insert({
        store_id: storeId,
        name: data.name,
        slug,
        description: data.description ?? null,
        price: data.price,
        compare_at_price: data.compare_at_price ?? null,
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        tags: data.tags ?? [],
        images: data.images ?? [],
        category_id,
      })
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'created', product })
  }

  if (action === 'update') {
    if (!product_id) return NextResponse.json({ error: 'product_id requerido' }, { status: 400 })

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.name !== undefined) {
      updates.name = data.name
      if (!data.slug) updates.slug = slugify(data.name)
    }
    if (data.slug !== undefined) updates.slug = data.slug
    if (data.description !== undefined) updates.description = data.description
    if (data.price !== undefined) updates.price = data.price
    if (data.compare_at_price !== undefined) updates.compare_at_price = data.compare_at_price
    if (data.is_active !== undefined) updates.is_active = data.is_active
    if (data.is_featured !== undefined) updates.is_featured = data.is_featured
    if (data.tags !== undefined) updates.tags = data.tags
    if (data.images !== undefined) updates.images = data.images
    if ('category_slug' in data) {
      updates.category_id = await resolveCategory(service, storeId, data.category_slug)
    }

    const { data: product, error } = await service
      .from('products')
      .update(updates)
      .eq('id', product_id)
      .eq('store_id', storeId)
      .select('*, category:categories(id, name, slug), variants:product_variants(*)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'updated', product })
  }

  return NextResponse.json({ error: 'action inválido' }, { status: 400 })
}
