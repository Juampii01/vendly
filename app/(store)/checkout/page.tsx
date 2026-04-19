import { getStoreConfig } from '@/lib/store'
import { CheckoutClient } from '@/components/store/CheckoutClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return { title: `Checkout — ${store.name}` }
}

export default async function CheckoutPage() {
  const store = await getStoreConfig()
  return <CheckoutClient store={store} />
}
