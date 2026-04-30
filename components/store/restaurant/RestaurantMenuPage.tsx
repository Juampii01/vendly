'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { RestaurantMenuItem } from './RestaurantMenuItem'
import type { StoreConfig, Category, Product } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
  products: Product[]
  total: number
  page: number
  totalPages: number
  params: { categoria?: string; busqueda?: string; pagina?: string }
}

export function RestaurantMenuPage({ store, categories, products, total, page, totalPages, params }: Props) {
  const router      = useRouter()
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const [sidebarFixed, setSidebarFixed] = useState(false)
  const sidebarRef  = useRef<HTMLDivElement>(null)

  // Sticky sidebar detection
  useEffect(() => {
    const onScroll = () => setSidebarFixed(window.scrollY > 180)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = useDebouncedCallback((value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) { p.set('busqueda', value) } else { p.delete('busqueda') }
    p.delete('pagina')
    router.push(`${pathname}?${p.toString()}`)
  }, 300)

  const activeCategory = params.categoria
    ? categories.find(c => c.slug === params.categoria) ?? null
    : null

  function buildPageHref(targetPage: number) {
    const p = new URLSearchParams()
    if (params.categoria) p.set('categoria', params.categoria)
    if (params.busqueda)  p.set('busqueda', params.busqueda)
    p.set('pagina', String(targetPage))
    return `/productos?${p.toString()}`
  }

  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quisiera hacer una reserva.`
    : null

  return (
    <div style={{ backgroundColor: '#0e0b06', minHeight: '100vh' }}>

      {/* ── Hero del menú ── */}
      <section
        className="px-6 pt-16 pb-12 md:pt-20 md:pb-16 text-center"
        style={{ borderBottom: '1px solid rgba(200,144,42,0.1)', backgroundColor: '#0a0704' }}
      >
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.6em]" style={{ color: 'rgba(200,144,42,0.6)' }}>
          {activeCategory ? `${categories.indexOf(activeCategory) + 1} de ${categories.length}` : 'Carta completa'}
        </p>
        <h1
          className="mb-4 font-black uppercase leading-none tracking-tight"
          style={{ color: '#f0ebe0', fontSize: 'clamp(3rem, 10vw, 8rem)', letterSpacing: '-0.04em' }}
        >
          {activeCategory?.name ?? 'El menú'}
        </h1>
        <p className="text-xs" style={{ color: 'rgba(240,235,224,0.3)' }}>
          {total} {total === 1 ? 'plato' : 'platos'}
        </p>
      </section>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 md:py-14">
        <div className="flex gap-10 lg:gap-16">

          {/* ── Sidebar de categorías (sticky) ── */}
          <aside
            ref={sidebarRef}
            className="hidden md:block w-52 shrink-0"
          >
            <div className="sticky top-24 space-y-1">
              <p className="mb-4 text-[9px] font-black uppercase tracking-[0.4em]"
                style={{ color: 'rgba(200,144,42,0.5)' }}>
                Secciones
              </p>

              <SideLink href="/productos" label="Todo el menú" active={!params.categoria} />
              {categories.map(cat => (
                <SideLink
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  label={cat.name}
                  active={params.categoria === cat.slug}
                />
              ))}

              {/* Separador */}
              <div className="pt-6 mt-6 border-t" style={{ borderColor: 'rgba(200,144,42,0.1)' }}>
                <p className="mb-3 text-[9px] font-black uppercase tracking-[0.4em]"
                  style={{ color: 'rgba(200,144,42,0.4)' }}>
                  Búsqueda
                </p>
                <div className="relative">
                  <input
                    type="search"
                    defaultValue={params.busqueda}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Buscar plato..."
                    className="w-full py-2 px-3 text-xs outline-none"
                    style={{
                      backgroundColor: '#1a1208',
                      border: '1px solid rgba(200,144,42,0.15)',
                      color: '#f0ebe0',
                    }}
                  />
                </div>
              </div>

              {/* CTA Reserva */}
              {wa && (
                <div className="pt-6">
                  <a href={wa} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                    style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}>
                    Reservar mesa
                  </a>
                </div>
              )}

              {/* Leyenda */}
              <div className="pt-8 space-y-2">
                {[
                  { badge: 'V', label: 'Vegetariano', color: '#5a8a3a' },
                  { badge: 'VE', label: 'Vegano', color: '#4a7a2a' },
                  { badge: 'SG', label: 'Sin gluten', color: '#b8860b' },
                ].map(item => (
                  <div key={item.badge} className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 text-[8px] font-black rounded-sm"
                      style={{ backgroundColor: `${item.color}22`, color: item.color, border: `1px solid ${item.color}40` }}>
                      {item.badge}
                    </span>
                    <span className="text-[10px]" style={{ color: 'rgba(240,235,224,0.3)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Lista de platos ── */}
          <main className="flex-1 min-w-0">
            {/* Mobile: scroll horizontal de categorías */}
            <div className="flex md:hidden overflow-x-auto gap-2 pb-4 mb-6 scrollbar-none">
              <MobileCatTab href="/productos" label="Todo" active={!params.categoria} />
              {categories.map(cat => (
                <MobileCatTab
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  label={cat.name}
                  active={params.categoria === cat.slug}
                />
              ))}
            </div>

            {/* Mobile: buscador */}
            <div className="md:hidden mb-6">
              <input
                type="search"
                defaultValue={params.busqueda}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full py-2.5 px-4 text-sm outline-none"
                style={{ backgroundColor: '#1a1208', border: '1px solid rgba(200,144,42,0.15)', color: '#f0ebe0' }}
              />
            </div>

            {products.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div>
                  {products.map(product => (
                    <RestaurantMenuItem key={product.id} product={product} store={store} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-8">
                    {page > 1 && (
                      <Link href={buildPageHref(page - 1)}
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border transition-colors hover:border-[#c8902a] hover:text-[#c8902a]"
                        style={{ borderColor: 'rgba(240,235,224,0.15)', color: 'rgba(240,235,224,0.6)' }}>
                        ← Anterior
                      </Link>
                    )}
                    <span className="text-xs" style={{ color: 'rgba(240,235,224,0.25)' }}>
                      {page} / {totalPages}
                    </span>
                    {page < totalPages && (
                      <Link href={buildPageHref(page + 1)}
                        className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}>
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SideLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href}
      className="flex items-center justify-between w-full px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all"
      style={active
        ? { backgroundColor: 'rgba(200,144,42,0.12)', color: '#c8902a', borderLeft: '2px solid #c8902a' }
        : { color: 'rgba(240,235,224,0.4)', borderLeft: '2px solid transparent' }
      }
    >
      {label}
    </Link>
  )
}

function MobileCatTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href}
      className="shrink-0 px-5 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all border"
      style={active
        ? { backgroundColor: '#c8902a', color: '#0e0b06', borderColor: '#c8902a' }
        : { backgroundColor: 'transparent', color: 'rgba(240,235,224,0.45)', borderColor: 'rgba(240,235,224,0.1)' }
      }
    >
      {label}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="py-32 text-center">
      <div className="inline-flex items-center gap-3 mb-8" style={{ color: 'rgba(200,144,42,0.3)' }}>
        <div className="w-8 h-px" style={{ backgroundColor: 'currentColor' }} />
        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Sin resultados</span>
        <div className="w-8 h-px" style={{ backgroundColor: 'currentColor' }} />
      </div>
      <p className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: '#f0ebe0' }}>
        No encontramos ese plato
      </p>
      <Link href="/productos"
        className="inline-block px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}>
        Ver el menú completo
      </Link>
    </div>
  )
}
