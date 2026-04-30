'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: true, hasWhatsappCTA: false, hasProductCatalog: true, hasUserAccount: false,
}

interface Props {
  store: StoreConfig
  categories: Category[]
  features?: SiteFeatures
}

export function RestaurantHeader({ store, categories, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const itemCount = useCartStore(s => s.getItemCount())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quisiera hacer una reserva.`
    : null

  return (
    <>
      {/* ══ Promo bar ══ */}
      <div
        className="hidden md:flex w-full items-center justify-between px-8 py-2 text-[10px] font-medium tracking-[0.2em] uppercase"
        style={{ backgroundColor: '#0a0704', color: 'rgba(240,235,224,0.4)' }}
      >
        <span>Mar–Dom · 12:00 – 00:00</span>
        <span style={{ color: '#c8902a' }}>{store.name}</span>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer"
            className="transition-colors hover:text-[#c8902a]">
            Reservas por WhatsApp →
          </a>
        )}
      </div>

      {/* ══ Main header ══ */}
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(14,11,6,0.97)' : '#0e0b06',
          borderBottom: scrolled ? '1px solid rgba(200,144,42,0.15)' : '1px solid rgba(240,235,224,0.07)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between h-[62px] px-6 md:px-8">

          {/* Logo / nombre */}
          <Link href="/" className="flex items-center gap-3">
            {store.logo_url ? (
              <Image src={store.logo_url} alt={store.name} width={120} height={36}
                className="h-8 w-auto object-contain" priority />
            ) : (
              <span
                className="text-xl font-black uppercase tracking-[0.32em]"
                style={{ color: '#f0ebe0', letterSpacing: '0.32em' }}
              >
                {store.name}
              </span>
            )}
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <RestLink href="/" label="Inicio" />
            <RestLink href="/productos" label="Menú" />
            {categories.slice(0, 3).map(cat => (
              <RestLink key={cat.id} href={`/productos?categoria=${cat.slug}`} label={cat.name} />
            ))}
          </nav>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            {/* WhatsApp reserva */}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}
              >
                Reservar
              </a>
            )}

            {/* Cart */}
            {features.hasCart && (
              <button onClick={() => setCartOpen(true)} className="relative p-1" aria-label="Pedido">
                <CartIcon />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black"
                    style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              className="md:hidden p-1"
              aria-label="Menú"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-6 py-6 space-y-5"
            style={{ borderColor: 'rgba(200,144,42,0.15)', backgroundColor: '#0e0b06' }}
          >
            {[{ href: '/', label: 'Inicio' }, { href: '/productos', label: 'Menú completo' }, ...categories.map(c => ({ href: `/productos?categoria=${c.slug}`, label: c.name }))].map(item => (
              <Link key={item.href} href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block text-sm font-bold uppercase tracking-[0.18em] border-b pb-5"
                style={{ color: '#f0ebe0', borderColor: 'rgba(240,235,224,0.06)' }}
              >
                {item.label}
              </Link>
            ))}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="block text-center py-3 text-[11px] font-black uppercase tracking-[0.2em]"
                style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}>
                Reservar por WhatsApp
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

function RestLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="text-[11px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-[#c8902a]"
      style={{ color: 'rgba(240,235,224,0.6)' }}>
      {label}
    </Link>
  )
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(240,235,224,0.8)"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(240,235,224,0.8)"
      strokeWidth="1.8" strokeLinecap="round">
      {open
        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
        : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
      }
    </svg>
  )
}
