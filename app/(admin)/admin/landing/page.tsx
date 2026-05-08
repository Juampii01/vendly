import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { LandingEditor } from '@/components/admin/LandingEditor'
import { HomeLayoutEditor } from '@/components/admin/HomeLayoutEditor'
import { DEFAULT_SECTIONS } from '@/types'
import type { HomeSection } from '@/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Editor de página — Admin' }

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'
const IS_DEV = process.env.NODE_ENV === 'development'

export default async function LandingAdminPage() {
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  const { data: store } = await supabase
    .from('store_config')
    .select('site_type, sections, home_layout, slug, base_url')
    .eq('id', storeId)
    .single()

  const siteType = store?.site_type ?? 'ecommerce'
  const storeUrl = IS_DEV
    ? `http://${store?.slug}.localhost:3000`
    : store?.base_url ?? `https://${store?.slug}.${ROOT_DOMAIN}`

  // ── Routing por site_type ─────────────────────────────────────────────
  // landing: editor de "LandingSection[]" (sistema viejo, 8 tipos genéricos)
  // ecommerce / athletic / etc.: editor de "HomeSection[]" (sistema nuevo
  //   config-driven con 9 tipos específicos para tienda)
  if (siteType === 'landing') {
    const sections = store?.sections?.length ? store.sections : DEFAULT_SECTIONS
    return <LandingEditor initialSections={sections} siteType={siteType} storeUrl={storeUrl} />
  }

  const homeLayout = (store?.home_layout ?? []) as HomeSection[]
  return <HomeLayoutEditor initialLayout={homeLayout} storeUrl={storeUrl} />
}
