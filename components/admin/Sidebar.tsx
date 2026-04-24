'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSiteFeatures } from '@/lib/site-features'
import type { StoreConfig } from '@/types'

interface AdminSidebarProps {
  store: StoreConfig
  userEmail: string
}

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number }>
  exact: boolean
  requires?: 'hasProductCatalog' | 'hasCheckout' | 'hasCart'
  labelBySiteType?: Partial<Record<StoreConfig['site_type'], string>>
}

// ─── Nav groups ───────────────────────────────────────────────────────────────

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'General',
    items: [
      { href: '/admin', label: 'Dashboard', icon: GridIcon, exact: true },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/admin/productos',  label: 'Productos',  icon: BoxIcon,    exact: false, requires: 'hasProductCatalog',
        labelBySiteType: { 'real-estate': 'Inmuebles' } },
      { href: '/admin/categorias', label: 'Categorías', icon: FolderIcon, exact: false, requires: 'hasProductCatalog' },
    ],
  },
  {
    label: 'Comercio',
    items: [
      { href: '/admin/ordenes',  label: 'Órdenes',  icon: ShoppingBagIcon, exact: false, requires: 'hasCheckout' },
      { href: '/admin/clientes', label: 'Clientes', icon: UsersIcon,       exact: false, requires: 'hasCheckout' },
      {
        href: '/admin/carritos',
        label: 'Carritos',
        icon: CartIcon,
        exact: false,
        requires: 'hasCart',
        labelBySiteType: { dealership: 'Consultas', 'real-estate': 'Consultas' },
      },
      { href: '/admin/cupones', label: 'Cupones', icon: TagIcon, exact: false, requires: 'hasCheckout' },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { href: '/admin/generar', label: 'Asistente IA', icon: SparklesIcon, exact: false },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/admin/usuarios',      label: 'Usuarios',      icon: KeyIcon,      exact: false },
      { href: '/admin/configuracion', label: 'Configuración', icon: SettingsIcon, exact: false },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminSidebar({ store, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const features = getSiteFeatures(store.site_type)

  // Initials for user avatar
  const initials = userEmail
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase()

  const SidebarContent = () => (
    <div className="flex h-full flex-col">

      {/* ── Logo / Brand ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        {store.logo_url ? (
          <Image
            src={store.logo_url}
            alt={store.name}
            width={100}
            height={32}
            className="h-7 w-auto object-contain brightness-0 invert opacity-90"
          />
        ) : (
          <span className="text-sm font-bold text-white truncate leading-tight">
            {store.name}
          </span>
        )}
        <span className="ml-auto shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white/50">
          Admin
        </span>
      </div>

      {/* ── Navigation ────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(({ label, items }) => {
          const visibleItems = items.filter(({ requires }) =>
            !requires || features[requires]
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={label}>
              <p className="mb-1.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
                {label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map(({ href, label: itemLabel, icon: Icon, exact, labelBySiteType }) => {
                  const active = exact ? pathname === href : pathname.startsWith(href)
                  const displayLabel = labelBySiteType?.[store.site_type] ?? itemLabel
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      {/* Active indicator */}
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r"
                          style={{ backgroundColor: store.color_accent }}
                        />
                      )}
                      <Icon size={16} />
                      <span className="font-medium">{displayLabel}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* ── Ver tienda ────────────────────────────────────────────────── */}
      <div className="px-3 pb-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs text-white/35 transition-colors hover:bg-white/5 hover:text-white/70"
        >
          <ExternalLinkIcon />
          <span>Ver sitio</span>
          <span className="ml-auto opacity-50">↗</span>
        </Link>
      </div>

      {/* ── User footer ───────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar initials */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
            style={{ backgroundColor: store.color_accent }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-white/60">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Cerrar sesión"
            className="shrink-0 text-white/30 transition-colors hover:text-red-400 disabled:opacity-40"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col h-full" style={{ backgroundColor: '#0f172a' }}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between px-4 md:hidden border-b border-white/10" style={{ backgroundColor: '#0f172a' }}>
        <span className="text-sm font-bold text-white truncate">{store.name}</span>
        <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white transition-colors">
          <MenuIcon />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64" style={{ backgroundColor: '#0f172a' }}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Mobile spacer */}
      <div className="h-14 md:hidden" />
    </>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GridIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
}
function BoxIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
}
function ShoppingBagIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
}
function UsersIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function ExternalLinkIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
}
function MenuIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
}
function CloseIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function KeyIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
}
function SettingsIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
}
function SparklesIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.88 5.76L20 10l-6.12 1.24L12 17l-1.88-5.76L4 10l6.12-1.24z"/><path d="M19 3l.8 2.4L22 6l-2.2.6L19 9l-.8-2.4L16 6l2.2-.6z"/><path d="M5 17l.6 1.8L7 19l-1.4.2L5 21l-.6-1.8L3 19l1.4-.2z"/></svg>
}
function CartIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
}
function FolderIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
}
function TagIcon({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
