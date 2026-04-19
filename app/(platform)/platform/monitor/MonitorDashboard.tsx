'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MultiHealthData, CheckResult, StoreHealth } from '@/lib/monitor'

const REFRESH_INTERVAL = 60

const CATEGORY_LABELS: Record<string, string> = {
  page:        'Páginas',
  api:         'APIs',
  seo:         'SEO & PWA',
  integration: 'Integraciones',
}

export default function MonitorDashboard() {
  const [data, setData] = useState<MultiHealthData | null>(null)
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/platform/monitor', { cache: 'no-store' })
      const json = await res.json()
      setData(json)
      setLastRefresh(new Date())
      setCountdown(REFRESH_INTERVAL)
      // Expandir todos los stores por defecto
      setExpandedStores(new Set(json.stores?.map((s: { id: string }) => s.id) ?? []))
    } finally {
      setLoading(false)
    }
  }, [])

  const triggerCron = useCallback(async () => {
    setRunning(true)
    try {
      await fetch('/api/cron/monitor', { cache: 'no-store' })
      await fetchHealth()
    } finally {
      setRunning(false)
    }
  }, [fetchHealth])

  useEffect(() => {
    fetchHealth()
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { fetchHealth(); return REFRESH_INTERVAL }
        return c - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchHealth])

  const hasErrors   = data ? data.summary.failing > 0 : false
  const hasWarnings = data ? data.summary.warnings > 0 : false
  const allOk       = data ? !hasErrors && !hasWarnings : false

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="p-6 md:p-8 max-w-5xl">

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Monitor</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Auto-refresh en {countdown}s
              {lastRefresh && ` · ${lastRefresh.toLocaleTimeString('es-AR')}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <RefreshIcon spinning={loading} />
              Verificar
            </button>
            <button
              onClick={triggerCron}
              disabled={running}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <CronIcon />
              {running ? 'Ejecutando…' : 'Correr cron'}
            </button>
          </div>
        </div>

        {/* ── Estado global ── */}
        {data && (
          <div className={`mb-6 rounded-2xl border px-5 py-4 flex items-center justify-between ${
            hasErrors   ? 'border-red-800 bg-red-950/40'
            : hasWarnings ? 'border-yellow-800/60 bg-yellow-950/20'
            : 'border-green-800 bg-green-950/50'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {hasErrors ? '🚨' : hasWarnings ? '⚠️' : '✅'}
              </span>
              <div>
                <p className={`font-semibold text-sm ${
                  hasErrors ? 'text-red-300' : hasWarnings ? 'text-yellow-300' : 'text-green-300'
                }`}>
                  {hasErrors
                    ? `${data.summary.failing} error${data.summary.failing > 1 ? 'es' : ''} — algo está roto`
                    : hasWarnings
                    ? `Stores OK · ${data.summary.warnings} integración${data.summary.warnings > 1 ? 'es' : ''} sin configurar`
                    : 'Todo funciona correctamente'
                  }
                </p>
                <p className="text-xs text-slate-500">
                  {data.stores.length} store{data.stores.length !== 1 ? 's' : ''} monitoreados
                  {data.summary.stores_failing > 0 && ` · ${data.summary.stores_failing} store${data.summary.stores_failing > 1 ? 's' : ''} con errores`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {data.summary.ok}<span className="text-base text-slate-500">/{data.summary.total}</span>
              </p>
              <p className="text-[10px] text-slate-500">checks OK</p>
            </div>
          </div>
        )}

        {!data && !loading && (
          <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-800 py-16 text-center">
            <p className="text-sm text-slate-500">Cargando…</p>
          </div>
        )}

        {data && (
          <div className="space-y-4">

            {/* ── Integraciones (compartidas) ── */}
            <IntegrationSection checks={data.integrations} />

            {/* ── Stores ── */}
            {data.stores.map(store => (
              <StoreSection
                key={store.id}
                store={store}
                expanded={expandedStores.has(store.id)}
                onToggle={() => setExpandedStores(prev => {
                  const next = new Set(prev)
                  next.has(store.id) ? next.delete(store.id) : next.add(store.id)
                  return next
                })}
              />
            ))}

            {data.stores.length === 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 py-12 text-center">
                <p className="text-sm text-slate-500">No hay stores activos para monitorear.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Integraciones ────────────────────────────────────────────────────────────

function IntegrationSection({ checks }: { checks: CheckResult[] }) {
  const errors   = checks.filter(c => !c.ok && !c.warning).length
  const warnings = checks.filter(c => !c.ok && c.warning).length
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300">Integraciones</h2>
        {errors > 0
          ? <span className="text-[11px] font-semibold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full">{errors} error{errors > 1 ? 'es' : ''}</span>
          : warnings > 0
          ? <span className="text-[11px] font-semibold text-yellow-400 bg-yellow-950/40 px-2 py-0.5 rounded-full">{warnings} sin configurar</span>
          : <span className="text-[11px] font-semibold text-green-400 bg-green-950/60 px-2 py-0.5 rounded-full">OK</span>
        }
      </div>
      <div className="divide-y divide-slate-800/60">
        {checks.map(c => <CheckRow key={c.name} check={c} />)}
      </div>
    </div>
  )
}

// ─── Store section ────────────────────────────────────────────────────────────

function StoreSection({ store, expanded, onToggle }: {
  store: StoreHealth
  expanded: boolean
  onToggle: () => void
}) {
  const { failing } = store.summary
  const byCategory = new Map<string, CheckResult[]>()
  for (const c of store.checks) {
    const arr = byCategory.get(c.category) ?? []
    arr.push(c)
    byCategory.set(c.category, arr)
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
      {/* Store header — clickeable para expandir */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3.5 border-b border-slate-800 hover:bg-slate-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className={`h-2 w-2 rounded-full shrink-0 ${failing === 0 ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <span className="text-sm font-semibold text-white">{store.name}</span>
            <span className="ml-2 text-xs font-mono text-slate-500">{store.slug}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {failing > 0
            ? <span className="text-[11px] font-semibold text-red-400 bg-red-950/60 px-2 py-0.5 rounded-full">{failing} fallo{failing > 1 ? 's' : ''}</span>
            : <span className="text-[11px] font-semibold text-green-400 bg-green-950/60 px-2 py-0.5 rounded-full">{store.summary.ok}/{store.summary.total} OK</span>
          }
          <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Checks expandidos */}
      {expanded && (
        <div className="divide-y divide-slate-800/40">
          {(['page', 'seo', 'api'] as const).map(cat => {
            const checks = byCategory.get(cat) ?? []
            if (!checks.length) return null
            const catFailing = checks.filter(c => !c.ok).length
            return (
              <div key={cat}>
                <div className="flex items-center justify-between px-5 py-2 bg-slate-900/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {CATEGORY_LABELS[cat]}
                  </span>
                  {catFailing > 0
                    ? <span className="text-[10px] text-red-400">{catFailing} fallo{catFailing > 1 ? 's' : ''}</span>
                    : <span className="text-[10px] text-green-500">OK</span>
                  }
                </div>
                <div className="divide-y divide-slate-800/30">
                  {checks.map(c => <CheckRow key={c.name} check={c} />)}
                </div>
              </div>
            )
          })}
          <div className="px-5 py-2.5 flex items-center gap-2">
            <a
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-white transition-colors"
            >
              {store.url} ↗
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CheckRow ─────────────────────────────────────────────────────────────────

function CheckRow({ check }: { check: CheckResult }) {
  const isWarn = !check.ok && check.warning
  const isErr  = !check.ok && !check.warning
  return (
    <div className={`flex items-center gap-3 px-5 py-2.5 ${isErr ? 'bg-red-950/20' : isWarn ? 'bg-yellow-950/10' : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${check.ok ? 'bg-green-500' : isWarn ? 'bg-yellow-400' : 'bg-red-400'}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${check.ok ? 'text-slate-300' : isWarn ? 'text-yellow-300' : 'text-red-300'}`}>
          {check.label}
        </p>
        {!check.ok && check.message && (
          <p className={`text-[11px] mt-0.5 truncate ${isWarn ? 'text-yellow-600' : 'text-red-500'}`}>
            {check.message}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {check.httpStatus && (
          <span className={`text-[11px] font-mono ${check.ok ? 'text-slate-600' : isWarn ? 'text-yellow-600' : 'text-red-400'}`}>
            {check.httpStatus}
          </span>
        )}
        <span className={`text-[11px] tabular-nums ${check.ms > 3000 ? 'text-orange-400' : 'text-slate-600'}`}>
          {check.ms}ms
        </span>
        <span className={`text-[11px] font-semibold w-10 text-right ${check.ok ? 'text-green-500' : isWarn ? 'text-yellow-400' : 'text-red-400'}`}>
          {check.ok ? 'OK' : isWarn ? 'WARN' : 'FAIL'}
        </span>
      </div>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={spinning ? 'animate-spin' : ''}>
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  )
}

function CronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
