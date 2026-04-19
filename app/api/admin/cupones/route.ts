import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

// GET — listar cupones del store
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()
  const storeId = await getStoreId()

  const { data, error } = await service
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST — crear cupón
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const service = createServiceClient()
  const storeId = await getStoreId()

  const body = await req.json()
  const { code, type, value, max_uses, min_order_amount, expires_at } = body

  if (!code || !type || value == null) {
    return NextResponse.json({ error: 'code, type y value son requeridos' }, { status: 400 })
  }
  if (!['percentage', 'fixed'].includes(type)) {
    return NextResponse.json({ error: 'type inválido' }, { status: 400 })
  }
  if (type === 'percentage' && (value <= 0 || value > 100)) {
    return NextResponse.json({ error: 'El porcentaje debe ser entre 1 y 100' }, { status: 400 })
  }
  if (type === 'fixed' && value <= 0) {
    return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
  }

  const { data, error } = await service
    .from('coupons')
    .insert({
      store_id: storeId,
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      max_uses: max_uses ? Number(max_uses) : null,
      min_order_amount: min_order_amount ? Number(min_order_amount) : null,
      expires_at: expires_at || null,
      is_active: true,
      uses_count: 0,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
