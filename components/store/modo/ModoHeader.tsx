'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import { formatPrice } from '@/lib/format'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: true, hasWhatsappCTA: false, hasProductCatalog: true, hasUserAccount: true,
}

interface Props {
  store: StoreConfig
  categories: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
}

export function ModoHeader({ store, categories, userLoggedIn = false, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen]     = useState(false)
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal]   = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const itemCount = useCartStore((s) => s.getItemCount())
  const router    = useRouter()
  const pathname  = usePathname()

  // Promo bar text
  const promoItems: string[] = store.home_marquee_items?.length
    ? store.home_marquee_items
    : [
        store.free_shipping_threshold
          ? `Envío gratis desde ${formatPrice(store.free_shipping_threshold, store.currency, store.locale)}`
          : 'Envío gratis en compras seleccionadas',
        'Cambios gratis por 30 días',
        'Pagá en cuotas sin interés',
      ]

  // Build the ticker string (repeat 4× so it scrolls seamlessly)
  const tickerText = [...promoItems, ...promoItems, ...promoItems, ...promoItems]
    .map(t => `${t}  ·  `)
    .join('')

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => searchRef.current?.focus(), 60)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchVal('')
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchVal.trim()) return
    router.push(`/productos?busqueda=${encodeURIComponent(searchVal.trim())}`)
    closeSearch()
  }

  // Close search on route change
  useEffect(() => { closeSearch() }, [pathname])

  return (
    <>
      {/* ══ Promo bar — ticker ══ */}
      <div
        className="w-full overflow-hidden py-2"
        style={{ backgroundColor: store.color_accent }}
      >
        <style>{`
          @keyframes modo-ticker {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .modo-ticker { display:inline-block; white-space:nowrap; animation: modo-ticker 28s linear infinite; }
          .modo-ticker:hover { animation-play-state: paused; }
        `}</style>
        <div className="modo-ticker text-[10px] font-bold uppercase tracking-[0.25em] text-white select-none">
          {tickerText}
        </div>
      </div>

      {/* ══ Main header ══ */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: '#fff', borderColor: 'rgba(10,10,10,0.08)' }}
      >
        {/* ── Desktop ── */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-[60px] px-8 max-w-7xl mx-auto">

          {/* Nav izquierda */}
          <nav className="flex items-center gap-7">
            <NavLink href="/productos" label="Todo" accent={store.color_accent} textColor={store.color_text} />
            {categories.slice(0, 4).map(cat => (
              <NavLink
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                label={cat.name}
                accent={store.color_accent}
                textColor={store.color_text}
              />
            ))}
          </nav>

          {/* Logo centrado */}
          <Link href="/" className="px-6 flex-shrink-0 flex justify-center">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            ) : (
              <span
                className="text-[1.1rem] font-black uppercase tracking-[0.28em]"
                style={{ color: store.color_text }}
              >
                {store.name}
              </span>
            )}
          </Link>

          {/* Acciones derecha */}
          <div className="flex items-center justify-end gap-5">
            {/* Search icon / input */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                  <input
                    ref={searchRef}
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Buscar..."
                    className="w-44 border-b border-black/30 bg-transparent py-0.5 text-[11px] outline-none placeholder:text-black/25 focus:border-black"
                    style={{ color: store.color_text }}
                  />
                  <button
                    type="button"
                    onClick={closeSearch}
                    className="text-black/30 hover:text-black transition-colors"
                    aria-label="Cerrar búsqueda"
                  >
                    <CloseIcon size={14} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={openSearch}
                  className="transition-opacity hover:opacity-50"
                  aria-label="Buscar"
                >
                  <SearchIcon color={store.color_text} />
                </button>
              )}
            </div>

            {features.hasUserAccount && (
              <Link
                href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
                className="transition-opacity hover:opacity-50"
                aria-label={userLoggedIn ? 'Mi cuenta' : 'Ingresar'}
              >
                <UserIcon color={store.color_text} />
              </Link>
            )}

            {features.hasCart && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center transition-opacity hover:opacity-50"
                aria-label="Carrito"
              >
                <BagIcon color={store.color_text} />
                {itemCount > 0 && (
                  <span
                    className="absolute -right-2 -top-2 flex h-[18px] w-[18px] items-center justify-center rounded-full text-[9px] font-black text-white leading-none"
                    style={{ backgroundColor: store.color_accent }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile ── */}
        <div className="flex md:hidden items-center justify-between h-14 px-5">
          <button onClick={() => setMenuOpen(v => !v)} aria-label="Menú">
            <HamburgerIcon open={menuOpen} color={store.color_text} />
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={110} height={32} className="h-7 w-auto object-contain" priority />
            ) : (
              <span className="text-[0.95rem] font-black uppercase tracking-[0.22em]" style={{ color: store.color_text }}>
                {store.name}
              </span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <button onClick={openSearch} aria-label="Buscar">
              <SearchIcon color={store.color_text} />
            </button>
            {features.hasCart && (
              <button onClick={() => setCartOpen(true)} className="relative" aria-label="Carrito">
                <BagIcon color={store.color_text} />
                {itemCount > 0 && (
                  <span
                    className="absolute -right-1.5 -top-1.5 flex h-[16px] w-[16px] items-center justify-center rounded-full text-[8px] font-black text-white"
                    style={{ backgroundColor: store.color_accent }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden border-t px-5 py-3" style={{ borderColor: 'rgba(10,10,10,0.08)', backgroundColor: '#fff' }}>
            <form onSubmit={submitSearch} className="flex items-center gap-3">
              <SearchIcon color="rgba(10,10,10,0.3)" />
              <input
                ref={searchRef}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/25"
                style={{ color: store.color_text }}
              />
              <button type="button" onClick={closeSearch} className="text-black/30">
                <CloseIcon size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Mobile drawer */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-5 py-5 space-y-0"
            style={{ borderColor: 'rgba(10,10,10,0.08)', backgroundColor: '#fff' }}
          >
            {[{ href: '/productos', label: 'Ver todo' }, ...categories.map(c => ({ href: `/productos?categoria=${c.slug}`, label: c.name }))].map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block py-3.5 text-[11px] font-black uppercase tracking-[0.2em] border-b"
                style={{ color: store.color_text, borderColor: 'rgba(10,10,10,0.06)' }}
              >
                {item.label}
              </Link>
            ))}
            {features.hasUserAccount && (
              <Link
                href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
                onClick={() => setMenuOpen(false)}
                className="block pt-5 text-[11px] font-bold uppercase tracking-[0.2em] opacity-50"
                style={{ color: store.color_text }}
              >
                {userLoggedIn ? 'Mi cuenta' : 'Ingresar'}
              </Link>
            )}
          </div>
        )}
      </header>

      {features.hasCart && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
      )}
    </>
  )
}

// ─── Nav link with accent underline on hover ─────────────────────────────────
function NavLink({ href, label, accent, textColor }: { href: string; label: string; accent: string; textColor: string }) {
  return (
    <Link
      href={href}
      className="group relative text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-60 pb-0.5"
      style={{ color: textColor }}
    >
      {label}
      <span
        className="absolute bottom-0 left-0 h-px w-0 group-hover:w-full transition-all duration-200"
        style={{ backgroundColor: accent }}
      />
    </Link>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function UserIcon({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BagIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function HamburgerIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
        : <><line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" /></>
      }
    </svg>
  )
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
