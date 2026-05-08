import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data, error } = await service
    .from('store_domains')
    .select('*')
    .eq('store_id', auth.storeId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const auth = await requireStoreAdmin({ role: 'owner' })
  if ('error' in auth) return auth.error

  const { domain } = await req.json()
  if (!domain?.trim()) return NextResponse.json({ error: 'Dominio requerido' }, { status: 400 })

  const normalized = String(domain)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')

  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z]{2,})+$/.test(normalized)) {
    return NextResponse.json({ error: 'Dominio inválido. Ej: matienda.com' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: existing } = await service
    .from('store_domains')
    .select('id')
    .eq('domain', normalized)
    .maybeSingle()

  if (existing) return NextResponse.json({ error: 'Este dominio ya está registrado' }, { status: 409 })

  const { count } = await service
    .from('store_domains')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', auth.storeId)

  if (count && count >= 10) {
    return NextResponse.json({ error: 'Límite de 10 dominios por tienda alcanzado' }, { status: 400 })
  }

  const { data, error } = await service
    .from('store_domains')
    .insert({ store_id: auth.storeId, domain: normalized, is_primary: count === 0 })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(req: Request) {
  const auth = await requireStoreAdmin({ role: 'owner' })
  if ('error' in auth) return auth.error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const service = createServiceClient()
  await service
    .from('store_domains')
    .update({ is_primary: false })
    .eq('store_id', auth.storeId)

  const { error } = await service
    .from('store_domains')
    .update({ is_primary: true })
    .eq('id', id)
    .eq('store_id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const auth = await requireStoreAdmin({ role: 'owner' })
  if ('error' in auth) return auth.error

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service
    .from('store_domains')
    .delete()
    .eq('id', id)
    .eq('store_id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
