import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { CuponesClient } from '@/components/admin/CuponesClient'
import type { Metadata } from 'next'
import type { Coupon } from '@/types'

export const metadata: Metadata = { title: 'Cupones — Admin' }

export default async function CuponesPage() {
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })

  return <CuponesClient initialCoupons={(coupons ?? []) as Coupon[]} />
}
