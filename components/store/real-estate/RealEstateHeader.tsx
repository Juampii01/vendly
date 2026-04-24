'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

interface Props {
  store: StoreConfig
  categories?: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
}

export function RealEstateHeader({ store, categories = [], userLoggedIn = false, features }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const ACCENT = store.color_accent

  const navLinks = [
    { href: '/productos', label: 'Propiedades' },
    { href: '/productos?tag=venta', label: 'En venta' },
    { href: '/productos?tag=alquiler', label: 'En alquiler' },
  ]

  const whatsappHref = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Me gustaría consultar sobre una propiedad.`
    : null

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

        {/* Logo / Name */}
        <Link href="/" className="flex items-center gap-3">
          {store.logo_url ? (
            <Image src={store.logo_url} alt={store.name} width={120} height={36} className="h-9 w-auto object-contain" />
          ) : (
            <span className="text-lg font-black tracking-tight" style={{ color: ACCENT }}>
              {store.name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {store.email && (
            <a
              href={`mailto:${store.email}`}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {store.email}
            </a>
          )}
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110"
              style={{ backgroundColor: ACCENT }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex md:hidden flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {label}
              </Link>
            ))}
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 rounded-full px-4 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}
              >
                Consultar por WhatsApp
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
