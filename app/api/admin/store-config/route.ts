import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

export async function PATCH(req: Request) {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()

    // Whitelist of editable fields
    const allowed = [
      'name', 'logo_url', 'favicon_url',
      'color_primary', 'color_secondary', 'color_accent', 'color_background', 'color_text',
      'hero_title', 'hero_subtitle', 'hero_cta_label', 'hero_cta_url', 'hero_image_url',
      'free_shipping_threshold', 'shipping_base_price',
      'whatsapp_number', 'email', 'instagram_url',
      'meta_title', 'meta_description',
      // Home page configurable
      'home_marquee_items', 'home_split_image_url',
      'home_editorial_label', 'home_editorial_title', 'home_editorial_body',
      // Multi-tenant + localización
      'base_url', 'currency', 'locale',
    ]

    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
    }

    updates.updated_at = new Date().toISOString()

    const [service, storeId] = [createServiceClient(), await getStoreId()]
    const { error } = await service
      .from('store_config')
      .update(updates)
      .eq('id', storeId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }
}
