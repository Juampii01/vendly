'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import { ModoHeader } from './ModoHeader'
import { ModoFooter } from './ModoFooter'
import { ModoProductCard } from './ModoProductCard'
import { StaggerGrid, StaggerItem, FadeUp } from '@/components/store/motion'
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
  const TEXT = store.color_text
  const BG = store.color_background

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [sortOpen, setSortOpen] = useState(false)

  const handleSearch = useDebouncedCallback((value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) { p.set('busqueda', value) } else { p.delete('busqueda') }
    p.delete('pagina')
    startTransition(() => { router.push(`${pathname}?${p.toString()}`) })
  }, 300)

  const activeCategory = params.categoria
    ? categories.find(c => c.slug === params.categoria) ?? null
    : null

  const pageTitle = activeCategory?.name ?? 'Colección'
  const pageLabel = activeCategory
    ? `${categories.indexOf(activeCategory) + 1} / ${categories.length}`
    : 'Todo'

  function buildHref(slug?: string) {
    return slug ? `/productos?categoria=${slug}` : '/productos'
  }

  function buildPageHref(targetPage: number) {
    const p = new URLSearchParams()
    if (params.categoria) p.set('categoria', params.categoria)
    if (params.busqueda) p.set('busqueda', params.busqueda)
    p.set('pagina', String(targetPage))
    return `/productos?${p.toString()}`
  }

  return (
    <div style={{ backgroundColor: BG, color: TEXT, minHeight: '100vh' }}>
      <ModoHeader store={store} categories={categories} />

      {/* ── Hero editorial de sección ─────────────────────────────────────────── */}
      <section className="border-b" style={{ borderColor: `${TEXT}15` }}>
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              {/* Título */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-3 opacity-40">
                  {pageLabel}
                </p>
                <h1
                  className="font-black uppercase leading-none"
                  style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}
                >
                  {pageTitle}
                </h1>
              </div>
              {/* Contador + buscador */}
              <div className="flex flex-col gap-3 md:items-end">
                <p className="text-xs opacity-30 font-medium">
                  {total} {total === 1 ? 'pieza' : 'piezas'}
                </p>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" width="13" height="13"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="search"
                    defaultValue={params.busqueda}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-56 bg-transparent border pl-9 pr-4 py-2 text-xs outline-none transition-colors"
                    style={{ borderColor: `${TEXT}20`, color: TEXT }}
                  />
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Filtros de categoría ── */}
      <div className="sticky top-[97px] z-30 border-b backdrop-blur-md" style={{ borderColor: `${TEXT}10`, backgroundColor: `${BG}ee` }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none">
            {/* Todas */}
            <Link
              href="/productos"
              className="shrink-0 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all"
              style={!params.categoria
                ? { borderColor: TEXT, color: TEXT }
                : { borderColor: 'transparent', color: `${TEXT}50` }}
            >
              Todo
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={buildHref(cat.slug)}
                className="shrink-0 px-5 py-4 text-[11px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all"
                style={params.categoria === cat.slug
                  ? { borderColor: TEXT, color: TEXT }
                  : { borderColor: 'transparent', color: `${TEXT}50` }}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid de productos ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        {products.length === 0 ? (
          <EmptyState accent={ACCENT} text={TEXT} />
        ) : (
          <>
            <StaggerGrid className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <StaggerItem key={product.id}>
                  <ModoProductCard product={product} store={store} />
                </StaggerItem>
              ))}
            </StaggerGrid>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-6">
                {page > 1 && (
                  <Link
                    href={buildPageHref(page - 1)}
                    className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border transition-opacity hover:opacity-70"
                    style={{ borderColor: TEXT, color: TEXT }}
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="text-xs opacity-30 font-medium">{page} / {totalPages}</span>
                {page < totalPages && (
                  <Link
                    href={buildPageHref(page + 1)}
                    className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: TEXT }}
                  >
                    Siguiente →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>

      <ModoFooter store={store} categories={categories} />
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ accent, text }: { accent: string; text: string }) {
  return (
    <div className="py-32 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 opacity-30">Sin resultados</p>
      <h3 className="text-2xl font-black uppercase tracking-tight mb-6">
        No hay piezas aquí todavía
      </h3>
      <Link
        href="/productos"
        className="inline-block px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: text }}
      >
        Ver toda la colección
      </Link>
    </div>
  )
}
