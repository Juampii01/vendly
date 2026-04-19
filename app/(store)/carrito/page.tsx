import { getStoreConfig } from '@/lib/store'
import { getSiteFeatures } from '@/lib/site-features'
import { CartPageClient } from '@/components/store/CartPageClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return { title: `Carrito — ${store.name}` }
}

export default async function CarritoPage() {
  const store = await getStoreConfig()
  const features = getSiteFeatures(store.site_type)
  // Bloquea la página de carrito para tipos de sitio sin checkout (ej: dealership, landing)
  if (!features.hasCheckout) notFound()
  return <CartPageClient store={store} />
}
