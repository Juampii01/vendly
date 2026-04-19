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

interface AnalyticsData {
  days: number
  total_orders: number
  period_orders: number
  period_revenue: number
  series: SeriesPoint[]
  stores: StoreMetric[]
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

      {/* KPI cards */}
      {data && (
        <>
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
