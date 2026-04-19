import { createServiceClient } from '@/lib/supabase/server'
import { listAllStores } from '@/lib/store-generator'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Stores — Platform' }

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'

// ─── Estilos ──────────────────────────────────────────────────────────────────

const PLAN_BADGE: Record<string, string> = {
  free:       'bg-slate-700 text-slate-300',
  starter:    'bg-blue-900/60 text-blue-300',
  pro:        'bg-purple-900/60 text-purple-300',
  enterprise: 'bg-amber-900/60 text-amber-300',
}

const STATUS_CFG: Record<string, { dot: string; label: string; color: string }> = {
  active:    { dot: 'bg-green-500',  label: 'Activo',     color: 'text-green-400'  },
  inactive:  { dot: 'bg-slate-500',  label: 'Inactivo',   color: 'text-slate-400'  },
  suspended: { dot: 'bg-red-500',    label: 'Suspendido', color: 'text-red-400'    },
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MonitorStatus = 'ok' | 'error' | 'unknown'

interface MonitorSummary {
  status: MonitorStatus
  failCount: number
  lastChecked: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

function getStoreUrl(slug: string, primaryDomain: string | null): string {
  if (process.env.NODE_ENV === 'development') {
    return `http://${slug}.localhost:3000`
  }
  if (primaryDomain) return `https://${primaryDomain}`
  return `https://${slug}.${ROOT_DOMAIN}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StoresPage() {
  const supabase = createServiceClient()
  const stores = await listAllStores()
  const storeIds = stores.map((s) => s.id)

  // Datos complementarios en paralelo (solo si hay stores)
  let primaryDomains: Array<{ store_id: string; domain: string }> = []
  let monitorRows: Array<{ store_id: string | null; status: string; last_checked_at: string }> = []

  if (storeIds.length > 0) {
    const [domainsRes, incidentsRes] = await Promise.all([
      supabase
        .from('store_domains')
        .select('store_id, domain')
        .in('store_id', storeIds)
        .eq('is_primary', true),
      supabase
        .from('monitor_incidents')
        .select('store_id, status, last_checked_at')
        .in('store_id', storeIds),
    ])
    primaryDomains = (domainsRes.data ?? []) as typeof primaryDomains
    monitorRows = (incidentsRes.data ?? []) as typeof monitorRows
  }

  // Mapa: store_id → dominio principal
  const domainMap = new Map<string, string>()
  for (const d of primaryDomains) {
    domainMap.set(d.store_id, d.domain)
  }

  // Mapa: store_id → resumen de monitor
  const monitorMap = new Map<string, MonitorSummary>()
  for (const row of monitorRows) {
    if (!row.store_id) continue
    const cur = monitorMap.get(row.store_id) ?? {
      status: 'ok' as MonitorStatus,
      failCount: 0,
      lastChecked: null,
    }
    if (row.status === 'fail') {
      cur.status = 'error'
      cur.failCount++
    }
    if (!cur.lastChecked || row.last_checked_at > cur.lastChecked) {
      cur.lastChecked = row.last_checked_at
    }
    monitorMap.set(row.store_id, cur)
  }

  // Contadores para el header
  const errorCount = [...monitorMap.values()].filter((m) => m.status === 'error').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Stores</h1>
          <p className="text-slate-400 text-sm mt-1">
            {stores.length} store{stores.length !== 1 ? 's' : ''}
            {errorCount > 0 && (
              <span className="ml-2 text-red-400 font-semibold">
                · {errorCount} con errores
              </span>
            )}
          </p>
        </div>
        <Link
          href="/platform/stores/new"
          className="px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors"
        >
          + Crear store
        </Link>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              <Th>Store</Th>
              <Th>Dominio</Th>
              <Th>Plan</Th>
              <Th>Estado</Th>
              <Th>Monitor</Th>
              <Th>Últ. check</Th>
              <Th align="right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => {
              const statusCfg = STATUS_CFG[store.status] ?? STATUS_CFG.inactive
              const primaryDomain = domainMap.get(store.id) ?? null
              const monitor = monitorMap.get(store.id) ?? null
              const storeUrl = getStoreUrl(store.slug, primaryDomain)
              const adminUrl = `${storeUrl}/admin`

              return (
                <tr
                  key={store.id}
                  className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40 transition-colors"
                >
                  {/* Store */}
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-white leading-tight">{store.name}</p>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{store.slug}</p>
                  </td>

                  {/* Dominio */}
                  <td className="px-4 py-3.5">
                    {primaryDomain ? (
                      <span className="text-sm font-mono text-white">{primaryDomain}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono text-slate-400">
                          {store.slug}.{ROOT_DOMAIN}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-500 border border-slate-700/80">
                          preview
                        </span>
                      </span>
                    )}
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${PLAN_BADGE[store.plan] ?? PLAN_BADGE.free}`}
                    >
                      {store.plan}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusCfg.dot}`} />
                      <span className={`text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </span>
                  </td>

                  {/* Monitor */}
                  <td className="px-4 py-3.5">
                    <MonitorBadge summary={monitor} />
                  </td>

                  {/* Última verificación */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 tabular-nums">
                    {formatRelative(monitor?.lastChecked ?? null)}
                  </td>

                  {/* Acciones */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-4">
                      <a
                        href={storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-white transition-colors"
                      >
                        Store ↗
                      </a>
                      <a
                        href={adminUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-white transition-colors"
                      >
                        Admin ↗
                      </a>
                      <Link
                        href={`/platform/stores/${store.id}`}
                        className="text-xs text-slate-400 hover:text-white transition-colors font-medium"
                      >
                        Detalle →
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}

            {stores.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  No hay stores.{' '}
                  <Link href="/platform/stores/new" className="text-white hover:underline">
                    Crear el primero →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 text-${align}`}
    >
      {children}
    </th>
  )
}

function MonitorBadge({ summary }: { summary: MonitorSummary | null }) {
  if (!summary) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        <span className="text-xs text-slate-600">Sin datos</span>
      </span>
    )
  }
  if (summary.status === 'error') {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        <span className="text-xs font-semibold text-red-400">
          {summary.failCount} error{summary.failCount !== 1 ? 'es' : ''}
        </span>
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
      <span className="text-xs font-semibold text-green-400">OK</span>
    </span>
  )
}
