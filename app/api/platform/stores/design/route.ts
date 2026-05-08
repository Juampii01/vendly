import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requirePlatformAccess } from '@/lib/auth'

const HEX_RE = /^#[0-9a-fA-F]{6}$/
const COLOR_FIELDS = new Set([
  'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
])

const ALLOWED = [
  'name', 'logo_url',
  'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
  'hero_title', 'hero_subtitle', 'hero_cta_label', 'hero_cta_url', 'hero_image_url',
  'home_marquee_items', 'home_split_image_url',
  'home_editorial_label', 'home_editorial_title', 'home_editorial_body',
  'meta_title', 'meta_description',
  'whatsapp_number', 'email', 'instagram_url',
  'free_shipping_threshold', 'shipping_base_price',
  'currency', 'locale', 'base_url',
  'sections',
] as const

export async function PATCH(req: Request) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { storeId, changes } = await req.json()
  if (!storeId || typeof storeId !== 'string' || !changes || typeof changes !== 'object') {
    return NextResponse.json({ error: 'storeId y changes requeridos' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of ALLOWED) {
    if (!(key in changes)) continue
    const v = (changes as Record<string, unknown>)[key]

    if (COLOR_FIELDS.has(key)) {
      if (v !== null && (typeof v !== 'string' || !HEX_RE.test(v))) {
        return NextResponse.json({ error: `${key} debe ser hex #RRGGBB` }, { status: 400 })
      }
    }

    if (key === 'sections' && v !== null && !Array.isArray(v)) {
      return NextResponse.json({ error: 'sections debe ser array o null' }, { status: 400 })
    }

    if (key === 'home_marquee_items' && v !== null && !Array.isArray(v)) {
      return NextResponse.json({ error: 'home_marquee_items debe ser array o null' }, { status: 400 })
    }

    updates[key] = v
  }

  const service = createServiceClient()
  const { error } = await service.from('store_config').update(updates).eq('id', storeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
