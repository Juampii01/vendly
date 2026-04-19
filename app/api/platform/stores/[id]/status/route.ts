import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { setStoreStatus } from '@/lib/store-generator'

async function requirePlatformAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient()
  const { count } = await service
    .from('platform_users')
    .select('*', { count: 'exact', head: true })

  if (!count || count === 0) return user

  const { data } = await service
    .from('platform_users')
    .select('id, role')
    .eq('email', user.email!)
    .maybeSingle()

  return data ? user : null
}

// PATCH /api/platform/stores/[id]/status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requirePlatformAccess()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
