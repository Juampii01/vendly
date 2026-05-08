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
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ data: null, error: 'Invalid JSON' }, { status: 400 })
  }

  const { session_id, email, phone, buyer_name, items, subtotal } = body as {
    session_id?: unknown
    email?: unknown
    phone?: unknown
    buyer_name?: unknown
    items?: unknown
    subtotal?: unknown
  }

  // ── Validación de tipos básica para evitar storage abuse ─────────────────
  if (typeof session_id !== 'string' || !session_id.length) {
    return NextResponse.json({ data: null, error: 'session_id inválido' }, { status: 400 })
  }
  if (!Array.isArray(items)) {
    return NextResponse.json({ data: null, error: 'items debe ser un array' }, { status: 400 })
  }
  if (items.length > 100) {
    return NextResponse.json({ data: null, error: 'Demasiados items en el carrito' }, { status: 413 })
  }

  const supabase = createServiceClient()
  const storeId = await getStoreId()

  await supabase.from('abandoned_carts').upsert(
    {
      store_id: storeId,
      session_id,
      email: typeof email === 'string' && email.includes('@') ? email : null,
      phone: typeof phone === 'string' ? phone.slice(0, 30) : null,
      buyer_name: typeof buyer_name === 'string' ? buyer_name.slice(0, 80) : null,
      cart_data: items,
      subtotal: typeof subtotal === 'number' && Number.isFinite(subtotal) ? subtotal : 0,
      recovered: false,
      recovery_token: randomUUID(),
    },
    // Composite (store_id, session_id) — un mismo session_id en otro tenant
    // no debe sobrescribir este carrito. La unique constraint la agrega
    // migration_security_hardening.sql.
    { onConflict: 'store_id,session_id', ignoreDuplicates: false },
  )

  return NextResponse.json({ data: true, error: null })
}
