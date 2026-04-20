import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

// GET — listar categorías con conteo de productos
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]

  const { data, error } = await service
    .from('categories')
    .select('*, products(count)')
    .eq('store_id', storeId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — crear categoría
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]
  const body = await req.json()
  const { name, description, image_url } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 })
  }

  // Calcular próxima posición
  const { count } = await service
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)

  const slug = toSlug(name.trim())

  const { data, error } = await service
    .from('categories')
    .insert({
      store_id: storeId,
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      position: (count ?? 0),
      is_active: true,
    })
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
