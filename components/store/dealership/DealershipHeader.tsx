'use client'

import { useState, useEffect, useRef } from 'react'
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

export function DealershipHeader({ store, categories, features = DEFAULT_FEATURES }: Props) {
  const [cartOpen, setCartOpen]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [scrolled, setScrolled]       = useState(false)
  const [modelsOpen, setModelsOpen]   = useState(false)
  const modelsRef = useRef<HTMLDivElement>(null)
  const itemCount = useCartStore((s) => s.getItemCount())
  const ACCENT = store.color_accent
  const waNum = store.whatsapp_number?.replace(/\D/g, '') ?? ''

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Close mega menu on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (modelsRef.current && !modelsRef.current.contains(e.target as Node)) {
        setModelsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <>
      {/* ── Info bar ────────────────────────────────────────────────────────── */}
      <div className="hidden md:flex w-full items-center justify-between px-8 h-8 text-[10px] tracking-wider"
        style={{ backgroundColor: '#060810', color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-6">
          {waNum && (
            <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors">
              <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {store.whatsapp_number}
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
          <span className="font-bold" style={{ color: ACCENT }}>● Concesionaria Oficial</span>
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.98)' : '#ffffff',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: `1px solid ${scrolled ? '#e2e8f0' : '#f1f5f9'}`,
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.07)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 h-[68px] flex items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex flex-col leading-tight mr-4">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={130} height={40}
                  className="h-10 w-auto object-contain" />
              : <>
                  <span className="font-black text-xl tracking-[0.05em] uppercase text-slate-900">{store.name}</span>
                  <span className="text-[8px] font-bold tracking-[0.4em] uppercase" style={{ color: ACCENT }}>
                    Concesionaria Oficial
                  </span>
                </>
            }
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-8 bg-slate-100 mx-2" />

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-0 flex-1">
            {/* Modelos mega-menu */}
            <div ref={modelsRef} className="relative">
              <button
                onClick={() => setModelsOpen(o => !o)}
                className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors text-slate-700 hover:text-slate-900 hover:bg-slate-50"
              >
                Modelos
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" className={`transition-transform ${modelsOpen ? 'rotate-180' : ''}`}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {/* Mega-menu dropdown */}
              {modelsOpen && categories.length > 0 && (
                <div className="absolute top-full left-0 mt-0.5 w-72 bg-white border border-slate-100 shadow-2xl z-50">
                  <div className="p-2">
                    <Link href="/productos" onClick={() => setModelsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:bg-slate-50 text-slate-500 hover:text-slate-900">
                      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: ACCENT }} />
                      Todos los modelos
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    {categories.map(cat => (
                      <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                        onClick={() => setModelsOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-slate-50 text-slate-600 hover:text-slate-900 group">
                        <span className="w-1 h-1 rounded-full bg-slate-200 group-hover:bg-[var(--acc)] transition-colors"
                          style={{ ['--acc' as string]: ACCENT }} />
                        {cat.name}
                      </Link>
                    ))}
                    <div className="my-1 h-px bg-slate-100" />
                    <div className="flex gap-1 p-1">
                      <Link href="/productos?tag=0km" onClick={() => setModelsOpen(false)}
                        className="flex-1 py-2 text-center text-[9px] font-black uppercase tracking-[0.1em] transition-all text-white"
                        style={{ backgroundColor: ACCENT }}>
                        0 km
                      </Link>
                      <Link href="/productos?tag=usado" onClick={() => setModelsOpen(false)}
                        className="flex-1 py-2 text-center text-[9px] font-black uppercase tracking-[0.1em] transition-all text-white bg-slate-700 hover:bg-slate-800">
                        Usados
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/productos?tag=0km" label="0 km" />
            <NavLink href="/productos?tag=usado" label="Usados" />
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2">
            {waNum && (
              <a
                href={`https://wa.me/${waNum}?text=${encodeURIComponent('Hola! Me gustaría solicitar un test drive.')}`}
                target="_blank" rel="noopener noreferrer"
                className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: ACCENT, color: '#ffffff' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                  <rect x="9" y="11" width="14" height="10" rx="1"/>
                </svg>
                Test Drive
              </a>
            )}

            {features.hasCart && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 transition-colors text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                aria-label="Consultas guardadas"
              >
                <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white"
                    style={{ backgroundColor: ACCENT }}>
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2.5 transition-colors text-slate-600 hover:bg-slate-50"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ────────────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="lg:hidden border-t bg-white px-6 pb-6 pt-3"
            style={{ borderColor: '#f1f5f9' }}>

            {/* Condition filters */}
            <div className="flex gap-2 mb-4 pb-4 border-b border-slate-100">
              <Link href="/productos?tag=0km" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-[9px] font-black uppercase tracking-wider text-white"
                style={{ backgroundColor: ACCENT }}>
                0 km
              </Link>
              <Link href="/productos?tag=usado" onClick={() => setMobileOpen(false)}
                className="flex-1 py-2 text-center text-[9px] font-black uppercase tracking-wider text-white bg-slate-700">
                Usados
              </Link>
            </div>

            {/* All categories */}
            <div className="flex flex-col">
              <Link href="/productos" onClick={() => setMobileOpen(false)}
                className="py-3.5 text-sm font-bold border-b text-slate-700 hover:text-slate-900 transition-colors uppercase tracking-wide"
                style={{ borderColor: '#f8fafc' }}>
                Todos los modelos
              </Link>
              {categories.map(c => (
                <Link key={c.id} href={`/productos?categoria=${c.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="py-3.5 text-sm font-semibold border-b text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wide"
                  style={{ borderColor: '#f8fafc' }}>
                  {c.name}
                </Link>
              ))}
            </div>

            {/* Test drive CTA */}
            {waNum && (
              <a href={`https://wa.me/${waNum}?text=${encodeURIComponent('Hola! Quiero solicitar un test drive.')}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-5 block py-3.5 text-center text-xs font-black uppercase tracking-[0.2em] text-white"
                style={{ backgroundColor: ACCENT }}>
                Solicitar Test Drive
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

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href}
      className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors text-slate-500 hover:text-slate-900 hover:bg-slate-50">
      {label}
    </Link>
  )
}
