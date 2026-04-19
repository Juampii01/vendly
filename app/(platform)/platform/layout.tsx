import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Platform — Vendly' }

/**
 * Platform Admin — panel central para operadores de la plataforma.
 *
 * Separado del store admin (/admin) que es por-store.
 * Solo accesible para usuarios en platform_users.
 *
 * Bootstrap: si la tabla está vacía, cualquier usuario autenticado puede entrar
 * (igual que el patrón de store admin_users).
 *
 * Performance: user viene de headers inyectados por middleware —
 * no se hace un segundo roundtrip a Supabase Auth.
 * Patrón de verificación: email primero, COUNT solo como fallback de bootstrap.
 */
export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const userEmail = h.get('x-user-email') ?? ''

  if (!userEmail) redirect('/admin/login?next=/platform')

  const service = createServiceClient()

  // Email lookup primero — 1 query en lugar de COUNT + lookup secuenciales.
  // Si no se encuentra el email, hacemos COUNT para detectar modo bootstrap.
  const { data: platformUser } = await service
    .from('platform_users')
    .select('id, role')
    .eq('email', userEmail)
    .maybeSingle()

  if (!platformUser) {
    const { count } = await service
      .from('platform_users')
      .select('*', { count: 'exact', head: true })

    // count === 0 → modo bootstrap: primer usuario autenticado pasa
    if (count && count > 0) redirect('/admin?error=sin_acceso_plataforma')
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-800 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-800">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Vendly</p>
          <p className="text-sm font-semibold text-white mt-0.5">Platform</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLink href="/platform">Dashboard</NavLink>
          <NavLink href="/platform/stores">Stores</NavLink>
          <NavLink href="/platform/analytics">Analytics</NavLink>
          <NavLink href="/platform/monitor">Monitor</NavLink>
          <NavLink href="/platform/stores/new">+ Crear store</NavLink>
        </nav>
        <div className="px-4 py-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 truncate">{userEmail}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
    >
      {children}
    </Link>
  )
}
