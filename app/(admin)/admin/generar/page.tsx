import type { Metadata } from 'next'
import { getStoreConfig } from '@/lib/store'
import ContentAssistant from './ContentAssistant'

export const metadata: Metadata = { title: 'Contenido IA — Admin' }

export default async function ContenidoPage() {
  const store = await getStoreConfig()
  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Asistente de contenido</h1>
        <p className="text-slate-500 text-sm mt-1">
          Generá copy, descripciones, campañas y más para <span className="font-medium">{store.name}</span> con IA.
        </p>
      </div>
      <ContentAssistant store={store} />
    </div>
  )
}
