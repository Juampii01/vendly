import { listAllStores } from '@/lib/store-generator'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Platform' }

export default async function PlatformDashboardPage() {
  const [stores, supabase] = [await listAllStores(), createServiceClient()]

  const activeStores = stores.filter((s) => s.status === 'active')

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

  const recentStores = [...stores]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  return (
    <div className="min-h-full" style={{ backgroundColor: '#080d14' }}>
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        className="px-8 pt-8 pb-6 border-b"
        style={{ borderColor: '#1a2535' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1">
              Platform Console
            </p>
            <h1 className="text-2xl font-black text-white">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Vista global de la infraestructura Vendly
            </p>
          </div>
          <Link
            href="/platform/stores/new"
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <span>+</span>
            <span>Nuevo store</span>
          </Link>
        </div>
      </div>

      <div className="px-8 py-8 space-y-8">
        {/* ── Metrics ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <PlatformMetric
            label="Stores totales"
            value={stores.length}
            icon={<StoresIcon />}
            accent="#6366f1"
          />
          <PlatformMetric
            label="Stores activos"
            value={activeStores.length}
            icon={<ActiveIcon />}
            accent="#10b981"
            highlight
          />
          <PlatformMetric
            label="Órdenes totales"
            value={totalOrders ?? 0}
            icon={<OrdersIcon />}
            accent="#f59e0b"
          />
          <PlatformMetric
            label="Productos activos"
            value={totalProducts ?? 0}
            icon={<ProductsIcon />}
            accent="#3b82f6"
          />
        </div>

        {/* ── Two-col layout ────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Stores recientes */}
          <div
            className="lg:col-span-2 rounded-2xl border overflow-hidden"
            style={{ backgroundColor: '#0d1520', borderColor: '#1a2535' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: '#1a2535' }}
            >
              <p className="text-sm font-bold text-white">Stores recientes</p>
              <Link
                href="/platform/stores"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="divide-y" style={{ borderColor: '#1a2535' }}>
              {recentStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Color swatch */}
                    <div
                      className="h-8 w-8 shrink-0 rounded-lg"
                      style={{ backgroundColor: store.color_accent ?? '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{store.name}</p>
                      <p className="text-[11px] font-mono text-slate-600">{store.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <PlanBadge plan={store.plan} />
                    <StatusDot status={store.status} />
                    <Link
                      href={`/platform/stores/${store.id}`}
                      className="text-xs text-slate-600 hover:text-white transition-colors"
                    >
                      →
                    </Link>
                  </div>
                </div>
              ))}
              {recentStores.length === 0 && (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-slate-600">No hay stores aún.</p>
                  <Link
                    href="/platform/stores/new"
                    className="mt-2 inline-block text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Crear el primero →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right col */}
          <div className="space-y-4">
            {/* Distribución por plan */}
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: '#0d1520', borderColor: '#1a2535' }}
            >
              <p className="text-sm font-bold text-white mb-4">Distribución por plan</p>
              <div className="space-y-3">
                {(['free', 'starter', 'pro', 'enterprise'] as const).map((plan) => {
                  const count = planCounts[plan] ?? 0
                  const max = Math.max(...Object.values(planCounts), 1)
                  const pct = Math.round((count / max) * 100)
                  return (
                    <div key={plan}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {plan}
                        </span>
                        <span className="text-xs font-bold text-white">{count}</span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: '#1a2535' }}
                      >
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: PLAN_GRADIENT[plan],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick links */}
            <div
              className="rounded-2xl border p-5"
              style={{ backgroundColor: '#0d1520', borderColor: '#1a2535' }}
            >
              <p className="text-sm font-bold text-white mb-3">Accesos rápidos</p>
              <div className="space-y-1">
                {[
                  { href: '/platform/stores/new', label: 'Crear store', icon: '＋' },
                  { href: '/platform/analytics', label: 'Analytics global', icon: '↗' },
                  { href: '/platform/monitor', label: 'Estado del monitor', icon: '◎' },
                ].map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/[0.04] group"
                    style={{ color: '#64748b' }}
                  >
                    <span className="text-indigo-500 font-bold">{icon}</span>
                    <span className="group-hover:text-slate-300 transition-colors">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_GRADIENT: Record<string, string> = {
  free:       '#334155',
  starter:    'linear-gradient(90deg, #3b82f6, #6366f1)',
  pro:        'linear-gradient(90deg, #8b5cf6, #a78bfa)',
  enterprise: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlatformMetric({
  label,
  value,
  icon,
  accent,
  highlight,
}: {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
  highlight?: boolean
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-5"
      style={{ backgroundColor: '#0d1520', borderColor: '#1a2535' }}
    >
      {/* Top stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: accent }}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-2">
            {label}
          </p>
          <p
            className="text-3xl font-black leading-none"
            style={{ color: highlight ? accent : '#f1f5f9' }}
          >
            {value.toLocaleString('es-AR')}
          </p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent + '18', color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

function PlanBadge({ plan }: { plan: string }) {
  const styles: Record<string, { bg: string; text: string }> = {
    free:       { bg: '#1e293b', text: '#64748b' },
    starter:    { bg: '#1e3a5f', text: '#60a5fa' },
    pro:        { bg: '#2e1a4a', text: '#a78bfa' },
    enterprise: { bg: '#422006', text: '#fbbf24' },
  }
  const s = styles[plan] ?? styles.free
  return (
    <span
      className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {plan}
    </span>
  )
}

function StatusDot({ status }: { status: string }) {
  const cfg: Record<string, { dot: string; label: string }> = {
    active:    { dot: '#10b981', label: 'Activo'     },
    inactive:  { dot: '#475569', label: 'Inactivo'   },
    suspended: { dot: '#ef4444', label: 'Suspendido' },
  }
  const { dot } = cfg[status] ?? cfg.inactive
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
    </span>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function StoresIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function ActiveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function ProductsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
