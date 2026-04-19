import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createStore, listAllStores } from '@/lib/store-generator'

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function requirePlatformAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient()
  const { count } = await service
    .from('platform_users')
    .select('*', { count: 'exact', head: true })

  // Bootstrap mode: no platform_users yet — any authenticated user can access
  if (!count || count === 0) return user

  const { data } = await service
    .from('platform_users')
    .select('id, role')
    .eq('email', user.email!)
    .maybeSingle()

  return data ? user : null
}

// ─── GET /api/platform/stores ─────────────────────────────────────────────────

export async function GET() {
  const user = await requirePlatformAccess()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const stores = await listAllStores()
  return NextResponse.json({ data: stores })
}

// ─── POST /api/platform/stores ────────────────────────────────────────────────

export async function POST(req: Request) {
  const user = await requirePlatformAccess()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, slug, templateId, currency, locale, plan, ownerEmail } = body

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'name y slug son requeridos.' }, { status: 400 })
    }

    const result = await createStore({
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      templateId: templateId || undefined,
      currency: currency || 'ARS',
      locale: locale || 'es-AR',
      plan: plan || 'free',
      ownerEmail: ownerEmail?.trim() || undefined,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json({ ok: true, store: result.store }, { status: 201 })
  } catch (e) {
    console.error('[api/platform/stores POST]', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
