'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const REFRESH_INTERVAL = 60 // segundos

interface CheckResult {
  name: string
  label: string
  category: 'page' | 'api' | 'seo' | 'integration'
  ok: boolean
  ms: number
  httpStatus?: number
  message?: string
}

interface HealthData {
  timestamp: string
  baseUrl: string
  checks: CheckResult[]
  summary: { total: number; ok: number; failing: number }
}

interface Incident {
  check_name: string
  label: string
  category: string
  status: 'ok' | 'fail' | 'unknown'
  message: string | null
  response_ms: number | null
  http_status: number | null
  fail_count: number
  last_checked_at: string
  last_ok_at: string | null
  last_fail_at: string | null
  last_alerted_at: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  page:        'Páginas',
  api:         'APIs',
  seo:         'SEO & PWA',
  integration: 'Integraciones',
}

export default function DevDashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [incidentsOk, setIncidentsOk] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch('/api/dev/incidents', { cache: 'no-store' })
      const data = await res.json()
      if (data.ok) setIncidents(data.incidents)
      setIncidentsOk(data.ok)
    } catch {
      setIncidentsOk(false)
    }
  }, [])

  const runChecks = useCallback(async () => {
    setLoading(true)
    try {
      const [healthRes] = await Promise.all([
        fetch('/api/dev/health', { cache: 'no-store' }),
        fetchIncidents(),
      ])
      const data = await healthRes.json()
      setHealth(data)
      setLastRefresh(new Date())
      setCountdown(REFRESH_INTERVAL)
    } finally {
      setLoading(false)
    }
  }, [fetchIncidents])

  const triggerCron = useCallback(async () => {
    setRunning(true)
    try {
      await fetch('/api/cron/monitor', { cache: 'no-store' })
      await Promise.all([runChecks()])
    } finally {
      setRunning(false)
    }
  }, [runChecks])

  // Auto-refresh
  useEffect(() => {
    runChecks()
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { runChecks(); return REFRESH_INTERVAL }
        return c - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [runChecks])

  // Build incident map from Supabase state
  const incidentMap = new Map<string, Incident>()
  for (const inc of incidents) incidentMap.set(inc.check_name, inc)

  // Group checks by category
  const byCategory = new Map<string, CheckResult[]>()
  for (const check of health?.checks ?? []) {
    const arr = byCategory.get(check.category) ?? []
    arr.push(check)
    byCategory.set(check.category, arr)
  }

  const allOk = health ? health.summary.failing === 0 : null

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 md:p-8">
        {/* ── Header ── */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Monitor del sistema</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Auto-refresh en {countdown}s
              {lastRefresh && ` · Última vez: ${lastRefresh.toLocaleTimeString('es-AR')}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={runChecks}
              disabled={loading}
              title="Verificar estado ahora"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <RefreshIcon spinning={loading} />
              Verificar
            </button>
            <button
              onClick={triggerCron}
              disabled={running}
              title="Correr el cron de monitoreo (registra en Supabase y envía WhatsApp si hay fallos)"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:opacity-80 disabled:opacity-40 transition-opacity"
            >
              <CronIcon />
              {running ? 'Ejecutando…' : 'Correr cron'}
            </button>
          </div>
        </div>

        {/* ── Estado global ── */}
        {health && (
          <div className={`mb-6 rounded-2xl border px-5 py-4 flex items-center justify-between ${
            allOk ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${allOk ? 'text-green-600' : 'text-red-500'}`}>
                {allOk ? '✅' : '🚨'}
              </span>
              <div>
                <p className={`font-semibold text-sm ${allOk ? 'text-green-800' : 'text-red-800'}`}>
                  {allOk ? 'Todo funciona correctamente' : `${health.summary.failing} check${health.summary.failing > 1 ? 's' : ''} fallando`}
                </p>
                <p className="text-xs text-slate-500">{health.baseUrl}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{health.summary.ok}<span className="text-base text-slate-400">/{health.summary.total}</span></p>
              <p className="text-[10px] text-slate-400">checks OK</p>
            </div>
          </div>
        )}

        {!health && !loading && (
          <div className="mb-6 rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
            <p className="text-sm text-slate-400">Cargando…</p>
          </div>
        )}

        {/* ── Checks por categoría ── */}
        {health && (
          <div className="space-y-4">
            {(['page', 'integration', 'seo', 'api'] as const).map(cat => {
              const checks = byCategory.get(cat) ?? []
              if (!checks.length) return null
              const catFailing = checks.filter(c => !c.ok).length
              return (
                <div key={cat} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-800">{CATEGORY_LABELS[cat] ?? cat}</h2>
                    {catFailing > 0
                      ? <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{catFailing} fallo{catFailing > 1 ? 's' : ''}</span>
                      : <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">OK</span>
                    }
                  </div>
                  <div className="divide-y divide-slate-50">
                    {checks.map(check => {
                      const inc = incidentMap.get(check.name)
                      return (
                        <CheckRow key={check.name} check={check} incident={inc ?? null} />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Historial de incidentes de Supabase ── */}
        {incidentsOk && incidents.some(i => i.status === 'fail') && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-red-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-red-700">🔴 Incidentes activos (Supabase)</h2>
              <p className="text-[10px] text-slate-400">Datos del último cron</p>
            </div>
            <div className="divide-y divide-slate-50">
              {incidents.filter(i => i.status === 'fail').map(inc => (
                <div key={inc.check_name} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inc.label}</p>
                      {inc.message && <p className="text-xs text-red-500 mt-0.5">{inc.message}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-semibold text-red-600">{inc.fail_count} intento{inc.fail_count > 1 ? 's' : ''}</p>
                      {inc.last_fail_at && (
                        <p className="text-[10px] text-slate-400">{relativeTime(inc.last_fail_at)}</p>
                      )}
                    </div>
                  </div>
                  {inc.last_alerted_at && (
                    <p className="mt-1 text-[10px] text-slate-400">
                      📱 WhatsApp enviado {relativeTime(inc.last_alerted_at)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Info WhatsApp ── */}
        <div className="mt-4 rounded-xl border border-slate-100 bg-white px-5 py-4 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">📱 Alertas WhatsApp</p>
          <p>El cron corre cada 5 min en producción (Vercel). Cuando algo falla recibís un mensaje en <code className="font-mono bg-slate-100 px-1 rounded">DEV_ALERT_PHONE</code>.</p>
          <p className="text-slate-400">En desarrollo: presioná "Correr cron" para simular una ejecución y verificar el envío.</p>
        </div>
      </div>
    </div>
  )
}

// ─── CheckRow ─────────────────────────────────────────────────────────────────

function CheckRow({ check, incident }: { check: CheckResult; incident: Incident | null }) {
  const prevFail = incident?.status === 'fail' && !check.ok

  return (
    <div className={`flex items-center gap-3 px-5 py-3 ${!check.ok ? 'bg-red-50/40' : ''}`}>
      {/* Dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${check.ok ? 'bg-green-500' : 'bg-red-400'}`} />

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${check.ok ? 'text-slate-700' : 'text-red-700'}`}>
          {check.label}
        </p>
        {!check.ok && check.message && (
          <p className="text-[11px] text-red-400 mt-0.5 truncate">{check.message}</p>
        )}
        {incident?.last_ok_at && !check.ok && (
          <p className="text-[10px] text-slate-400">Último OK: {relativeTime(incident.last_ok_at)}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 shrink-0">
        {check.httpStatus && (
          <span className={`text-[11px] font-mono ${check.ok ? 'text-slate-300' : 'text-red-400'}`}>
            {check.httpStatus}
          </span>
        )}
        <span className={`text-[11px] ${check.ms > 3000 ? 'text-orange-500' : 'text-slate-300'}`}>
          {check.ms}ms
        </span>
        <span className={`text-[11px] font-semibold ${check.ok ? 'text-green-600' : 'text-red-600'}`}>
          {check.ok ? 'OK' : 'FALLO'}
        </span>
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'hace un momento'
  if (mins < 60) return `hace ${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `hace ${hrs}h`
  return `hace ${Math.floor(hrs / 24)}d`
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className={spinning ? 'animate-spin' : ''}
    >
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
