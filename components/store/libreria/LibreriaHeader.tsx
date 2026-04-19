'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: true, hasWhatsappCTA: false, hasProductCatalog: true,
}

interface Props {
  store: StoreConfig
  categories: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
}

export function LibreriaHeader({ store, categories, userLoggedIn = false, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  const ACCENT  = store.color_accent
  const BG      = store.color_background
  const TEXT    = store.color_text
  const PRIMARY = store.color_primary

  return (
    <>
      {/* Promo bar */}
      <div
        className="w-full py-2 text-center text-[10px] font-semibold tracking-[0.22em] uppercase"
        style={{ backgroundColor: ACCENT, color: '#FAF6EF' }}
      >
        {store.home_marquee_items?.[0] ?? 'Envío gratis en compras mayores a $15.000 · Nuevas llegadas semanales'}
      </div>

      {/* Main header */}
      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{ backgroundColor: BG, borderColor: `${TEXT}18`, boxShadow: '0 1px 12px rgba(44,26,14,0.06)' }}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center h-[68px] px-8 gap-6 max-w-[1400px] mx-auto">
          <Link href="/" className="shrink-0 mr-4 flex items-center gap-2.5">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={120} height={38} className="object-contain" />
              : (
                <div className="flex flex-col leading-none">
                  <span className="text-xl font-black tracking-[-0.02em]" style={{ color: PRIMARY, fontFamily: 'Georgia, serif' }}>
                    {store.name}
                  </span>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.35em] mt-0.5" style={{ color: ACCENT }}>
                    Librería
                  </span>
                </div>
              )
            }
          </Link>

          <div className="w-px h-8 shrink-0" style={{ backgroundColor: `${TEXT}18` }} />

          <nav className="flex items-center gap-1 flex-1">
            <Link href="/productos" className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] rounded transition-colors hover:bg-black/5" style={{ color: TEXT }}>
              Todos los libros
            </Link>
            {categories.slice(0, 6).map(cat => (
              <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] rounded transition-colors hover:bg-black/5"
                style={{ color: `${TEXT}99` }}>
                {cat.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(!searchOpen)} className="transition-opacity hover:opacity-50 p-1" style={{ color: TEXT }} aria-label="Buscar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
            {userLoggedIn && (
              <Link href="/cuenta" className="text-[11px] font-semibold uppercase tracking-wide transition-opacity hover:opacity-50" style={{ color: TEXT }}>
                Mi cuenta
              </Link>
            )}
            {features.hasCart && (
              <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-1.5 transition-opacity hover:opacity-60" style={{ color: TEXT }} aria-label="Carrito">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center" style={{ backgroundColor: ACCENT, color: '#FAF6EF' }}>
                    {itemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between h-[58px] px-4">
          <button onClick={() => setMobileOpen(true)} className="p-1.5" style={{ color: TEXT }} aria-label="Menú">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <Link href="/">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={80} height={30} className="object-contain" />
              : <span className="text-lg font-black tracking-[-0.02em]" style={{ color: PRIMARY, fontFamily: 'Georgia, serif' }}>{store.name}</span>
            }
          </Link>
          {features.hasCart ? (
            <button onClick={() => setCartOpen(true)} className="relative p-1.5" style={{ color: TEXT }} aria-label="Carrito">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center" style={{ backgroundColor: ACCENT, color: '#FAF6EF' }}>
                  {itemCount}
                </span>
              )}
            </button>
          ) : <div className="w-9" />}
        </div>

        {searchOpen && (
          <div className="border-t px-8 py-3" style={{ borderColor: `${TEXT}15`, backgroundColor: BG }}>
            <form action="/productos" className="flex items-center gap-3 max-w-2xl mx-auto">
              <svg className="w-4 h-4 shrink-0 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" style={{ color: TEXT }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input name="busqueda" autoFocus placeholder="Buscar libros, autores, géneros..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: TEXT }} />
              <button type="button" onClick={() => setSearchOpen(false)} className="opacity-40 hover:opacity-100 transition-opacity text-xs font-bold" style={{ color: TEXT }}>✕</button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: PRIMARY }}>
          <div className="flex items-center justify-between px-5 h-[58px]" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span className="text-lg font-black tracking-tight" style={{ color: BG, fontFamily: 'Georgia, serif' }}>{store.name}</span>
            <button onClick={() => setMobileOpen(false)} style={{ color: BG }} aria-label="Cerrar">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-6 pt-4 flex flex-col overflow-y-auto">
            <Link href="/productos" onClick={() => setMobileOpen(false)} className="py-4 border-b text-2xl font-black tracking-tight" style={{ color: BG, borderColor: 'rgba(255,255,255,0.1)', fontFamily: 'Georgia, serif' }}>
              Todos los libros
            </Link>
            {categories.map(cat => (
              <Link key={cat.id} href={`/productos?categoria=${cat.slug}`} onClick={() => setMobileOpen(false)} className="py-4 border-b text-xl font-semibold" style={{ color: `${BG}CC`, borderColor: 'rgba(255,255,255,0.08)' }}>
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {features.hasCart && <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />}
    </>
  )
}
