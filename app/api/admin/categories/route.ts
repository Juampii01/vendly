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

export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data, error } = await service
    .from('categories')
    .select('*, products(count)')
    .eq('store_id', auth.storeId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const body = await req.json()
  const { name, description, image_url } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  const { count } = await service
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', auth.storeId)

  const slug = toSlug(name.trim())
  if (!slug) {
    return NextResponse.json({ error: 'El nombre debe contener al menos una letra o número' }, { status: 400 })
  }

  const { data, error } = await service
    .from('categories')
    .insert({
      store_id: auth.storeId,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      position: count ?? 0,
      is_active: true,
    })
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
