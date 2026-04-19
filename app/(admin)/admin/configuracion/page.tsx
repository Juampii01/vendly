import { getStoreConfig } from '@/lib/store'
import { StoreConfigForm } from '@/components/admin/StoreConfigForm'
import { DomainManager } from '@/components/admin/DomainManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Configuración — Admin' }

export default async function ConfiguracionPage() {
  const store = await getStoreConfig()

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Personalizá el nombre, colores, hero, envío y más de tu tienda.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <StoreConfigForm store={store} />
      </div>

      {/* Dominios propios */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Dominios propios</h2>
          <p className="mt-1 text-sm text-slate-500">
            Conectá tu dominio (ej: <span className="font-medium">matienda.com</span>) para que tus clientes no vean &ldquo;vendly.com&rdquo; en la URL.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
          <DomainManager />
        </div>
      </div>
    </div>
  )
}
