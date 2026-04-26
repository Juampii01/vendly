'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { RealEstateHeader } from './RealEstateHeader'
import { RealEstateFooter } from './RealEstateFooter'
import { RealEstateFloatingWhatsApp } from './RealEstateFloatingWhatsApp'
import { FavoritesSidebar } from './FavoritesSidebar'
import { RealEstatePropertyCard } from './RealEstatePropertyCard'
import { hydrateFavorites } from '@/lib/favorites'
import { FadeUp, StaggerGrid, StaggerItem } from '@/components/store/motion'
import type { Product, StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
  products: Product[]
  total: number
  page: number
  totalPages: number
  params: {
    categoria?: string
    busqueda?: string
    pagina?: string
    tag?: string
    featured?: string
  }
}

// ─── Filter definitions ───────────────────────────────────────────────────────

const OPERATION_FILTERS = [
  { href: '/productos',              label: 'Todos',       tag: undefined,    featured: undefined },
  { href: '/productos?tag=venta',    label: 'En venta',    tag: 'venta',      featured: undefined },
  { href: '/productos?tag=alquiler', label: 'En alquiler', tag: 'alquiler',   featured: undefined },
  { href: '/productos?featured=true',label: 'Destacados',  tag: undefined,    featured: 'true'    },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function RealEstateProductsPage({
  store,
  categories,
  products,
  total,
  page,
  totalPages,
  params,
}: Props) {
  const [favOpen, setFavOpen] = useState(false)
  useEffect(() => { hydrateFavorites() }, [])

  const ACCENT = store.color_accent
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const handleSearch = useDebouncedCallback((value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) { p.set('busqueda', value) } else { p.delete('busqueda') }
    p.delete('pagina')
    startTransition(() => { router.push(`${pathname}?${p.toString()}`) })
  }, 300)

  const activeCategory = params.categoria
    ? categories.find(c => c.slug === params.categoria) ?? null
    : null

  // Section title + label
  const sectionLabel =
    params.tag === 'venta'    ? 'Oportunidades'       :
    params.tag === 'alquiler' ? 'Disponible ahora'    :
    params.featured === 'true'? 'Selección especial'  :
    activeCategory            ? 'Explorá por tipo'    :
    'Catálogo completo'

  const sectionTitle =
    params.tag === 'venta'    ? 'Inmuebles en venta'     :
    params.tag === 'alquiler' ? 'Inmuebles en alquiler'  :
    params.featured === 'true'? 'Inmuebles destacados'   :
    activeCategory            ? activeCategory.name      :
    'Todos los inmuebles'

  const isActive = (f: typeof OPERATION_FILTERS[0]) => {
    if (f.featured === 'true') return params.featured === 'true'
    if (f.tag)                 return params.tag === f.tag && params.featured !== 'true'
    return !params.tag && !params.featured && !params.categoria
  }

  return (
    <div className="bg-[#0d0d0d] text-white">
      <RealEstateHeader store={store} categories={categories} onFavoritesOpen={() => setFavOpen(true)} />
      <FavoritesSidebar store={store} open={favOpen} onClose={() => setFavOpen(false)} />

      {/* ── Breadcrumb + título de sección ──────────────────────────────────── */}
      <section className="border-b border-white/10 bg-[#0d0d0d] px-4 pt-8 pb-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumb */}
          <nav className="mb-8 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/30">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-white transition-colors">Inmuebles</Link>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-white/70 font-bold">{activeCategory.name}</span>
              </>
            )}
            {params.tag && (
              <>
                <span>/</span>
                <span className="text-white/70 font-bold capitalize">{params.tag}</span>
              </>
            )}
          </nav>

          {/* Title */}
          <FadeUp>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>
              {sectionLabel}
            </p>
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[0.9] text-white">
                {sectionTitle}
              </h1>
              <p className="text-sm text-white/30 pb-1">
                {total} inmueble{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            </div>
          </FadeUp>

          {/* Quick filter pills + buscador */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {OPERATION_FILTERS.map(f => {
                const active = isActive(f)
                return (
                  <Link
                    key={f.href}
                    href={f.href}
                    className="px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.15em] border transition-all"
                    style={active
                      ? { backgroundColor: ACCENT, borderColor: ACCENT, color: '#fff' }
                      : { borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' }
                    }
                  >
                    {f.label}
                  </Link>
                )
              })}
            </div>

            {/* Buscador */}
            <div className="relative w-full sm:w-72">
              <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-white/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="search"
                defaultValue={params.busqueda}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar inmuebles..."
                className="w-full border border-white/20 bg-white/5 text-white placeholder:text-white/30 py-2.5 pl-9 pr-4 text-sm outline-none transition-colors focus:border-white/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Contenido principal ───────────────────────────────────────────────── */}
      <section className="bg-[#0d0d0d] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-7xl flex gap-8 flex-col lg:flex-row">

          {/* ── Sidebar ─────────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-60 shrink-0 flex flex-col gap-5">

            {/* Operación */}
            <div className="rounded-2xl border border-white/10 bg-[#161616] p-6">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                Operación
              </p>
              <nav className="flex flex-col gap-0.5">
                {OPERATION_FILTERS.map(f => {
                  const active = isActive(f)
                  return (
                    <Link
                      key={f.href}
                      href={f.href}
                      className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active ? 'text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                      }`}
                      style={active ? { backgroundColor: ACCENT } : {}}
                    >
                      {f.label}
                      {active && <span className="text-[10px] opacity-70">✓</span>}
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Tipo de inmueble */}
            {categories.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-[#161616] p-6">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                  Tipo de inmueble
                </p>
                <nav className="flex flex-col gap-0.5">
                  {categories.map(cat => {
                    const active = activeCategory?.slug === cat.slug
                    return (
                      <Link
                        key={cat.id}
                        href={`/productos?categoria=${cat.slug}`}
                        className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold transition-colors ${
                          active ? 'text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'
                        }`}
                        style={active ? { backgroundColor: ACCENT } : {}}
                      >
                        {cat.name}
                        {active && <span className="text-[10px] opacity-70">✓</span>}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}

            {/* CTA Asesor */}
            <div className="rounded-2xl border border-white/10 bg-[#161616] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-3">
                ¿Necesitás ayuda?
              </p>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                Nuestros asesores te acompañan en cada paso.
              </p>
              {store.whatsapp_number && (
                <a
                  href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Estoy buscando un inmueble y quisiera asesoramiento.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: ACCENT }}
                >
                  Consultar ahora
                </a>
              )}
            </div>
          </aside>

          {/* ── Grilla ───────────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {products.length === 0 ? (
              <EmptyState accent={ACCENT} />
            ) : (
              <>
                <StaggerGrid className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map(product => (
                    <StaggerItem key={product.id}>
                      <RealEstatePropertyCard product={product} store={store} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    {page > 1 && (
                      <Link
                        href={buildPageHref(params, page - 1)}
                        className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                        style={{ backgroundColor: ACCENT }}
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="text-sm text-white/30 font-medium">
                      {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link
                        href={buildPageHref(params, page + 1)}
                        className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                        style={{ backgroundColor: ACCENT }}
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </section>

      <RealEstateFooter store={store} categories={categories} />

      {store.whatsapp_number && (
        <RealEstateFloatingWhatsApp phoneNumber={store.whatsapp_number} />
      )}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ accent }: { accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#161616] p-16 text-center">
      <p className="text-5xl mb-6 opacity-20">🏠</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: accent }}>
        Sin resultados
      </p>
      <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
        No encontramos inmuebles
      </h3>
      <p className="text-sm text-white/40 mb-8">
        Probá con otro filtro o explorá el catálogo completo
      </p>
      <Link
        href="/productos"
        className="inline-block px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
        style={{ backgroundColor: accent }}
      >
        Ver todos los inmuebles
      </Link>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildPageHref(params: Record<string, string | undefined>, targetPage: number): string {
  const p = new URLSearchParams()
  if (params.categoria) p.set('categoria', params.categoria)
  if (params.busqueda)  p.set('busqueda', params.busqueda)
  if (params.tag)       p.set('tag', params.tag)
  if (params.featured)  p.set('featured', params.featured)
  p.set('pagina', String(targetPage))
  return `/productos?${p.toString()}`
}
