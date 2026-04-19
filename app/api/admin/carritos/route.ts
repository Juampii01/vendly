import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

// GET — listar carritos abandonados no recuperados
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()
  const storeId = await getStoreId()

  const { data, error } = await service
    .from('abandoned_carts')
    .select('id, buyer_name, email, phone, cart_data, subtotal, recovered, recovery_token, whatsapp_count, email_count, created_at, updated_at')
    .eq('store_id', storeId)
    .eq('recovered', false)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH — marcar carrito como recuperado manualmente
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const service = createServiceClient()
  const storeId = await getStoreId()

  const { error } = await service
    .from('abandoned_carts')
    .update({ recovered: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('store_id', storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
