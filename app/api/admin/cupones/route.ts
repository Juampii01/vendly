import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireStoreAdmin } from '@/lib/auth'

const COUPON_CODE_RE = /^[A-Z0-9_-]{3,32}$/

export async function GET() {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const { data, error } = await service
    .from('coupons')
    .select('*')
    .eq('store_id', auth.storeId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const auth = await requireStoreAdmin()
  if ('error' in auth) return auth.error

  const service = createServiceClient()
  const body = await req.json()
  const { code, type, value, max_uses, min_order_amount, expires_at, description } = body

  // ── Validación ────────────────────────────────────────────────────────────
  if (!code || !type || value == null) {
    return NextResponse.json({ error: 'code, type y value son requeridos' }, { status: 400 })
  }

  const normalizedCode = String(code).trim().toUpperCase()
  if (!COUPON_CODE_RE.test(normalizedCode)) {
    return NextResponse.json(
      { error: 'El código debe tener 3-32 caracteres (A-Z, 0-9, _ o -)' },
      { status: 400 },
    )
  }

  if (!['percentage', 'fixed'].includes(type)) {
    return NextResponse.json({ error: 'type inválido' }, { status: 400 })
  }

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return NextResponse.json({ error: 'El valor debe ser mayor a 0' }, { status: 400 })
  }
  if (type === 'percentage' && numericValue > 100) {
    return NextResponse.json({ error: 'El porcentaje no puede ser mayor a 100' }, { status: 400 })
  }

  let normalizedMaxUses: number | null = null
  if (max_uses !== null && max_uses !== undefined && max_uses !== '') {
    const n = Number(max_uses)
    if (!Number.isFinite(n) || n < 1) {
      return NextResponse.json({ error: 'max_uses debe ser un entero ≥ 1' }, { status: 400 })
    }
    normalizedMaxUses = Math.floor(n)
  }

  let normalizedMin: number | null = null
  if (min_order_amount !== null && min_order_amount !== undefined && min_order_amount !== '') {
    const n = Number(min_order_amount)
    if (!Number.isFinite(n) || n < 0) {
      return NextResponse.json({ error: 'min_order_amount no puede ser negativo' }, { status: 400 })
    }
    normalizedMin = n
  }

  if (expires_at) {
    const exp = new Date(expires_at)
    if (isNaN(exp.getTime())) {
      return NextResponse.json({ error: 'expires_at inválido' }, { status: 400 })
    }
    if (exp.getTime() <= Date.now()) {
      return NextResponse.json({ error: 'La fecha de expiración debe ser futura' }, { status: 400 })
    }
  }

  let normalizedDescription: string | null = null
  if (description != null && String(description).trim() !== '') {
    const trimmed = String(description).trim()
    if (trimmed.length > 200) {
      return NextResponse.json({ error: 'La descripción no puede superar los 200 caracteres' }, { status: 400 })
    }
    normalizedDescription = trimmed
  }

  const { data, error } = await service
    .from('coupons')
    .insert({
      store_id: auth.storeId,
      code: normalizedCode,
      type,
      value: numericValue,
      max_uses: normalizedMaxUses,
      min_order_amount: normalizedMin,
      expires_at: expires_at || null,
      description: normalizedDescription,
      is_active: true,
      uses_count: 0,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código en este store' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
