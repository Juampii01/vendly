import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { randomUUID } from 'crypto'

// GET — recuperar carrito por recovery_token (para el flujo ?recover=TOKEN)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('recover')
  if (!token) return NextResponse.json({ data: null, error: 'Token requerido' }, { status: 400 })

  const supabase = createServiceClient()
  const storeId = await getStoreId()

  const { data, error } = await supabase
    .from('abandoned_carts')
    .select('id, cart_data, buyer_name, email, phone, subtotal, recovered')
    .eq('store_id', storeId)
    .eq('recovery_token', token)
    .eq('recovered', false)
    .maybeSingle()

  if (error) return NextResponse.json({ data: null, error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ data: null, error: 'Carrito no encontrado o ya recuperado' }, { status: 404 })

  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { session_id, email, phone, buyer_name, items, subtotal } = body

  if (!session_id || !items) {
    return NextResponse.json({ data: null, error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createServiceClient()

  await supabase.from('abandoned_carts').upsert(
    {
      store_id: await getStoreId(),
      session_id,
      email: email || null,
      phone: phone || null,
      buyer_name: buyer_name || null,
      cart_data: items,
      subtotal: subtotal ?? 0,
      recovered: false,
      recovery_token: randomUUID(),
    },
    { onConflict: 'session_id', ignoreDuplicates: false },
  )

  return NextResponse.json({ data: true, error: null })
}
