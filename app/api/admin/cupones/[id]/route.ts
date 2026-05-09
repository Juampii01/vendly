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
  const body = await req.json()
  const service = createServiceClient()

  const update: Record<string, unknown> = {}

  if ('is_active' in body) {
    update.is_active = !!body.is_active
  }

  if ('description' in body) {
    if (body.description == null || String(body.description).trim() === '') {
      update.description = null
    } else {
      const trimmed = String(body.description).trim()
      if (trimmed.length > 200) {
        return NextResponse.json({ error: 'La descripción no puede superar los 200 caracteres' }, { status: 400 })
      }
      update.description = trimmed
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Sin campos para actualizar' }, { status: 400 })
  }

  const { error } = await service
    .from('coupons')
    .update(update)
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
