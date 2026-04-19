'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import type { StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
  userLoggedIn?: boolean
}

export function AthleticHeader({ store, categories, userLoggedIn = false }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  return (
    <>
      {/* ── Promo bar ─────────────────────────────────────────────────────── */}
      <div
        className="w-full py-2 text-center text-[10px] font-black uppercase tracking-[0.2em]"
        style={{ backgroundColor: store.color_primary, color: store.color_background }}
      >
        {store.home_marquee_items?.[0]
          ?? `Envío gratis desde $${store.free_shipping_threshold?.toLocaleString('es-AR') ?? '50.000'}`}
        &nbsp;·&nbsp;Nueva colección disponible
      </div>

      {/* ── Main header ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{ backgroundColor: store.color_background, borderColor: `${store.color_text}18` }}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center h-16 px-8 gap-8 max-w-[1400px] mx-auto">
          {/* Logo */}
          <Link href="/" className="shrink-0 mr-6">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={80} height={32} className="object-contain" />
              : (
                <span
                  className="text-xl font-black uppercase tracking-[-0.04em]"
                  style={{ color: store.color_text }}
                >
                  {store.name}
                </span>
              )
            }
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-6 flex-1">
            {categories.slice(0, 6).map(cat => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-[11px] font-black uppercase tracking-[0.1em] transition-opacity hover:opacity-40"
                style={{ color: store.color_text }}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/productos"
              className="text-[11px] font-black uppercase tracking-[0.1em] transition-opacity hover:opacity-70"
              style={{ color: store.color_accent }}
            >
              Sale
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            {/* Search icon */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="transition-opacity hover:opacity-40"
              style={{ color: store.color_text }}
              aria-label="Buscar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>

            {userLoggedIn && (
              <Link
                href="/cuenta"
                className="text-[11px] font-black uppercase tracking-wide transition-opacity hover:opacity-40"
                style={{ color: store.color_text }}
              >
                Mi cuenta
              </Link>
            )}

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1 transition-opacity hover:opacity-40"
              style={{ color: store.color_text }}
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ backgroundColor: store.color_primary, color: store.color_background }}
                >
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between h-14 px-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5"
            style={{ color: store.color_text }}
            aria-label="Menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <Link href="/">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={64} height={28} className="object-contain" />
              : (
                <span className="text-lg font-black uppercase tracking-[-0.04em]" style={{ color: store.color_text }}>
                  {store.name}
                </span>
              )
            }
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative p-1.5"
            style={{ color: store.color_text }}
            aria-label="Carrito"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={{ backgroundColor: store.color_primary, color: store.color_background }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div
            className="border-t px-8 py-4"
            style={{ borderColor: `${store.color_text}18`, backgroundColor: store.color_background }}
          >
            <form action="/productos" className="flex items-center gap-3 max-w-2xl mx-auto">
              <svg className="w-4 h-4 shrink-0 opacity-30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ color: store.color_text }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                name="busqueda"
                autoFocus
                placeholder="Buscar productos..."
                className="flex-1 bg-transparent text-sm outline-none font-medium"
                style={{ color: store.color_text }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="opacity-40 hover:opacity-100 transition-opacity text-xs font-black uppercase tracking-wide"
                style={{ color: store.color_text }}
              >
                ✕
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── Mobile menu fullscreen ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: store.color_primary }}
        >
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <span className="text-lg font-black uppercase tracking-[-0.04em]" style={{ color: store.color_background }}>
                {store.name}
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              style={{ color: store.color_background }}
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-6 pt-6 flex flex-col">
            <Link
              href="/productos"
              onClick={() => setMobileOpen(false)}
              className="py-5 border-b text-3xl font-black uppercase tracking-[-0.02em]"
              style={{ color: store.color_background, borderColor: `${store.color_background}20` }}
            >
              Todo
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="py-5 border-b text-3xl font-black uppercase tracking-[-0.02em]"
                style={{ color: store.color_background, borderColor: `${store.color_background}20` }}
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/productos"
              onClick={() => setMobileOpen(false)}
              className="py-5 text-3xl font-black uppercase tracking-[-0.02em]"
              style={{ color: store.color_accent }}
            >
              Sale
            </Link>
          </nav>
          {userLoggedIn && (
            <div className="px-6 pb-8">
              <Link
                href="/cuenta"
                className="text-sm font-black uppercase tracking-wide opacity-50"
                style={{ color: store.color_background }}
              >
                Mi cuenta
              </Link>
            </div>
          )}
        </div>
      )}

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
    </>
  )
}
