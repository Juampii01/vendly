import { getStoreConfig } from '@/lib/store'
import { getSiteFeatures } from '@/lib/site-features'
import { CheckoutClient } from '@/components/store/CheckoutClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return { title: `Checkout — ${store.name}` }
}

export default async function CheckoutPage() {
  const store = await getStoreConfig()
  const features = getSiteFeatures(store.site_type)
  // Bloquea el checkout para tipos de sitio sin checkout (ej: dealership, landing)
  if (!features.hasCheckout) notFound()
  return <CheckoutClient store={store} />
}
