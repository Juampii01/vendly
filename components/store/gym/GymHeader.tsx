'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
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

export function GymHeader({ store, categories, userLoggedIn = false, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = useCartStore(s => s.getItemCount())

  const ACCENT = store.color_accent // #e63c2f
  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quiero información sobre membresías.`
    : null

  return (
    <>
      {/* ══ Promo bar ══ */}
      <div
        className="flex items-center justify-center gap-8 py-2 overflow-hidden"
        style={{ backgroundColor: ACCENT }}
      >
        <style>{`
          @keyframes gym-ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .gym-ticker { display:inline-block; white-space:nowrap; animation: gym-ticker 25s linear infinite; }
        `}</style>
        <div className="gym-ticker text-[10px] font-black uppercase tracking-[0.25em] text-white select-none">
          {[...(store.home_marquee_items ?? ['Abierto 6–23hs', 'Entrenadores certificados', '500+ miembros']),
            ...(store.home_marquee_items ?? ['Abierto 6–23hs', 'Entrenadores certificados', '500+ miembros'])].map((t, i) => (
            <span key={i} className="mx-6">
              {t} <span className="opacity-50 mx-2">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ══ Main header ══ */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: '#080808', borderColor: 'rgba(245,245,245,0.06)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between h-[60px] px-5 md:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={120} height={36}
                className="h-8 w-auto object-contain" priority />
            ) : (
              <span className="text-lg font-black uppercase tracking-[0.25em]" style={{ color: '#f5f5f5' }}>
                {store.name}
              </span>
            )}
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <GymLink href="/productos" label="Membresías" />
            <GymLink href="/productos?categoria=clases" label="Clases" />
            <GymLink href="/productos?categoria=personal-training" label="Personal Training" />
            <GymLink href="/productos?categoria=suplementos" label="Suplementos" />
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="hidden md:inline-flex items-center px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: ACCENT, color: '#fff' }}>
                Empezar ahora
              </a>
            )}
            {features.hasCart && (
              <button onClick={() => setCartOpen(true)} className="relative p-1" aria-label="Carrito">
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                    style={{ backgroundColor: ACCENT }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden p-1">
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden border-t px-5 py-5" style={{ borderColor: 'rgba(245,245,245,0.06)', backgroundColor: '#0d0d0d' }}>
            {[
              { href: '/productos', label: 'Membresías' },
              { href: '/productos?categoria=clases', label: 'Clases' },
              { href: '/productos?categoria=personal-training', label: 'Personal Training' },
              { href: '/productos?categoria=suplementos', label: 'Suplementos' },
              { href: '/productos?categoria=indumentaria', label: 'Indumentaria' },
            ].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="block py-4 text-sm font-black uppercase tracking-[0.18em] border-b"
                style={{ color: '#f5f5f5', borderColor: 'rgba(245,245,245,0.06)' }}>
                {item.label}
              </Link>
            ))}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="block mt-5 w-full text-center py-3.5 text-[11px] font-black uppercase tracking-[0.2em]"
                style={{ backgroundColor: ACCENT, color: '#fff' }}>
                Empezar ahora
              </a>
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

function GymLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="text-[11px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-white"
      style={{ color: 'rgba(245,245,245,0.45)' }}>
      {label}
    </Link>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,245,0.8)"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,245,0.8)"
      strokeWidth="1.8" strokeLinecap="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
        : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
      }
    </svg>
  )
}
