'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories?: Category[]
}

export function RealEstateFooter({ store, categories = [] }: Props) {
  const ACCENT = store.color_accent
  const [logoError, setLogoError] = useState(false)

  const whatsappHref = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Me gustaría consultar sobre una propiedad.`
    : null

  return (
    <footer className="border-t border-white/10 bg-[#0d0d0d]">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">

          {/* Brand */}
          <div className="md:col-span-1">
            {store.logo_url && !logoError ? (
              <Image
                src={store.logo_url}
                alt={store.name}
                width={140}
                height={44}
                onError={() => setLogoError(true)}
                className="h-11 w-auto object-contain mb-4"
              />
            ) : (
              <p className="text-xl font-black mb-4 text-white">{store.name}</p>
            )}
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              {store.hero_subtitle ?? `Tu inmobiliaria de confianza. Encontrá la propiedad ideal con ${store.name}.`}
            </p>
            {store.instagram_url && (
              <a
                href={store.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Instagram
              </a>
            )}
          </div>

          {/* Links */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">Propiedades</p>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: '/productos', label: 'Todas las propiedades' },
                { href: '/productos?tag=venta', label: 'En venta' },
                { href: '/productos?tag=alquiler', label: 'En alquiler' },
                { href: '/productos?featured=true', label: 'Destacadas' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">Legal</p>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: '/privacidad', label: 'Política de privacidad' },
                { href: '/terminos', label: 'Términos y condiciones' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/30">Contacto</p>
            <div className="flex flex-col gap-3">
              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <span className="text-base">✉️</span>
                  {store.email}
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
                >
                  <span className="text-base">💬</span>
                  {store.whatsapp_number}
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/25">
        <p>© {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
