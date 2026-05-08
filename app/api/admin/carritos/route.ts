import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data, error } = await service
    .from('abandoned_carts')
    .select('id, buyer_name, email, phone, cart_data, subtotal, recovered, recovery_token, whatsapp_count, email_count, created_at, updated_at')
    .eq('store_id', auth.storeId)
    .eq('recovered', false)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// PATCH — actualizar estado de un carrito.
//
// Acepta `action`:
//   - 'recover'  → marca como recovered=true (cierre manual)
//   - 'wa_sent'  → incrementa whatsapp_count y registra timestamp
//
// El comportamiento legacy (sin action) se mantiene como 'recover' por compatibilidad.
export async function PATCH(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const { id, action } = await req.json()
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const service = createServiceClient()
  const now = new Date().toISOString()

  let update: Record<string, unknown>
  if (action === 'wa_sent') {
    // Leemos el contador actual y lo incrementamos atómicamente.
    const { data: existing } = await service
      .from('abandoned_carts')
      .select('whatsapp_count')
      .eq('id', id)
      .eq('store_id', auth.storeId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Carrito no encontrado' }, { status: 404 })

    update = {
      whatsapp_count: (existing.whatsapp_count ?? 0) + 1,
      whatsapp_sent_at: now,
      updated_at: now,
    }
  } else {
    // 'recover' (default)
    update = { recovered: true, updated_at: now }
  }

  const { error } = await service
    .from('abandoned_carts')
    .update(update)
    .eq('id', id)
    .eq('store_id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
