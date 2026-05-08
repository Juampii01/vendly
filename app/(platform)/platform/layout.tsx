import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Platform — Vendly' }

export const dynamic = 'force-dynamic'

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const userEmail = h.get('x-user-email') ?? ''

  if (!userEmail) redirect('/admin/login?next=/platform')

  const service = createServiceClient()

  const { data: platformUser } = await service
    .from('platform_users')
    .select('id, role')
    .ilike('email', userEmail)
    .maybeSingle()

  // SIN bootstrap bypass: aunque la tabla esté vacía, NO permitimos acceso
  // automático. La inicialización del primer platform_user se hace por SQL/CLI.
  // El bypass anterior dejaba /platform abierto a cualquier usuario logueado
  // hasta que alguien insertara la primera fila, lo cual era un agujero crítico.
  if (!platformUser) {
    redirect('/admin?error=sin_acceso_plataforma')
  }

  const initials = userEmail.slice(0, 2).toUpperCase()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#080d14' }}>
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="w-60 shrink-0 flex flex-col border-r"
        style={{ backgroundColor: '#0d1520', borderColor: '#1a2535' }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              V
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-400">Vendly</p>
              <p className="text-[10px] text-slate-500 leading-tight">Platform Console</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 pb-4">
          <p className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            General
          </p>
          <NavItem href="/platform" icon={<DashboardIcon />}>Dashboard</NavItem>
          <NavItem href="/platform/stores" icon={<StoresIcon />}>Stores</NavItem>

          <p className="px-3 pt-4 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Monitoreo
          </p>
          <NavItem href="/platform/analytics" icon={<AnalyticsIcon />}>Analytics</NavItem>
          <NavItem href="/platform/monitor" icon={<MonitorIcon />}>Monitor</NavItem>

          <p className="px-3 pt-4 pb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Acciones
          </p>
          <NavItem href="/platform/stores/new" icon={<PlusIcon />}>Crear store</NavItem>
        </nav>

        {/* User footer */}
        <div
          className="px-4 py-4 border-t"
          style={{ borderColor: '#1a2535' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-300 truncate">{userEmail}</p>
              <p className="text-[10px] text-slate-600">Platform Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}

// ─── NavItem ─────────────────────────────────────────────────────────────────

function NavItem({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group"
      style={{ color: '#64748b' }}
    >
      <span className="shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors">
        {icon}
      </span>
      <span className="group-hover:text-slate-200 transition-colors">{children}</span>
    </Link>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function StoresIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function AnalyticsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}
