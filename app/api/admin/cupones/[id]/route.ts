import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const { is_active } = await req.json()
  const service = createServiceClient()

  const { error } = await service
    .from('coupons')
    .update({ is_active: !!is_active })
    .eq('id', id)
    .eq('store_id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const { id } = await params
  const service = createServiceClient()

  const { error } = await service
    .from('coupons')
    .delete()
    .eq('id', id)
    .eq('store_id', auth.storeId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
