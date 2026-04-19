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

export function DealershipHeader({ store, categories, userLoggedIn = false }: Props) {
  const [cartOpen, setCartOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const itemCount = useCartStore((s) => s.getItemCount())

  const GOLD = store.color_accent

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div
        className="w-full hidden md:flex items-center justify-between px-8 py-2 text-[10px] font-medium tracking-wide"
        style={{ backgroundColor: store.color_primary, color: `${store.color_background}60` }}
      >
        <div className="flex items-center gap-6">
          {store.whatsapp_number && (
            <a
              href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {store.whatsapp_number}
            </a>
          )}
          {store.email && (
            <a href={`mailto:${store.email}`} className="hover:opacity-100 transition-opacity">
              {store.email}
            </a>
          )}
        </div>
        <div className="flex items-center gap-6">
          <span>Lun–Sáb 9:00–19:00</span>
          {store.instagram_url && (
            <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity">
              Instagram
            </a>
          )}
        </div>
      </div>

      {/* ── Main header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{ backgroundColor: store.color_primary }}
      >
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between h-18 px-8 py-4 max-w-[1400px] mx-auto">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={140} height={48} className="object-contain" />
              : (
                <div>
                  <span
                    className="block text-2xl font-black uppercase tracking-[-0.03em] leading-none"
                    style={{ color: store.color_background }}
                  >
                    {store.name}
                  </span>
                  <span
                    className="block text-[8px] font-semibold uppercase tracking-[0.35em] mt-0.5"
                    style={{ color: GOLD }}
                  >
                    Concesionaria Oficial
                  </span>
                </div>
              )
            }
          </Link>

          {/* Nav — modelos / categorías */}
          <nav className="flex items-center gap-8">
            <Link
              href="/productos"
              className="text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-60"
              style={{ color: store.color_background }}
            >
              Todos los modelos
            </Link>
            {categories.slice(0, 5).map(cat => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="text-[11px] font-semibold uppercase tracking-[0.12em] transition-opacity hover:opacity-60"
                style={{ color: store.color_background }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* CTA + carrito */}
          <div className="flex items-center gap-4">
            {store.whatsapp_number && (
              <a
                href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola, quiero agendar un test drive`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD, color: store.color_primary }}
              >
                Test Drive
              </a>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 transition-opacity hover:opacity-60"
              style={{ color: store.color_background }}
              aria-label="Consultas"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ backgroundColor: GOLD, color: store.color_primary }}
                >
                  {itemCount}
                </span>
              )}
            </button>
            {userLoggedIn && (
              <Link href="/cuenta" className="text-[11px] font-semibold uppercase tracking-wide opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: store.color_background }}>
                Mi cuenta
              </Link>
            )}
          </div>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-between h-16 px-4">
          <button onClick={() => setMobileOpen(true)} style={{ color: store.color_background }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <Link href="/">
            {store.logo_url
              ? <Image src={store.logo_url} alt={store.name} width={100} height={36} className="object-contain" />
              : <span className="text-lg font-black uppercase tracking-tight" style={{ color: store.color_background }}>{store.name}</span>
            }
          </Link>
          <button onClick={() => setCartOpen(true)} className="relative" style={{ color: store.color_background }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={{ backgroundColor: GOLD, color: store.color_primary }}>
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: store.color_primary }}>
          <div className="flex items-center justify-between px-4 h-16">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <span className="text-lg font-black uppercase tracking-tight" style={{ color: store.color_background }}>
                {store.name}
              </span>
            </Link>
            <button onClick={() => setMobileOpen(false)} style={{ color: store.color_background }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav className="flex-1 px-6 pt-4 flex flex-col">
            {[{ href: '/productos', label: 'Todos los modelos' }, ...categories.map(c => ({ href: `/productos?categoria=${c.slug}`, label: c.name }))].map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="py-5 border-b text-2xl font-bold uppercase tracking-tight"
                style={{ color: store.color_background, borderColor: `${store.color_background}15` }}>
                {item.label}
              </Link>
            ))}
          </nav>
          {store.whatsapp_number && (
            <div className="px-6 pb-10">
              <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Quiero agendar un test drive`}
                target="_blank" rel="noopener noreferrer"
                className="block w-full py-4 text-center text-sm font-black uppercase tracking-widest"
                style={{ backgroundColor: GOLD, color: store.color_primary }}>
                Agendar Test Drive
              </a>
            </div>
          )}
        </div>
      )}

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} store={store} />
    </>
  )
}
