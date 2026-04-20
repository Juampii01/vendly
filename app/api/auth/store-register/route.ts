import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

// ─── GET /api/auth/store-register ─────────────────────────────────────────────
// Verifica si el usuario autenticado tiene cuenta en este store.
// Devuelve { registered: boolean }
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ registered: false })

  const [service, storeId] = [createServiceClient(), await getStoreId()]
  const { data } = await service
    .from('store_customers')
    .select('id')
    .eq('store_id', storeId)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ registered: !!data })
}

// ─── POST /api/auth/store-register ────────────────────────────────────────────
// Registra (o confirma) al usuario autenticado en este store.
// Idempotente: si ya existe, no hace nada.
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]

  const { error } = await service
    .from('store_customers')
    .upsert(
      {
        store_id: storeId,
        auth_user_id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name ?? null,
      },
      { onConflict: 'store_id,auth_user_id', ignoreDuplicates: true },
    )

  if (error) {
    console.error('[store-register]', error)
    return NextResponse.json({ error: 'Error al registrar' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
