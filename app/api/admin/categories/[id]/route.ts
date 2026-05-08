import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { id } = await params
  const body = await req.json()

  const update: Record<string, unknown> = {}
  if (body.name !== undefined) {
    const trimmed = String(body.name).trim()
    update.name = trimmed
    update.slug = toSlug(trimmed)
  }
  if (body.description !== undefined) update.description = body.description?.trim() || null
  if (body.image_url !== undefined) update.image_url = body.image_url?.trim() || null
  if (body.is_active !== undefined) update.is_active = !!body.is_active
  if (body.position !== undefined) update.position = Number(body.position) || 0

  const { data, error } = await service
    .from('categories')
    .update(update)
    .eq('id', id)
    .eq('store_id', auth.storeId)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre o slug' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { id } = await params

  const { count } = await service
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('store_id', auth.storeId)
    .eq('is_active', true)

  if (count && count > 0) {
    return NextResponse.json(
      { error: `No se puede eliminar: tiene ${count} producto${count === 1 ? '' : 's'} activo${count === 1 ? '' : 's'}` },
      { status: 409 },
    )
  }

  const { error } = await service
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('store_id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
