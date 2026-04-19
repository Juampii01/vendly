'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from './CartSidebar'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: true, hasWhatsappCTA: false, hasProductCatalog: true,
}

interface HeaderProps {
  store: StoreConfig
  categories: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
}

export function Header({ store, categories, userLoggedIn = false, features = DEFAULT_FEATURES }: HeaderProps) {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  const bg = store.color_primary
  const fg = store.color_background

  return (
    <>
      <header className="sticky top-0 z-40" style={{ backgroundColor: bg }}>
        {/* Barra principal */}
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={120} height={40}
                className="h-8 w-auto object-contain" priority />
            ) : (
              <span className="text-base font-black uppercase tracking-[0.15em]" style={{ color: fg }}>
                {store.name}
              </span>
            )}
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/productos"
              className="text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-60"
              style={{ color: fg }}>
              Todo
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-xs font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-60"
                style={{ color: fg }}>
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {/* Mi cuenta */}
            <Link href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
              className="hidden md:flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
              aria-label="Mi cuenta">
              <UserIcon color={fg} loggedIn={userLoggedIn} />
            </Link>

            {/* Carrito — solo si el site_type lo habilita */}
            {features.hasCart && (
              <button onClick={() => setCartOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-60"
                aria-label="Abrir carrito">
                <BagIcon color={fg} />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black"
                    style={{ backgroundColor: store.color_accent, color: '#fff' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger mobile */}
            <button className="flex h-10 w-10 items-center justify-center md:hidden"
              onClick={() => setMenuOpen((v) => !v)} aria-label="Menú">
              <HamburgerIcon open={menuOpen} color={fg} />
            </button>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px opacity-10" style={{ backgroundColor: fg }} />

        {/* Menu mobile — drawer */}
        {menuOpen && (
          <div style={{ backgroundColor: bg }} className="md:hidden">
            <nav className="flex flex-col px-6 py-4">
              <Link href="/productos"
                className="border-b py-4 text-sm font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
                style={{ color: fg, borderColor: `${fg}15` }}
                onClick={() => setMenuOpen(false)}>
                Ver todo
              </Link>
              {categories.map((cat) => (
                <Link key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="border-b py-4 text-sm font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
                  style={{ color: fg, borderColor: `${fg}15` }}
                  onClick={() => setMenuOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <Link href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
                className="py-4 text-sm font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-60"
                style={{ color: fg }}
                onClick={() => setMenuOpen(false)}>
                {userLoggedIn ? 'Mi cuenta' : 'Ingresar'}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {features.hasCart && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
      )}
    </>
  )
}

function UserIcon({ color, loggedIn }: { color: string; loggedIn: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={loggedIn ? color : 'none'}
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BagIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function HamburgerIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
      ) : (
        <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
      )}
    </svg>
  )
}
