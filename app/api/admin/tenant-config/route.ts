import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'
import { invalidateTenantCredsCache } from '@/lib/tenant-credentials'
import type { TenantConfig } from '@/types'

const ALLOWED_FIELDS: (keyof Omit<TenantConfig, 'id' | 'store_id' | 'created_at' | 'updated_at'>)[] = [
  'mp_access_token',
  'mp_public_key',
  'mp_webhook_secret',
  'resend_api_key',
  'resend_from_domain',
  'wa_api_key',
  'wa_from_number',
]

// GET — devuelve estado de configuración (sin exponer valores sensibles).
// Disponible a admin y owner.
export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data } = await service
    .from('tenant_config')
    .select('*')
    .eq('store_id', auth.storeId)
    .maybeSingle()

  const status: Record<string, boolean | string | null> = {}
  for (const field of ALLOWED_FIELDS) {
    if (field === 'resend_from_domain' || field === 'wa_from_number' || field === 'mp_public_key') {
      status[field] = data?.[field] ?? null
    } else {
      status[`${field}_configured`] = !!(data?.[field])
    }
  }
  status.has_custom_config = !!data

  return NextResponse.json({ data: status })
}

// PATCH — actualizar credenciales del store (solo owner).
//
// SOLO el rol `owner` puede modificar credenciales — un `admin` regular no debe
// poder inyectar tokens MP/Resend/WA y secuestrar pagos o emails.
export async function PATCH(req: Request) {
  const auth = await requireStoreAdmin({ role: 'owner' })
  if ('error' in auth) return auth.error

  try {
    const body = await req.json()
    const service = createServiceClient()

    const updates: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (field in body) {
        const v = body[field]
        if (v !== null && v !== '' && typeof v !== 'string') {
          return NextResponse.json({ error: `${field} debe ser string o null` }, { status: 400 })
        }
        updates[field] = v === '' ? null : v
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const { error } = await service
      .from('tenant_config')
      .upsert(
        { store_id: auth.storeId, ...updates },
        { onConflict: 'store_id' },
      )

    if (error) throw error

    invalidateTenantCredsCache(auth.storeId)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[tenant-config]', e)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
