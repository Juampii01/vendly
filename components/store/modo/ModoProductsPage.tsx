'use client'

import { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import { StaggerGrid, StaggerItem, FadeUp } from '@/components/store/motion'
import { ModoProductCard } from './ModoProductCard'
import type { StoreConfig, Category, Product } from '@/types'

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
  }
}

export function ModoProductsPage({
  store, categories, products, total, page, totalPages, params,
}: Props) {
  const ACCENT = store.color_accent
  const TEXT   = store.color_text

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

  const pageTitle  = activeCategory?.name ?? 'Colección'
  const pageLabel  = activeCategory
    ? `${categories.indexOf(activeCategory) + 1} / ${categories.length}`
    : 'Todo'

  function buildPageHref(targetPage: number) {
    const p = new URLSearchParams()
    if (params.categoria) p.set('categoria', params.categoria)
    if (params.busqueda)  p.set('busqueda', params.busqueda)
    p.set('pagina', String(targetPage))
    return `/productos?${p.toString()}`
  }

  return (
    <>
      {/* ── Hero de sección ───────────────────────────────────────────────────── */}
      <section className="border-b border-black/8 bg-[#fafaf8]">
        <div className="mx-auto max-w-7xl px-6 pt-14 pb-10">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.5em] text-black/30 mb-3">
                  {pageLabel}
                </p>
                <h1
                  className="font-black uppercase leading-none text-black"
                  style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '-0.04em' }}
                >
                  {pageTitle}
                </h1>
              </div>

              <div className="flex items-center gap-4 pb-1">
                <span className="text-[11px] text-black/30 font-medium">
                  {total} {total === 1 ? 'pieza' : 'piezas'}
                </span>
                {/* Buscador */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" width="12" height="12"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="search"
                    defaultValue={params.busqueda}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-48 border border-black/12 bg-white pl-9 pr-4 py-2 text-xs text-black outline-none focus:border-black/40 transition-colors placeholder:text-black/25"
                  />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>

        {/* ── Tabs de categoría ── */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center overflow-x-auto scrollbar-none -mb-px gap-1">
            <CategoryTab href="/productos" label="Todo" active={!params.categoria} accent={ACCENT} />
            {categories.map(cat => (
              <CategoryTab
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                label={cat.name}
                active={params.categoria === cat.slug}
                accent={ACCENT}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid de productos ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:py-16 bg-[#fafaf8]">
        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StaggerGrid className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <StaggerItem key={product.id}>
                  <ModoProductCard product={product} store={store} />
                </StaggerItem>
              ))}
            </StaggerGrid>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-20 flex items-center justify-center gap-8">
                {page > 1 && (
                  <Link
                    href={buildPageHref(page - 1)}
                    className="px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] border border-black/20 text-black hover:border-black transition-colors"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="text-xs text-black/25 font-medium">{page} / {totalPages}</span>
                {page < totalPages && (
                  <Link
                    href={buildPageHref(page + 1)}
                    className="px-10 py-3.5 text-[10px] font-black uppercase tracking-[0.25em] bg-black text-white hover:opacity-80 transition-opacity"
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryTab({ href, label, active, accent }: {
  href: string; label: string; active: boolean; accent: string
}) {
  return (
    <Link
      href={href}
      className="shrink-0 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap"
      style={active
        ? { borderColor: '#0a0a0a', color: '#0a0a0a' }
        : { borderColor: 'transparent', color: 'rgba(10,10,10,0.35)' }}
    >
      {label}
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="py-32 text-center">
      <div className="inline-flex items-center gap-2 mb-8 opacity-20">
        <div className="w-8 h-px bg-black" />
        <span className="text-[9px] font-bold uppercase tracking-[0.5em]">Sin resultados</span>
        <div className="w-8 h-px bg-black" />
      </div>
      <h3 className="text-3xl font-black uppercase tracking-tight text-black mb-8">
        No hay piezas aquí todavía
      </h3>
      <Link
        href="/productos"
        className="inline-block px-10 py-4 text-[10px] font-black uppercase tracking-[0.25em] bg-black text-white hover:opacity-80 transition-opacity"
      >
        Ver toda la colección
      </Link>
    </div>
  )
}
