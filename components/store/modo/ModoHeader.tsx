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

export function ModoHeader({ store, categories, userLoggedIn = false }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  return (
    <>
      {/* ── Promo bar ── */}
      <div
        className="w-full py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em]"
        style={{ backgroundColor: store.color_accent, color: '#fff' }}
      >
        {store.home_marquee_items?.[0] ?? `Envío gratis desde $${store.free_shipping_threshold?.toLocaleString('es-AR') ?? '50.000'}`}
      </div>

      {/* ── Main header ── */}
      <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#fff', borderColor: '#e8e8e8' }}>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-3 items-center h-16 px-8 max-w-7xl mx-auto">

          {/* Nav izquierda */}
          <nav className="flex items-center gap-7">
            <Link
              href="/productos"
              className="text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-50"
              style={{ color: store.color_text }}
            >
              Todo
            </Link>
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-50"
                style={{ color: store.color_text }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Logo centrado */}
          <div className="flex justify-center">
            <Link href="/">
              {store.logo_url ? (
                <Image src={store.logo_url} alt={store.name} width={120} height={36} className="h-8 w-auto object-contain" priority />
              ) : (
                <span className="text-xl font-black uppercase tracking-[0.25em]" style={{ color: store.color_text }}>
                  {store.name}
                </span>
              )}
            </Link>
          </div>

          {/* Acciones derecha */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href={userLoggedIn ? '/cuenta' : '/cuenta/login'}
              className="text-[11px] font-bold uppercase tracking-[0.18em] transition-opacity hover:opacity-50"
              style={{ color: store.color_text }}
            >
              {userLoggedIn ? 'Cuenta' : 'Ingresar'}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 transition-opacity hover:opacity-50"
            >
              <BagIcon color={store.color_text} />
              {itemCount > 0 && (
                <span
                  className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                  style={{ backgroundColor: store.color_accent }}
                >
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between h-14 px-5">
          <button onClick={() => setMenuOpen(v => !v)}>
            <HamburgerIcon open={menuOpen} color={store.color_text} />
          </button>

          <Link href="/">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={100} height={32} className="h-7 w-auto object-contain" priority />
              : <span className="text-base font-black uppercase tracking-[0.2em]" style={{ color: store.color_text }}>{store.name}</span>
            }
          </Link>

          <button onClick={() => setCartOpen(true)} className="relative">
            <BagIcon color={store.color_text} />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                style={{ backgroundColor: store.color_accent }}>
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden border-t px-5 py-4 space-y-4" style={{ borderColor: '#e8e8e8', backgroundColor: '#fff' }}>
            <Link href="/productos" onClick={() => setMenuOpen(false)}
              className="block text-sm font-black uppercase tracking-[0.18em]" style={{ color: store.color_text }}>
              Ver todo
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`/productos?categoria=${cat.slug}`} onClick={() => setMenuOpen(false)}
                className="block text-sm font-black uppercase tracking-[0.18em]" style={{ color: store.color_text }}>
                {cat.name}
              </Link>
            ))}
            <div className="pt-2 border-t" style={{ borderColor: '#e8e8e8' }}>
              <Link href={userLoggedIn ? '/cuenta' : '/cuenta/login'} onClick={() => setMenuOpen(false)}
                className="block text-sm font-black uppercase tracking-[0.18em]" style={{ color: store.color_text }}>
                {userLoggedIn ? 'Mi cuenta' : 'Ingresar'}
              </Link>
            </div>
          </div>
        )}
      </header>

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
    </>
  )
}

function BagIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function HamburgerIcon({ open, color }: { open: boolean; color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
        : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
      }
    </svg>
  )
}
