import { getStoreConfig } from '@/lib/store'
import { CartPageClient } from '@/components/store/CartPageClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return { title: `Carrito — ${store.name}` }
}

export default async function CarritoPage() {
  const store = await getStoreConfig()
  return <CartPageClient store={store} />
}
