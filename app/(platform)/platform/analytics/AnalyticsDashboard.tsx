'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface SeriesPoint {
  date: string
  orders: number
  revenue: number
}

interface StoreMetric {
  id: string
  name: string
  slug: string
  status: string
  plan: string
  currency: string
  period_orders: number
  period_revenue: number
}

interface RiskStore {
  id: string
  name: string
  slug: string
  reason: string
  severity: 'high' | 'medium'
}

interface PlatformHealth {
  stores_by_status: { active: number; inactive: number; suspended: number }
  stores_by_plan: { free: number; starter: number; pro: number; enterprise: number }
  mrr_estimate_usd: number
  mrr_disclaimer: string
  gmv_period: number
  new_stores_in_period: number
  at_risk: RiskStore[]
}

interface AnalyticsData {
  days: number
  total_orders: number
  period_orders: number
  period_revenue: number
  series: SeriesPoint[]
  stores: StoreMetric[]
  platform: PlatformHealth
}

const DAYS_OPTIONS = [7, 14, 30, 60, 90]

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metric, setMetric] = useState<'orders' | 'revenue'>('orders')

  const load = useCallback(async (d: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/platform/analytics?days=${d}`)
      if (!res.ok) throw new Error('Error al cargar analytics.')
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(days) }, [days, load])

  if (error) {
    return <div className="text-red-400 text-sm">{error}</div>
  }

  return (
    <div className="space-y-8">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {DAYS_OPTIONS.map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              days === d
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600'
            }`}
          >
            {d}d
          </button>
        ))}
        {loading && <span className="text-xs text-slate-500 ml-2">Cargando...</span>}
      </div>

      {/* ── Platform Health (vista del líder Vendly) ────────────────────── */}
      {data?.platform && <PlatformHealthSection platform={data.platform} days={data.days} />}

      {/* KPI cards */}
      {data && (
        <>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Operación de tiendas — últimos {data.days} días
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPI label="Órdenes (período)" value={data.period_orders.toLocaleString()} />
              <KPI
                label={`Revenue (período)`}
                value={new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(data.period_revenue)}
                sub="solo órdenes pagas"
              />
              <KPI label="Órdenes totales (histórico)" value={data.total_orders.toLocaleString()} />
              <KPI label="Stores activos" value={data.stores.filter(s => s.status === 'active').length.toString()} />
            </div>
          </div>

          {/* Spark chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">
                {metric === 'orders' ? 'Órdenes por día' : 'Revenue por día'}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setMetric('orders')}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${metric === 'orders' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Órdenes
                </button>
                <button
                  onClick={() => setMetric('revenue')}
                  className={`text-xs px-3 py-1 rounded-lg transition-colors ${metric === 'revenue' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                >
                  Revenue
                </button>
              </div>
            </div>
            <MiniBarChart series={data.series} metric={metric} />
          </div>

          {/* Stores table */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
              Stores — últimos {days} días
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Store</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Plan</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Órdenes</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {data.stores.map(store => (
                    <tr key={store.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-900/50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{store.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{store.slug}</div>
                      </td>
                      <td className="px-4 py-3">
                        <PlanBadge plan={store.plan} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-white">
                        {store.period_orders.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-300 text-xs">
                        {store.period_revenue > 0
                          ? new Intl.NumberFormat('es-AR', {
                              style: 'currency',
                              currency: store.currency || 'ARS',
                              maximumFractionDigits: 0,
                            }).format(store.period_revenue)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/platform/stores/${store.id}`}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniBarChart({ series, metric }: { series: SeriesPoint[]; metric: 'orders' | 'revenue' }) {
  const values = series.map(s => s[metric])
  const max = Math.max(...values, 1)

  return (
    <div className="flex items-end gap-px h-28 w-full">
      {series.map((s, i) => {
        const h = Math.max((values[i] / max) * 100, values[i] > 0 ? 4 : 0)
        const isToday = i === series.length - 1
        return (
          <div key={s.date} className="flex-1 flex flex-col items-center justify-end group relative" title={`${s.date}: ${values[i]}`}>
            <div
              className={`w-full rounded-sm transition-colors ${isToday ? 'bg-white' : 'bg-slate-700 group-hover:bg-slate-500'}`}
              style={{ height: `${h}%`, minHeight: values[i] > 0 ? '3px' : '0' }}
            />
            {/* Label for every ~7th tick or first/last */}
            {(i % Math.max(1, Math.floor(series.length / 7)) === 0 || i === series.length - 1) && (
              <span className="absolute -bottom-5 text-[9px] text-slate-600 whitespace-nowrap">
                {new Date(s.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

const PLAN_COLORS: Record<string, string> = {
  free:       'bg-slate-700 text-slate-300',
  starter:    'bg-blue-900 text-blue-300',
  pro:        'bg-purple-900 text-purple-300',
  enterprise: 'bg-amber-900 text-amber-300',
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${PLAN_COLORS[plan] ?? PLAN_COLORS.free}`}>
      {plan}
    </span>
  )
}

// ─── Platform Health (vista del líder Vendly) ──────────────────────────────

function PlatformHealthSection({ platform, days }: { platform: PlatformHealth; days: number }) {
  const totalStores = platform.stores_by_status.active + platform.stores_by_status.inactive + platform.stores_by_status.suspended

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/30 p-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 mb-1">
            Salud Vendly
          </p>
          <h2 className="text-lg font-semibold text-white">Vista del líder</h2>
        </div>
        <p className="text-xs text-slate-500">Métricas del negocio plataforma, no de tiendas individuales</p>
      </div>

      {/* Top KPIs — leader-level */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <LeaderKPI
          label="MRR estimado"
          value={`US$ ${platform.mrr_estimate_usd.toLocaleString()}`}
          sub="estimación basada en plan"
          tone="amber"
        />
        <LeaderKPI
          label="Total stores"
          value={totalStores.toString()}
          sub={`${platform.stores_by_status.active} activos · ${platform.stores_by_status.suspended} suspendidos`}
        />
        <LeaderKPI
          label="GMV procesado"
          value={new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(platform.gmv_period)}
          sub={`últimos ${days} días, sumado entre todas las tiendas`}
        />
        <LeaderKPI
          label="Stores nuevos"
          value={platform.new_stores_in_period.toString()}
          sub={`creados en últimos ${days} días`}
          tone={platform.new_stores_in_period > 0 ? 'green' : undefined}
        />
      </div>

      {/* Plan distribution + risk side-by-side */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Plan distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Distribución por plan
          </p>
          <div className="space-y-2">
            {(['free', 'starter', 'pro', 'enterprise'] as const).map(plan => {
              const count = platform.stores_by_plan[plan]
              const pct = totalStores > 0 ? (count / totalStores) * 100 : 0
              return (
                <div key={plan} className="flex items-center gap-3">
                  <PlanBadge plan={plan} />
                  <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${PLAN_BAR_COLORS[plan]} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white w-10 text-right">{count}</span>
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-slate-600 mt-3 leading-relaxed">
            {platform.mrr_disclaimer}
          </p>
        </div>

        {/* Stores en riesgo */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Stores en riesgo
            </p>
            <span className="text-xs font-mono text-slate-500">{platform.at_risk.length}</span>
          </div>
          {platform.at_risk.length === 0 ? (
            <p className="text-sm text-emerald-500/70 py-4">
              ✓ Todas las tiendas activas en buen estado
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {platform.at_risk.map(store => (
                <Link
                  key={store.id}
                  href={`/platform/stores/${store.id}`}
                  className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-900 transition-colors"
                >
                  <span className={`mt-1 inline-block w-1.5 h-1.5 rounded-full ${store.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{store.name}</p>
                    <p className="text-xs text-slate-500 leading-snug">{store.reason}</p>
                  </div>
                  <span className="text-slate-600 text-xs">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LeaderKPI({ label, value, sub, tone }: {
  label: string; value: string; sub?: string; tone?: 'amber' | 'green'
}) {
  const valueClass =
    tone === 'amber' ? 'text-amber-400'
    : tone === 'green' ? 'text-emerald-400'
    : 'text-white'
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-black ${valueClass}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-1 leading-snug">{sub}</p>}
    </div>
  )
}

const PLAN_BAR_COLORS: Record<string, string> = {
  free:       'bg-slate-600',
  starter:    'bg-blue-500',
  pro:        'bg-purple-500',
  enterprise: 'bg-amber-500',
}
