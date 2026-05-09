'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

interface Props {
  store: StoreConfig
  categories: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
}

const NAV = [
  { label: 'Hombre',  href: '/productos?categoria=hombre' },
  { label: 'Mujer',   href: '/productos?categoria=mujer' },
  { label: 'Niños',   href: '/productos?categoria=ninos' },
  { label: 'Deporte', href: '/productos' },
  { label: 'Sale',    href: '/productos?tag=sale', accent: true },
]

function ThreeStripes({ color = '#fff' }: { color?: string }) {
  return (
    <div className="inline-flex items-end gap-[2.5px]">
      {['h-3', 'h-4.5', 'h-6'].map((h, i) => (
        <span key={i} className={`block w-[2.5px]`} style={{ backgroundColor: color, height: h.replace('h-', '') === '4.5' ? '18px' : (h === 'h-3' ? '12px' : '24px') }} />
      ))}
    </div>
  )
}

export function AdidasHeader({ store, categories: _categories, userLoggedIn }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const itemCount = useCartStore(s => s.items.reduce((acc, i) => acc + i.quantity, 0))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      {/* ── Top bar (announcement) ──────────────────────────────────────── */}
      <div className="w-full text-center py-2 text-[10px] font-black uppercase tracking-[0.35em]"
        style={{ backgroundColor: '#000', color: '#fff' }}>
        Envío gratis en compras desde $50.000 · Cambios sin costo
      </div>

      {/* ── Main nav ────────────────────────────────────────────────────── */}
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? 'shadow-sm' : ''}`}
        style={{ backgroundColor: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <ThreeStripes color="#000" />
            <span className="font-black uppercase tracking-[-0.02em] text-lg">{store.name || 'Adidas'}</span>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-7 flex-1 justify-center text-[11px] font-black uppercase tracking-[0.18em]">
            {NAV.map(item => (
              <Link key={item.label} href={item.href}
                className="transition-colors hover:opacity-60"
                style={{ color: item.accent ? '#FF3A20' : '#000' }}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setSearchOpen(s => !s)}
              className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors" aria-label="Buscar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <Link href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
              className="w-10 h-10 hidden md:flex items-center justify-center hover:bg-black/5 transition-colors" aria-label="Cuenta">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <button onClick={() => setCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors" aria-label="Carrito">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ backgroundColor: '#FF3A20', color: '#fff' }}>
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search bar (expandable) */}
        {searchOpen && (
          <div className="border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-4">
              <input type="search" autoFocus placeholder="Buscar productos..."
                className="w-full bg-transparent border-b-2 border-black/20 focus:border-black outline-none py-2 text-base font-medium" />
            </div>
          </div>
        )}
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
    </>
  )
}
