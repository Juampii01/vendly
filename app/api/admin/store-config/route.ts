import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

const HEX_RE = /^#[0-9a-fA-F]{6}$/
const COLOR_FIELDS = new Set([
  'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
  'hero_cta_color',
])
const VALID_SITE_TYPES = new Set([
  'ecommerce', 'landing', 'portfolio', 'restaurant', 'services',
  'modo', 'athletic', 'dealership', 'libreria', 'vendly-marketing', 'real-estate', 'gym',
])

const ALLOWED_FIELDS = [
  'name', 'logo_url', 'favicon_url',
  'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
  'hero_title', 'hero_subtitle', 'hero_cta_label', 'hero_cta_url', 'hero_image_url', 'hero_cta_color',
  'hero_image_position',
  'free_shipping_threshold', 'shipping_base_price',
  'whatsapp_number', 'email', 'instagram_url',
  'meta_title', 'meta_description',
  'home_marquee_items', 'home_split_image_url', 'home_split_image_position',
  'home_editorial_label', 'home_editorial_title', 'home_editorial_body',
  'base_url', 'currency', 'locale',
  'site_type',
  // Sistema config-driven de homes (ver components/store/HomeRenderer.tsx)
  'home_layout', 'theme_tokens',
] as const

// CSS object-position: keyword (top/bottom/left/right/center) o "X% Y%"
// Validamos formato simple para evitar inyección de CSS.
const POSITION_RE = /^(top|bottom|left|right|center|(\d{1,3}%\s+\d{1,3}%)|(top|bottom|center)\s+(left|right|center))$/i

const HOME_SECTION_TYPES = new Set([
  'hero', 'marquee', 'categoryGrid', 'editorialSplit', 'featuredProducts',
  'productScroll', 'instagramGallery', 'newsletter', 'trustBar',
])

function validateHomeLayout(v: unknown): { ok: true } | { ok: false; error: string } {
  if (v === null) return { ok: true }
  if (!Array.isArray(v)) return { ok: false, error: 'home_layout debe ser un array' }
  if (v.length > 50) return { ok: false, error: 'home_layout: máximo 50 secciones' }
  for (let i = 0; i < v.length; i++) {
    const s = v[i] as Record<string, unknown>
    if (!s || typeof s !== 'object')
      return { ok: false, error: `home_layout[${i}] debe ser un objeto` }
    if (typeof s.id !== 'string' || !s.id)
      return { ok: false, error: `home_layout[${i}].id debe ser string no vacío` }
    if (typeof s.type !== 'string' || !HOME_SECTION_TYPES.has(s.type))
      return { ok: false, error: `home_layout[${i}].type inválido: ${String(s.type)}` }
    if (typeof s.active !== 'boolean')
      return { ok: false, error: `home_layout[${i}].active debe ser boolean` }
    if (s.content === null || typeof s.content !== 'object')
      return { ok: false, error: `home_layout[${i}].content debe ser objeto` }
  }
  // Verificar IDs únicos para que React no se confunda con keys duplicadas
  const ids = new Set<string>()
  for (const s of v as Array<{ id: string }>) {
    if (ids.has(s.id)) return { ok: false, error: `IDs duplicados en home_layout: ${s.id}` }
    ids.add(s.id)
  }
  return { ok: true }
}

function validateThemeTokens(v: unknown): { ok: true } | { ok: false; error: string } {
  if (v === null || v === undefined) return { ok: true }
  if (typeof v !== 'object' || Array.isArray(v))
    return { ok: false, error: 'theme_tokens debe ser un objeto' }
  // Sin schema estricto — defaults en lib/theme.ts manejan ausencias.
  // Solo bloqueamos payloads obscenos.
  if (JSON.stringify(v).length > 10_000)
    return { ok: false, error: 'theme_tokens demasiado grande' }
  return { ok: true }
}

export async function PATCH(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  try {
    const body = await req.json()

    const updates: Record<string, unknown> = {}
    for (const key of ALLOWED_FIELDS) {
      if (!(key in body)) continue
      const v = body[key]

      // Validar colores hex (permitir null para "limpiar")
      if (COLOR_FIELDS.has(key)) {
        if (v === null || v === '') {
          updates[key] = null
          continue
        }
        if (typeof v !== 'string' || !HEX_RE.test(v)) {
          return NextResponse.json(
            { error: `${key} debe ser un color hex válido (#RRGGBB)` },
            { status: 400 },
          )
        }
      }

      if (key === 'site_type' && v !== null && !VALID_SITE_TYPES.has(v)) {
        return NextResponse.json({ error: 'site_type inválido' }, { status: 400 })
      }

      // CSS object-position — validar formato para evitar CSS injection
      if (key === 'hero_image_position' || key === 'home_split_image_position') {
        if (v === null || v === '' || v === undefined) {
          updates[key] = 'center'
          continue
        }
        if (typeof v !== 'string' || !POSITION_RE.test(v.trim())) {
          return NextResponse.json(
            { error: `${key}: formato inválido. Usá "center", "top", "50% 30%" etc.` },
            { status: 400 },
          )
        }
        updates[key] = v.trim()
        continue
      }

      if (key === 'free_shipping_threshold' || key === 'shipping_base_price') {
        if (v !== null && v !== '') {
          const n = Number(v)
          if (!Number.isFinite(n) || n < 0) {
            return NextResponse.json({ error: `${key} debe ser ≥ 0` }, { status: 400 })
          }
          updates[key] = n
          continue
        }
        updates[key] = null
        continue
      }

      if (key === 'home_marquee_items') {
        if (!Array.isArray(v)) {
          return NextResponse.json({ error: 'home_marquee_items debe ser un array' }, { status: 400 })
        }
        updates[key] = v.map(String).slice(0, 20)
        continue
      }

      if (key === 'home_layout') {
        const r = validateHomeLayout(v)
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
        updates[key] = v
        continue
      }

      if (key === 'theme_tokens') {
        const r = validateThemeTokens(v)
        if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
        updates[key] = v ?? {}
        continue
      }

      updates[key] = v
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const service = createServiceClient()
    const { error } = await service
      .from('store_config')
      .update(updates)
      .eq('id', auth.storeId)

    if (error) throw error

    // Invalidar solo los paths del store afectado (storefront y admin del tenant)
    revalidatePath('/', 'layout')

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[store-config]', e)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
