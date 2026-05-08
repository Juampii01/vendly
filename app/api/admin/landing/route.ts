import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'
import type { LandingSection, SectionType } from '@/types'

const VALID_SECTION_TYPES: Set<SectionType> = new Set([
  'hero', 'about', 'services', 'testimonials', 'pricing', 'gallery', 'faq', 'contact',
])

const VALID_SITE_TYPES = new Set([
  'ecommerce', 'landing', 'portfolio', 'restaurant', 'services',
  'modo', 'athletic', 'dealership', 'libreria', 'vendly-marketing', 'real-estate', 'gym',
])

function validateSections(input: unknown): { ok: true; value: LandingSection[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: 'sections debe ser un array' }
  const seenIds = new Set<string>()
  const out: LandingSection[] = []
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') return { ok: false, error: 'sección inválida' }
    const s = raw as Record<string, unknown>
    if (typeof s.id !== 'string' || !s.id) return { ok: false, error: 'section.id inválido' }
    if (seenIds.has(s.id)) return { ok: false, error: `section.id duplicado: ${s.id}` }
    seenIds.add(s.id)
    if (typeof s.type !== 'string' || !VALID_SECTION_TYPES.has(s.type as SectionType)) {
      return { ok: false, error: `section.type inválido: ${String(s.type)}` }
    }
    if (typeof s.active !== 'boolean') return { ok: false, error: 'section.active debe ser boolean' }
    if (!s.content || typeof s.content !== 'object') return { ok: false, error: 'section.content debe ser objeto' }
    out.push(s as unknown as LandingSection)
  }
  return { ok: true, value: out }
}

export async function PATCH(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const { sections, site_type } = await req.json() as {
    sections?: unknown
    site_type?: unknown
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

  if (sections !== undefined) {
    const validated = validateSections(sections)
    if (!validated.ok) return NextResponse.json({ error: validated.error }, { status: 400 })
    updates.sections = validated.value
  }

  if (site_type !== undefined) {
    if (typeof site_type !== 'string' || !VALID_SITE_TYPES.has(site_type)) {
      return NextResponse.json({ error: 'site_type inválido' }, { status: 400 })
    }
    updates.site_type = site_type
  }

  if (Object.keys(updates).length <= 1) {
    return NextResponse.json({ error: 'Sin cambios' }, { status: 400 })
  }

  const service = createServiceClient()
  const { error } = await service
    .from('store_config')
    .update(updates)
    .eq('id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
