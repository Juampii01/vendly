import { getStoreConfig } from '@/lib/store'
import DesignStudio from './DesignStudio'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Estudio de diseño — Admin' }

// Sin padding de layout — el studio ocupa todo el espacio disponible
export default async function EstudioPage() {
  const store = await getStoreConfig()
  return <DesignStudio store={store} />
}
