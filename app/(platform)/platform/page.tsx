import { listAllStores } from '@/lib/store-generator'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Platform' }

export default async function PlatformDashboardPage() {
  const [stores, supabase] = [await listAllStores(), createServiceClient()]

  const activeStores = stores.filter((s) => s.status === 'active')

  // Métricas globales
  const [
    { count: totalOrders },
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  const planCounts = stores.reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Platform Dashboard</h1>
        <p className="text-slate-400 mt-1">Vista global de todos los stores en Vendly.</p>
      </div>

      {/* Métricas globales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Metric label="Stores totales" value={stores.length} />
        <Metric label="Stores activos" value={activeStores.length} color="green" />
        <Metric label="Órdenes totales" value={totalOrders ?? 0} />
        <Metric label="Productos activos" value={totalProducts ?? 0} />
      </div>

      {/* Distribución por plan */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 mb-3">Distribución por plan</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(planCounts).map(([plan, count]) => (
            <div key={plan} className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{plan}</span>
              <span className="ml-2 text-white font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de stores recientes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Stores</h2>
          <Link
            href="/platform/stores/new"
            className="px-4 py-2 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            + Crear store
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Store</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Creado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-white">{store.name}</td>
                  <td className="px-4 py-3 font-mono text-slate-400 text-xs">{store.slug}</td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={store.plan} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusDot status={store.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(store.created_at).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/platform/stores/${store.id}`}
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      Gestionar →
                    </Link>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No hay stores. <Link href="/platform/stores/new" className="text-white hover:underline">Crear el primero →</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-black ${color === 'green' ? 'text-green-400' : 'text-white'}`}>
        {value.toLocaleString()}
      </p>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    free: 'bg-slate-700 text-slate-300',
    starter: 'bg-blue-900 text-blue-300',
    pro: 'bg-purple-900 text-purple-300',
    enterprise: 'bg-amber-900 text-amber-300',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${colors[plan] ?? colors.free}`}>
      {plan}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const config: Record<string, { dot: string; label: string }> = {
    active: { dot: 'bg-green-500', label: 'Activo' },
    inactive: { dot: 'bg-slate-500', label: 'Inactivo' },
    suspended: { dot: 'bg-red-500', label: 'Suspendido' },
  }
  const { dot, label } = config[status] ?? config.inactive
  return (
    <span className="flex items-center gap-1.5 text-slate-300">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span className="text-xs">{label}</span>
    </span>
  )
}
