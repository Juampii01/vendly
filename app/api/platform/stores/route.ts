import { NextResponse } from 'next/server'
import { createStore, listAllStores } from '@/lib/store-generator'
import { requirePlatformAccess } from '@/lib/auth'

export async function GET() {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const stores = await listAllStores()
  return NextResponse.json({ data: stores })
}

export async function POST(req: Request) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

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
