import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import type { LandingSection } from '@/types'

// PATCH — guardar secciones de landing
export async function PATCH(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { sections, site_type } = await req.json() as { sections?: LandingSection[]; site_type?: string }

  const service = createServiceClient()
  const storeId = await getStoreId()

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (sections !== undefined) updates.sections = sections
  if (site_type !== undefined) updates.site_type = site_type

  const { error } = await service
    .from('store_config')
    .update(updates)
    .eq('id', storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
