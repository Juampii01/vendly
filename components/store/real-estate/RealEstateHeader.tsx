'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useFavoritesStore } from '@/lib/favorites'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

interface Props {
  store: StoreConfig
  categories?: Category[]
  userLoggedIn?: boolean
  features?: SiteFeatures
  onFavoritesOpen?: () => void
}

export function RealEstateHeader({
  store,
  categories = [],
  userLoggedIn = false,
  features,
  onFavoritesOpen,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const ACCENT = store.color_accent
  const count = useFavoritesStore((s) => s.getCount())

  const navLinks = [
    { href: '/productos', label: 'Todas' },
    { href: '/productos?tag=venta', label: 'En venta' },
    { href: '/productos?tag=alquiler', label: 'En alquiler' },
    ...categories.slice(0, 3).map(c => ({
      href: `/productos?categoria=${c.slug}`,
      label: c.name,
    })),
  ]

  const whatsappHref = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Me gustaría consultar sobre una propiedad.`
    : null

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0d0d0d]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {store.logo_url && !logoError ? (
            <Image
              src={store.logo_url}
              alt={store.name}
              width={140}
              height={44}
              className="h-11 w-auto object-contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className="text-lg font-black tracking-tight text-white">
              {store.name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Favoritos */}
          <button
            onClick={onFavoritesOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            aria-label="Mis favoritos"
          >
            <HeartIcon color={count > 0 ? ACCENT : 'rgba(255,255,255,0.4)'} filled={count > 0} />
            {count > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
                style={{ backgroundColor: ACCENT }}
              >
                {count}
              </span>
            )}
          </button>

          {/* Cuenta — desktop */}
          {!userLoggedIn ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/cuenta/login"
                className="rounded-full px-3 py-2 text-xs font-semibold text-white/60 transition-colors hover:text-white hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/cuenta/register"
                className="rounded-full px-4 py-2 text-xs font-bold text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}
              >
                Contactar agente
              </Link>
            </div>
          ) : (
            <Link
              href="/cuenta"
              className="hidden md:flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white/70 transition-colors hover:bg-white/10"
            >
              <UserIcon />
              Mi cuenta
            </Link>
          )}

          {/* WhatsApp CTA — desktop */}
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:brightness-110"
              style={{ backgroundColor: ACCENT }}
            >
              <WAIcon />
              Consultar
            </a>
          )}

          {/* Hamburger — mobile */}
          <button
            className="flex lg:hidden flex-col gap-1.5 p-1 ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-[#0d0d0d] px-4 pb-5 lg:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
          {/* Cuenta — mobile */}
          <div className="mt-3 flex flex-col gap-2">
            {!userLoggedIn ? (
              <>
                <Link
                  href="/cuenta/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-semibold text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/cuenta/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-white"
                  style={{ backgroundColor: ACCENT }}
                >
                  Contactar agente
                </Link>
              </>
            ) : (
              <Link
                href="/cuenta"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 py-3 text-sm font-semibold text-white"
              >
                <UserIcon />
                Mi cuenta
              </Link>
            )}
          </div>

          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-full py-3 text-sm font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: '#25D366' }}
            >
              <WAIcon />
              Consultar por WhatsApp
            </a>
          )}
        </div>
      )}
    </header>
  )
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function HeartIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={filled ? 'none' : color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function WAIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
