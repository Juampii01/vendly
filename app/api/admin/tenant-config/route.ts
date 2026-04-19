import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { invalidateTenantCredsCache } from '@/lib/tenant-credentials'
import type { TenantConfig } from '@/types'

// ─── Campos editables ─────────────────────────────────────────────────────────
//
// Nunca exponemos las claves en texto plano: GET devuelve solo si están
// configuradas (boolean), no el valor real. PATCH acepta el nuevo valor
// o null para volver al fallback de env vars.
//
const ALLOWED_FIELDS: (keyof Omit<TenantConfig, 'id' | 'store_id' | 'created_at' | 'updated_at'>)[] = [
  'mp_access_token',
  'mp_public_key',
  'mp_webhook_secret',
  'resend_api_key',
  'resend_from_domain',
  'wa_api_key',
  'wa_from_number',
]

// GET — devuelve estado de configuración (sin exponer valores sensibles)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const [service, storeId] = [createServiceClient(), await getStoreId()]

  const { data } = await service
    .from('tenant_config')
    .select('*')
    .eq('store_id', storeId)
    .maybeSingle()

  // Transformar: para cada campo sensible, devolver si está configurado (no el valor)
  const status: Record<string, boolean | string | null> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field === 'resend_from_domain' || field === 'wa_from_number' || field === 'mp_public_key') {
      // Estos campos no son secretos, podemos exponerlos
      status[field] = data?.[field] ?? null
    } else {
      // Campos sensibles: solo indicamos si están configurados
      status[`${field}_configured`] = !!(data?.[field])
    }
  }

  // Indicar también si el store tiene su propio registro en tenant_config
  status.has_custom_config = !!data

  return NextResponse.json({ data: status })
}

// PATCH — actualizar credenciales del store
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const [service, storeId] = [createServiceClient(), await getStoreId()]

    const updates: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        // Aceptamos string (nueva clave) o null (volver a env var)
        updates[field] = body[field] === '' ? null : body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    // Upsert: crear el registro si no existe, actualizar si existe
    const { error } = await service
      .from('tenant_config')
      .upsert(
        { store_id: storeId, ...updates },
        { onConflict: 'store_id' },
      )

    if (error) throw error

    // Invalidar cache de credenciales para que el siguiente request use las nuevas claves
    invalidateTenantCredsCache(storeId)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[tenant-config]', e)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
