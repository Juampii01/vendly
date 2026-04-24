'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { CartSidebar } from '../CartSidebar'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: false, hasWhatsappCTA: true, hasProductCatalog: true, hasUserAccount: false,
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
  const ACCENT = store.color_accent

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      {/* ── Info bar ────────────────────────────────────────────────────────── */}
      <div
        className="hidden md:flex w-full items-center justify-between px-8 h-8 text-[10px] tracking-wider border-b"
        style={{ backgroundColor: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}
      >
        <div className="flex items-center gap-6">
          {store.whatsapp_number && (
            <a
              href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="hover:text-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>📞</span>{store.whatsapp_number}
            </a>
          )}
          {store.email && (
            <a href={`mailto:${store.email}`} className="hover:text-slate-700 transition-colors">
              {store.email}
            </a>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span>Lun–Vie 9:00–19:00 · Sáb 9:00–14:00</span>
          <span className="font-bold" style={{ color: ACCENT }}>● Concesionaria Oficial</span>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full transition-all duration-300 border-b"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : '#ffffff',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderColor: '#e2e8f0',
          boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-[68px] flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col leading-tight mr-2">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={130} height={40} className="h-10 w-auto object-contain" />
              : <>
                  <span className="font-black text-xl tracking-[0.08em] uppercase text-slate-900">{store.name}</span>
                  <span className="text-[8px] font-bold tracking-[0.4em] uppercase" style={{ color: ACCENT }}>
                    Concesionaria Oficial
                  </span>
                </>
            }
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-7 mx-2 bg-slate-200" />

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1">
            <Link
              href="/productos"
              className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] rounded-lg transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              Todos los modelos
            </Link>
            {categories.slice(0, 5).map(cat => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] rounded-lg transition-colors text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-3">
            <a
              href={store.whatsapp_number
                ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Me gustaría solicitar un test drive.`
                : '#'}
              target="_blank" rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 rounded-lg"
              style={{ backgroundColor: ACCENT, color: '#ffffff' }}
            >
              Test Drive
            </a>

            {features.hasCart && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl transition-colors text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                aria-label="Consultas guardadas"
              >
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 rounded-xl transition-colors text-slate-600 hover:bg-slate-100"
            >
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
          <div className="lg:hidden border-t px-6 pb-6 pt-3 bg-white" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex flex-col">
              {[{ name: 'Todos los modelos', href: '/productos' },
                ...categories.map(c => ({ name: c.name, href: `/productos?categoria=${c.slug}` }))
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-sm font-semibold border-b text-slate-700 hover:text-slate-900 transition-colors"
                  style={{ borderColor: '#f1f5f9' }}
                >
                  {item.name}
                </Link>
              ))}
              <a
                href={store.whatsapp_number
                  ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Quiero solicitar un test drive.`
                  : '#'}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 py-3.5 text-center text-xs font-black uppercase tracking-[0.2em] text-white rounded-xl"
                style={{ backgroundColor: ACCENT }}
              >
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
