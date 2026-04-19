/**
 * Store Generator — Web Generation Engine
 *
 * Crea un nuevo store de forma programática con toda la infraestructura necesaria:
 * - store_config con valores del template (o defaults)
 * - tenant_config vacío (usa env vars globales hasta que se configuren credenciales propias)
 * - Categorías de ejemplo opcionales
 *
 * Diseñado para ser llamado desde el platform admin o desde una API de onboarding.
 */

import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CreateStoreParams {
  name: string
  slug: string
  /** ID de store_templates. Si no se provee, usa defaults. */
  templateId?: string
  /** Moneda ISO 4217. Default: 'ARS' */
  currency?: string
  /** Locale BCP 47. Default: 'es-AR' */
  locale?: string
  /** Plan inicial */
  plan?: 'free' | 'starter' | 'pro' | 'enterprise'
  /** Email del primer admin del store */
  ownerEmail?: string
}

export interface CreateStoreResult {
  ok: true
  store: {
    id: string
    name: string
    slug: string
    plan: string
  }
}

export interface CreateStoreError {
  ok: false
  error: string
}

// ─── Validación de slug ───────────────────────────────────────────────────────

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/

function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) {
    return 'El slug debe tener entre 3 y 40 caracteres, solo minúsculas, números y guiones, sin empezar/terminar con guión.'
  }
  return null
}

// ─── Función principal ────────────────────────────────────────────────────────

export async function createStore(
  params: CreateStoreParams,
): Promise<CreateStoreResult | CreateStoreError> {
  const {
    name,
    slug,
    templateId,
    currency = 'ARS',
    locale = 'es-AR',
    plan = 'free',
    ownerEmail,
  } = params

  // Validar slug
  const slugError = validateSlug(slug)
  if (slugError) return { ok: false, error: slugError }

  const supabase = createServiceClient()

  // Verificar que el slug no esté tomado
  const { data: existing } = await supabase
    .from('store_config')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) return { ok: false, error: `El slug "${slug}" ya está en uso.` }

  // Obtener template si se especificó
  let template: Record<string, unknown> | null = null
  if (templateId) {
    const { data } = await supabase
      .from('store_templates')
      .select('*')
      .eq('id', templateId)
      .single()
    template = data
  }

  // Construir config inicial (template o defaults)
  const storeData = {
    name,
    slug,
    currency,
    locale,
    plan,
    template_id: templateId ?? null,
    status: 'active',
    // Colores del template o defaults
    color_primary:    template?.color_primary    ?? '#1a1a2e',
    color_secondary:  template?.color_secondary  ?? '#16213e',
    color_accent:     template?.color_accent     ?? '#e94560',
    color_background: template?.color_background ?? '#ffffff',
    color_text:       template?.color_text       ?? '#1a1a2e',
    // Hero del template o defaults
    hero_title:     template?.hero_title     ?? `Bienvenidos a ${name}`,
    hero_cta_label: template?.hero_cta_label ?? 'Ver productos',
    hero_cta_url:   '/productos',
    hero_subtitle:  null,
    hero_image_url: null,
    // Shipping defaults
    free_shipping_threshold: null,
    shipping_base_price:     0,
    // Home
    home_marquee_items: [],
    // Meta
    meta_title: name,
  }

  // ── 1. Crear store_config ─────────────────────────────────────────────────
  const { data: newStore, error: storeError } = await supabase
    .from('store_config')
    .insert(storeData)
    .select('id, name, slug, plan')
    .single()

  if (storeError || !newStore) {
    console.error('[store-generator] store insert error:', storeError)
    return { ok: false, error: storeError?.message ?? 'Error al crear el store.' }
  }

  // ── 2. Inicializar tenant_config vacío ────────────────────────────────────
  // Todos los campos NULL → usa env vars globales hasta configurar los propios
  const { error: tenantError } = await supabase
    .from('tenant_config')
    .insert({ store_id: newStore.id })

  if (tenantError) {
    // No es fatal — el store funciona sin tenant_config (usa env vars)
    console.warn('[store-generator] tenant_config insert warning:', tenantError)
  }

  // ── 3. Crear primer admin si se proporcionó ownerEmail ────────────────────
  if (ownerEmail) {
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        store_id: newStore.id,
        email: ownerEmail.toLowerCase().trim(),
        role: 'owner',
      })

    if (adminError) {
      console.warn('[store-generator] admin_users insert warning:', adminError)
    }
  }

  return { ok: true, store: newStore }
}

// ─── Listar todos los stores (para platform admin) ────────────────────────────

export interface StoreListItem {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  currency: string
  base_url: string | null
  created_at: string
  _admin_count?: number
}

export async function listAllStores(): Promise<StoreListItem[]> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('store_config')
    .select('id, name, slug, status, plan, currency, base_url, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as StoreListItem[]
}

// ─── Cambiar estado de un store ───────────────────────────────────────────────

export async function setStoreStatus(
  storeId: string,
  status: 'active' | 'inactive' | 'suspended',
): Promise<{ ok: boolean; error?: string }> {
  const supabase = createServiceClient()
  const { error } = await supabase
    .from('store_config')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', storeId)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
