'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: false, hasWhatsappCTA: true, hasProductCatalog: true,
}

interface Props {
  store: StoreConfig
  categories: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
}

export function DealershipHeader({ store, categories, userLoggedIn = false, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())
  const GOLD = store.color_accent

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      {/* Info bar */}
      <div className="hidden md:flex w-full items-center justify-between px-8 h-9 text-[10px] tracking-wider"
        style={{ backgroundColor: '#0a0a0f', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-6">
          {store.whatsapp_number && (
            <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1.5">
              <span>📞</span>{store.whatsapp_number}
            </a>
          )}
          {store.email && (
            <a href={`mailto:${store.email}`} className="hover:text-white transition-colors">
              {store.email}
            </a>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span>Lun–Vie 9:00–19:00 · Sáb 9:00–14:00</span>
          <span style={{ color: GOLD }}>● Concesionaria Oficial</span>
        </div>
      </div>

      {/* Main header */}
      <header className="sticky top-0 z-40 w-full transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(13,13,20,0.97)' : store.color_primary,
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-[70px] flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col leading-tight mr-2">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={130} height={40} className="h-9 w-auto object-contain" />
              : <>
                <span className="font-black text-xl tracking-[0.08em] uppercase text-white">{store.name}</span>
                <span className="text-[8px] font-semibold tracking-[0.4em] uppercase" style={{ color: GOLD }}>Concesionaria Oficial</span>
              </>
            }
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-8 mx-2" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            <Link href="/productos"
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] rounded-md transition-colors hover:bg-white/8 hover:text-white"
              style={{ color: 'rgba(255,255,255,0.75)' }}>
              Todos los modelos
            </Link>
            {categories.slice(0, 5).map(cat => (
              <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.15em] rounded-md transition-colors hover:bg-white/8 hover:text-white"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <a href={store.whatsapp_number ? `https://wa.me/${store.whatsapp_number}?text=Hola! Me gustaría solicitar un test drive.` : '#'}
              target="_blank" rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: GOLD, color: store.color_primary }}>
              Test Drive
            </a>

            {features.hasCart && (
              <button onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                aria-label="Consultas guardadas">
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                    style={{ backgroundColor: GOLD, color: store.color_primary }}>
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-lg hover:bg-white/10 transition-colors"
              style={{ color: 'rgba(255,255,255,0.8)' }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t px-6 pb-6 pt-4"
            style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: store.color_primary }}>
            <div className="flex flex-col gap-0">
              {[{ name: 'Todos los modelos', href: '/productos' },
                ...categories.map(c => ({ name: c.name, href: `/productos?categoria=${c.slug}` }))
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-sm font-semibold border-b"
                  style={{ color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  {item.name}
                </Link>
              ))}
              <a href={store.whatsapp_number ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quiero solicitar un test drive.` : '#'}
                target="_blank" rel="noopener noreferrer"
                className="mt-5 py-3.5 text-center text-xs font-black uppercase tracking-[0.2em]"
                style={{ backgroundColor: GOLD, color: store.color_primary }}>
                Solicitar Test Drive
              </a>
            </div>
          </div>
        )}
      </header>

      {features.hasCart && (
        <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
      )}
    </>
  )
}
