import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// PATCH /api/platform/stores/design  { storeId, changes }
export async function PATCH(req: Request) {
  // Verificar que es un platform user (x-user-email inyectado por middleware)
  const h = await headers()
  const userEmail = h.get('x-user-email')
  if (!userEmail) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { storeId, changes } = await req.json()
  if (!storeId || !changes) return NextResponse.json({ error: 'storeId y changes requeridos' }, { status: 400 })

  const allowed = [
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
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in changes) updates[key] = changes[key]
  }

  const service = createServiceClient()
  const { error } = await service.from('store_config').update(updates).eq('id', storeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
