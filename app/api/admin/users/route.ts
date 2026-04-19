import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

async function getCallerRole(userEmail: string, storeId: string) {
  const service = createServiceClient()
  const { data } = await service
    .from('admin_users')
    .select('role')
    .eq('store_id', storeId)
    .eq('email', userEmail)
    .maybeSingle()
  return data?.role ?? null
}

// GET — listar admins
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]
  const { data, error } = await service
    .from('admin_users')
    .select('id, email, role, created_at')
    .eq('store_id', storeId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — agregar admin
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const storeId = await getStoreId()
  const callerRole = await getCallerRole(user.email!, storeId)

  // En modo bootstrap (0 admins) el primer usuario puede agregarse
  const service = createServiceClient()
  const { count } = await service
    .from('admin_users')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', storeId)

  if (count && count > 0 && callerRole !== 'owner') {
    return NextResponse.json({ error: 'Solo el owner puede agregar usuarios' }, { status: 403 })
  }

  const { email, role } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
  }
  if (!['owner', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const { error } = await service
    .from('admin_users')
    .insert({ store_id: storeId, email: email.toLowerCase().trim(), role })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ese email ya tiene acceso' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// DELETE — eliminar admin
export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const storeId = await getStoreId()
  const callerRole = await getCallerRole(user.email!, storeId)
  if (callerRole !== 'owner') {
    return NextResponse.json({ error: 'Solo el owner puede eliminar usuarios' }, { status: 403 })
  }

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 })

  // No se puede eliminar al propio owner
  if (email.toLowerCase() === user.email!.toLowerCase()) {
    return NextResponse.json({ error: 'No podés eliminarte a vos mismo' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('admin_users')
    .delete()
    .eq('store_id', storeId)
    .eq('email', email.toLowerCase())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
