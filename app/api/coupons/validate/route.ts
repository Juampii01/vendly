import { NextRequest, NextResponse } from 'next/server'
import { validateCoupon } from '@/lib/store'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) {
    return NextResponse.json({ data: null, error: 'Missing code' }, { status: 400 })
  }

  const coupon = await validateCoupon(code)
  if (!coupon) {
    return NextResponse.json({ data: null, error: 'Cupón inválido o expirado' }, { status: 404 })
  }

  return NextResponse.json({ data: coupon, error: null })
}
