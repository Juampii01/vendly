import { createServiceClient } from '@/lib/supabase/server'
import { listAllStores } from '@/lib/store-generator'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Stores — Platform' }

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'

// ─── Config ──────────────────────────────────────────────────────────────────

const PLAN_CFG: Record<string, { bg: string; text: string; border: string }> = {
  free:       { bg: '#1e293b',  text: '#64748b', border: '#293548' },
  starter:    { bg: '#1e3a5f',  text: '#60a5fa', border: '#1d4ed8' },
  pro:        { bg: '#2e1a4a',  text: '#a78bfa', border: '#7c3aed' },
  enterprise: { bg: '#422006',  text: '#fbbf24', border: '#d97706' },
}

const STATUS_CFG: Record<string, { dot: string; label: string; text: string }> = {
  active:    { dot: '#10b981', label: 'Activo',     text: '#10b981' },
  inactive:  { dot: '#475569', label: 'Inactivo',   text: '#475569' },
  suspended: { dot: '#ef4444', label: 'Suspendido', text: '#ef4444' },
}

type MonitorStatus = 'ok' | 'error' | 'unknown'
interface MonitorSummary {
  status: MonitorStatus
  failCount: number
  lastChecked: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatRelative(iso: string | null): string {
  if (!iso) return '—'
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

function getStoreUrl(slug: string, domain: string | null): string {
  if (process.env.NODE_ENV === 'development') return `http://${slug}.localhost:3000`
  if (domain) return `https://${domain}`
  return `https://${slug}.${ROOT_DOMAIN}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StoresPage() {
  const supabase = createServiceClient()
  const stores = await listAllStores()
  const storeIds = stores.map((s) => s.id)

  let primaryDomains: Array<{ store_id: string; domain: string }> = []
  let monitorRows: Array<{ store_id: string | null; status: string; last_checked_at: string }> = []

  if (storeIds.length > 0) {
    const [domainsRes, incidentsRes] = await Promise.all([
      supabase.from('store_domains').select('store_id, domain').in('store_id', storeIds).eq('is_primary', true),
      supabase.from('monitor_incidents').select('store_id, status, last_checked_at').in('store_id', storeIds),
    ])
    primaryDomains = (domainsRes.data ?? []) as typeof primaryDomains
    monitorRows = (incidentsRes.data ?? []) as typeof monitorRows
  }

  const domainMap = new Map<string, string>()
  for (const d of primaryDomains) domainMap.set(d.store_id, d.domain)

  const monitorMap = new Map<string, MonitorSummary>()
  for (const row of monitorRows) {
    if (!row.store_id) continue
    const cur = monitorMap.get(row.store_id) ?? { status: 'ok' as MonitorStatus, failCount: 0, lastChecked: null }
    if (row.status === 'fail') { cur.status = 'error'; cur.failCount++ }
    if (!cur.lastChecked || row.last_checked_at > cur.lastChecked) cur.lastChecked = row.last_checked_at
    monitorMap.set(row.store_id, cur)
  }

  const errorCount = [...monitorMap.values()].filter((m) => m.status === 'error').length
  const activeCount = stores.filter((s) => s.status === 'active').length

  return (
    <div className="min-h-full" style={{ backgroundColor: '#080d14' }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-6 border-b" style={{ borderColor: '#1a2535' }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1">
              Platform Console
            </p>
            <h1 className="text-2xl font-black text-white">Stores</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-sm text-slate-500">
                {stores.length} store{stores.length !== 1 ? 's' : ''} · {activeCount} activos
              </span>
              {errorCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  {errorCount} con errores
                </span>
              )}
            </div>
          </div>
          <Link
            href="/platform/stores/new"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shrink-0 hover:brightness-110 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <span>+</span>
            <span>Crear store</span>
          </Link>
        </div>
      </div>

      {/* ── Stores grid ──────────────────────────────────────────────────── */}
      <div className="px-8 py-8">
        {stores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
              style={{ backgroundColor: '#1a2535' }}
            >
              <EmptyIcon />
            </div>
            <p className="text-lg font-bold text-white mb-1">No hay stores</p>
            <p className="text-sm text-slate-500 mb-6">Creá el primer store para empezar.</p>
            <Link
              href="/platform/stores/new"
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              Crear primer store →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {stores.map((store) => {
              const domain = domainMap.get(store.id) ?? null
              const monitor = monitorMap.get(store.id) ?? null
              const storeUrl = getStoreUrl(store.slug, domain)
              const planCfg = PLAN_CFG[store.plan] ?? PLAN_CFG.free
              const statusCfg = STATUS_CFG[store.status] ?? STATUS_CFG.inactive
              const accent = store.color_accent ?? '#6366f1'

              return (
                <div
                  key={store.id}
                  className="group relative rounded-2xl border overflow-hidden transition-all hover:border-indigo-500/30"
                  style={{ backgroundColor: '#0d1520', borderColor: '#1a2535' }}
                >
                  {/* Accent top bar */}
                  <div className="h-0.5 w-full" style={{ backgroundColor: accent }} />

                  <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-white font-black text-sm"
                          style={{ backgroundColor: accent + '25', color: accent }}
                        >
                          {store.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate leading-tight">{store.name}</p>
                          <p className="text-[11px] font-mono text-slate-600 mt-0.5">{store.slug}</p>
                        </div>
                      </div>
                      <MonitorPill monitor={monitor} />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border"
                        style={{ backgroundColor: planCfg.bg, color: planCfg.text, borderColor: planCfg.border }}
                      >
                        {store.plan}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs" style={{ color: statusCfg.text }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: statusCfg.dot }} />
                        {statusCfg.label}
                      </span>
                      {store.site_type && store.site_type !== 'general' && (
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{ backgroundColor: '#1a2535', color: '#64748b' }}
                        >
                          {store.site_type}
                        </span>
                      )}
                    </div>

                    {/* Domain */}
                    <div
                      className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2"
                      style={{ backgroundColor: '#111c2d' }}
                    >
                      <GlobeIcon />
                      <span className="text-xs font-mono text-slate-400 truncate">
                        {domain ?? `${store.slug}.${ROOT_DOMAIN}`}
                      </span>
                      {!domain && (
                        <span
                          className="ml-auto shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                          style={{ backgroundColor: '#1a2535', color: '#475569' }}
                        >
                          preview
                        </span>
                      )}
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">
                        {new Date(store.created_at).toLocaleDateString('es-AR')}
                        {monitor?.lastChecked && (
                          <> · check {formatRelative(monitor.lastChecked)}</>
                        )}
                      </span>
                      <div className="flex items-center gap-3">
                        <a
                          href={storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-600 hover:text-white transition-colors"
                        >
                          Store ↗
                        </a>
                        <a
                          href={`${storeUrl}/admin`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-600 hover:text-white transition-colors"
                        >
                          Admin ↗
                        </a>
                        <Link
                          href={`/platform/stores/${store.id}`}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Gestionar →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MonitorPill({ monitor }: { monitor: MonitorSummary | null }) {
  if (!monitor) {
    return (
      <span
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold shrink-0"
        style={{ backgroundColor: '#1a2535', color: '#475569' }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        Sin datos
      </span>
    )
  }
  if (monitor.status === 'error') {
    return (
      <span
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold shrink-0"
        style={{ backgroundColor: '#3f0f0f', color: '#f87171' }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        {monitor.failCount} error{monitor.failCount !== 1 ? 'es' : ''}
      </span>
    )
  }
  return (
    <span
      className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold shrink-0"
      style={{ backgroundColor: '#0a2918', color: '#34d399' }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      OK
    </span>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
