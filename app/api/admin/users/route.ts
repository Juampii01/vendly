import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

// GET — listar admins (cualquier rol logueado del store puede ver la lista)
export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data, error } = await service
    .from('admin_users')
    .select('id, email, role, created_at')
    .eq('store_id', auth.storeId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — agregar admin (solo owner). Devuelve la fila creada.
export async function POST(req: Request) {
  const auth = await requireStoreAdmin({ role: 'owner' })
  if ('error' in auth) return auth.error

  const { email, role } = await req.json()
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!['owner', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data, error } = await service
    .from('admin_users')
    .insert({ store_id: auth.storeId, email: email.toLowerCase().trim(), role })
    .select('id, email, role, created_at')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ese email ya tiene acceso' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, data })
}

// DELETE — eliminar admin (solo owner)
export async function DELETE(req: Request) {
  const auth = await requireStoreAdmin({ role: 'owner' })
  if ('error' in auth) return auth.error

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  if (email.toLowerCase() === auth.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'No podés eliminarte a vos mismo' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('admin_users')
    .delete()
    .eq('store_id', auth.storeId)
    .ilike('email', email.toLowerCase())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
