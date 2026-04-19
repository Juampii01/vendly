/**
 * Resolución de credenciales por store (tenant-aware).
 *
 * Patrón: si el store tiene su propia clave en tenant_config → la usa.
 *         si no → fallback al env var global del servidor.
 *
 * Incluye un cache en memoria con TTL de 60 segundos para evitar queries
 * repetidas dentro de la misma función serverless.
 */

import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Cache TTL ────────────────────────────────────────────────────────────────

const TTL_MS = 60_000 // 60 segundos

interface CacheEntry {
  data: TenantCreds | null
  expiresAt: number
}

interface TenantCreds {
  mp_access_token: string | null
  mp_public_key: string | null
  mp_webhook_secret: string | null
  resend_api_key: string | null
  resend_from_domain: string | null
  wa_api_key: string | null
  wa_from_number: string | null
}

const _cache = new Map<string, CacheEntry>()

async function getTenantCreds(storeId: string): Promise<TenantCreds | null> {
  const cached = _cache.get(storeId)
  if (cached && cached.expiresAt > Date.now()) return cached.data

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('tenant_config')
    .select(
      'mp_access_token, mp_public_key, mp_webhook_secret, ' +
      'resend_api_key, resend_from_domain, wa_api_key, wa_from_number',
    )
    .eq('store_id', storeId)
    .maybeSingle()

  const entry: CacheEntry = {
    data: (data as TenantCreds | null) ?? null,
    expiresAt: Date.now() + TTL_MS,
  }
  _cache.set(storeId, entry)
  return entry.data
}

// ─── MercadoPago ──────────────────────────────────────────────────────────────

export async function getMPAccessToken(storeId: string): Promise<string> {
  const creds = await getTenantCreds(storeId)
  return creds?.mp_access_token ?? process.env.MP_ACCESS_TOKEN!
}

export async function getMPWebhookSecret(storeId: string): Promise<string | undefined> {
  const creds = await getTenantCreds(storeId)
  return creds?.mp_webhook_secret ?? process.env.MP_WEBHOOK_SECRET ?? undefined
}

// ─── Resend ───────────────────────────────────────────────────────────────────

export async function getResendApiKey(storeId: string): Promise<string> {
  const creds = await getTenantCreds(storeId)
  return creds?.resend_api_key ?? process.env.RESEND_API_KEY!
}

export async function getResendFromDomain(storeId: string): Promise<string> {
  const creds = await getTenantCreds(storeId)
  return creds?.resend_from_domain ?? process.env.RESEND_FROM_DOMAIN!
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

export async function getWAApiKey(storeId: string): Promise<string | undefined> {
  const creds = await getTenantCreds(storeId)
  return creds?.wa_api_key ?? process.env.WHATSAPP_360DIALOG_API_KEY ?? undefined
}

export async function getWAFromNumber(storeId: string): Promise<string | undefined> {
  const creds = await getTenantCreds(storeId)
  return creds?.wa_from_number ?? process.env.WHATSAPP_FROM_NUMBER ?? undefined
}

/** Invalida el cache de un store (llamar después de PATCH en tenant-config). */
export function invalidateTenantCredsCache(storeId: string): void {
  _cache.delete(storeId)
}
