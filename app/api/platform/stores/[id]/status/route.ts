import { NextResponse } from 'next/server'
import { setStoreStatus } from '@/lib/store-generator'
import { requirePlatformAccess } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { id } = await params

  try {
    const { status } = await req.json()
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
    }

    const result = await setStoreStatus(id, status)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[api/platform/stores/[id]/status PATCH]', e)
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
  }
}
