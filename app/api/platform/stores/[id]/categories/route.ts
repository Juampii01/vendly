import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requirePlatformAccess } from '@/lib/auth'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ─── GET — list categories ────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { id: storeId } = await params
  const service = createServiceClient()

  const { data, error } = await service
    .from('categories')
    .select('*')
    .eq('store_id', storeId)
    .order('position', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data ?? [] })
}

// ─── POST — create / update / delete ─────────────────────────────────────────

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
    category_id?: string
    data?: {
      name?: string
      slug?: string
      description?: string
      position?: number
      is_active?: boolean
    }
  }

  const { action, category_id, data } = body

  if (action === 'delete') {
    if (!category_id) return NextResponse.json({ error: 'category_id requerido' }, { status: 400 })
    const { error } = await service
      .from('categories')
      .delete()
      .eq('id', category_id)
      .eq('store_id', storeId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'deleted', category_id })
  }

  if (!data) return NextResponse.json({ error: 'data requerido' }, { status: 400 })

  if (action === 'create') {
    if (!data.name) return NextResponse.json({ error: 'name requerido' }, { status: 400 })

    const baseSlug = data.slug || slugify(data.name)
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data: existing } = await service
        .from('categories')
        .select('id')
        .eq('store_id', storeId)
        .eq('slug', slug)
        .maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    // Position = max + 1
    const { data: maxRow } = await service
      .from('categories')
      .select('position')
      .eq('store_id', storeId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()
    const position = data.position ?? ((maxRow?.position ?? -1) + 1)

    const { data: category, error } = await service
      .from('categories')
      .insert({
        store_id: storeId,
        name: data.name,
        slug,
        description: data.description ?? null,
        position,
        is_active: data.is_active ?? true,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'created', category })
  }

  if (action === 'update') {
    if (!category_id) return NextResponse.json({ error: 'category_id requerido' }, { status: 400 })

    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) {
      updates.name = data.name
      if (!data.slug) updates.slug = slugify(data.name)
    }
    if (data.slug !== undefined) updates.slug = data.slug
    if (data.description !== undefined) updates.description = data.description
    if (data.position !== undefined) updates.position = data.position
    if (data.is_active !== undefined) updates.is_active = data.is_active

    const { data: category, error } = await service
      .from('categories')
      .update(updates)
      .eq('id', category_id)
      .eq('store_id', storeId)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, action: 'updated', category })
  }

  return NextResponse.json({ error: 'action inválido' }, { status: 400 })
}
