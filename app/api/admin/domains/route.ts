import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

// ─── GET — listar dominios del store ─────────────────────────────────────────

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]
  const { data, error } = await service
    .from('store_domains')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// ─── POST — agregar dominio ───────────────────────────────────────────────────

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { domain } = await req.json()
  if (!domain?.trim()) return NextResponse.json({ error: 'Dominio requerido' }, { status: 400 })

  // Normalizar: quitar protocolo, www y trailing slash
  const normalized = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')

  // Validación básica
  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(normalized)) {
    return NextResponse.json({ error: 'Dominio inválido. Ej: matienda.com' }, { status: 400 })
  }

  const [service, storeId] = [createServiceClient(), await getStoreId()]

  // Verificar que no exista ya
  const { data: existing } = await service
    .from('store_domains')
    .select('id')
    .eq('domain', normalized)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Este dominio ya está registrado' }, { status: 409 })

  // Verificar cuántos dominios tiene el store (máximo 10)
  const { count } = await service
    .from('store_domains')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)

  if (count && count >= 10) {
    return NextResponse.json({ error: 'Límite de 10 dominios por tienda alcanzado' }, { status: 400 })
  }

  const { data, error } = await service
    .from('store_domains')
    .insert({ store_id: storeId, domain: normalized, is_primary: count === 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

// ─── PATCH — marcar como primario ────────────────────────────────────────────

export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]

  // Desmarcar todos los primarios del store
  await service
    .from('store_domains')
    .update({ is_primary: false })
    .eq('store_id', storeId)

  // Marcar el nuevo primario (verificando que pertenece al store)
  const { error } = await service
    .from('store_domains')
    .update({ is_primary: true })
    .eq('id', id)
    .eq('store_id', storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// ─── DELETE — eliminar dominio ────────────────────────────────────────────────

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]

  const { error } = await service
    .from('store_domains')
    .delete()
    .eq('id', id)
    .eq('store_id', storeId)   // seguridad: solo puede borrar sus propios dominios

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
