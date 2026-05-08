'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

export function AthleticHeader({ store, categories, userLoggedIn = false, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const [logoError, setLogoError] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Promo copy
  const promoCopy = store.home_marquee_items?.[0]
    ?? (store.free_shipping_threshold
        ? `Envío gratis desde ${formatPrice(store.free_shipping_threshold, store.currency, store.locale)}`
        : 'Envío a todo el país')

  return (
    <>
      {/* ── Promo bar ────────────────────────────────────────────────────── */}
      <div className="w-full py-2 text-center text-[9px] font-bold uppercase tracking-[0.35em]"
        style={{ backgroundColor: store.color_primary, color: store.color_background }}>
        {promoCopy}
      </div>

      {/* ── Main header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full transition-all duration-300"
        style={{
          backgroundColor: store.color_background,
          borderBottom: scrolled ? `1px solid ${store.color_text}18` : '1px solid transparent',
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.04)' : 'none',
        }}>

        {/* Desktop ──────────────────────────────────────────────────────── */}
        <div className="hidden md:grid grid-cols-3 items-center h-[60px] px-10 max-w-[1440px] mx-auto">

          {/* Logo — left */}
          <Link href="/" className="flex items-center">
            {store.logo_url && !logoError
              ? <Image src={store.logo_url} alt={store.name} width={120} height={36}
                  className="h-9 w-auto object-contain"
                  onError={() => setLogoError(true)} />
              : <span className="text-base font-black uppercase tracking-[0.06em]"
                  style={{ color: store.color_text, letterSpacing: '0.06em' }}>
                  {store.name}
                </span>
            }
          </Link>

          {/* Nav — center */}
          <nav className="flex items-center justify-center gap-8">
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-40"
                style={{ color: store.color_text }}>
                {cat.name}
              </Link>
            ))}
            <Link href="/productos?tag=sale"
              className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
              style={{ color: store.color_accent }}>
              Sale
            </Link>
          </nav>

          {/* Actions — right */}
          <div className="flex items-center justify-end gap-6">
            <button onClick={() => setSearchOpen(!searchOpen)}
              className="transition-opacity hover:opacity-40"
              style={{ color: store.color_text }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            {features.hasUserAccount && (
              <Link href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
                className="text-[10px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-40"
                style={{ color: store.color_text }}>
                {userLoggedIn ? 'Mi cuenta' : 'Ingresar'}
              </Link>
            )}

            {features.hasCart && (
              <button onClick={() => setCartOpen(true)}
                className="relative transition-opacity hover:opacity-40"
                style={{ color: store.color_text }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full text-[8px] font-black flex items-center justify-center"
                    style={{ backgroundColor: store.color_primary, color: store.color_background }}>
                    {itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile ───────────────────────────────────────────────────────── */}
        <div className="flex md:hidden items-center justify-between h-[56px] px-5">
          <button onClick={() => setMobileOpen(true)} style={{ color: store.color_text }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="4" y1="8" x2="20" y2="8"/>
              <line x1="4" y1="16" x2="14" y2="16"/>
            </svg>
          </button>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            {store.logo_url && !logoError
              ? <Image src={store.logo_url} alt={store.name} width={100} height={32}
                  className="h-8 w-auto object-contain"
                  onError={() => setLogoError(true)} />
              : <span className="text-sm font-black uppercase tracking-[0.1em]"
                  style={{ color: store.color_text }}>
                  {store.name}
                </span>
            }
          </Link>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} style={{ color: store.color_text }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            {features.hasCart && (
              <button onClick={() => setCartOpen(true)} className="relative" style={{ color: store.color_text }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-[16px] h-[16px] rounded-full text-[7px] font-black flex items-center justify-center"
                    style={{ backgroundColor: store.color_primary, color: store.color_background }}>
                    {itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Search overlay ────────────────────────────────────────────────── */}
        {searchOpen && (
          <div className="border-t px-6 md:px-10 py-4"
            style={{ borderColor: `${store.color_text}10`, backgroundColor: store.color_background }}>
            <form action="/productos" className="flex items-center gap-4 max-w-2xl mx-auto">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
                className="shrink-0 opacity-30" style={{ color: store.color_text }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input ref={searchRef} name="busqueda" placeholder="Buscar en colección..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: store.color_text }} />
              <button type="button" onClick={() => setSearchOpen(false)}
                className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: store.color_text }}>
                Cerrar
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── Mobile fullscreen menu ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: store.color_primary }}>
          <div className="flex items-center justify-between px-5 h-[56px]">
            <span className="text-sm font-black uppercase tracking-[0.1em]"
              style={{ color: store.color_background }}>
              {store.name}
            </span>
            <button onClick={() => setMobileOpen(false)} style={{ color: store.color_background }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <nav className="flex-1 flex flex-col justify-center px-8">
            <Link href="/productos" onClick={() => setMobileOpen(false)}
              className="py-5 border-b text-4xl font-black uppercase leading-none"
              style={{ color: store.color_background, borderColor: `${store.color_background}12` }}>
              Todo
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-5 border-b text-4xl font-black uppercase leading-none"
                style={{ color: store.color_background, borderColor: `${store.color_background}12` }}>
                {cat.name}
              </Link>
            ))}
            <Link href="/productos?tag=sale" onClick={() => setMobileOpen(false)}
              className="py-5 text-4xl font-black uppercase leading-none"
              style={{ color: store.color_accent }}>
              Sale
            </Link>
          </nav>

          <div className="px-8 pb-12 flex items-center gap-6">
            {features.hasUserAccount && (
              <Link href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
                onClick={() => setMobileOpen(false)}
                className="text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: `${store.color_background}60` }}>
                {userLoggedIn ? 'Mi cuenta' : 'Ingresar'}
              </Link>
            )}
          </div>
        </div>
      )}

      {features.hasCart && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
      )}
    </>
  )
}
