import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// PATCH — editar categoría (nombre, descripción, imagen, posición, activo)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId, { id }] = [createServiceClient(), await getStoreId(), await params]
  const body = await req.json()

  // Construir payload solo con campos presentes
  const update: Record<string, unknown> = {}
  if (body.name !== undefined) {
    update.name = body.name.trim()
    update.slug = toSlug(body.name.trim())
  }
  if (body.description !== undefined) update.description = body.description?.trim() || null
  if (body.image_url !== undefined) update.image_url = body.image_url?.trim() || null
  if (body.is_active !== undefined) update.is_active = body.is_active
  if (body.position !== undefined) update.position = body.position

  const { data, error } = await service
    .from('categories')
    .update(update)
    .eq('id', id)
    .eq('store_id', storeId)   // garantiza que pertenece a este store
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe una categoría con ese nombre' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE — eliminar categoría (solo si no tiene productos activos)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId, { id }] = [createServiceClient(), await getStoreId(), await params]

  // Verificar que no tenga productos
  const { count } = await service
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
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
    .eq('store_id', storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
