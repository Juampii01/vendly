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
  'free_shipping_threshold', 'shipping_base_price',
  'whatsapp_number', 'email', 'instagram_url',
  'meta_title', 'meta_description',
  'home_marquee_items', 'home_split_image_url',
  'home_editorial_label', 'home_editorial_title', 'home_editorial_body',
  'base_url', 'currency', 'locale',
  'site_type',
] as const

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
