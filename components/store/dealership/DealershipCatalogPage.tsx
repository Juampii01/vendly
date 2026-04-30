'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { DealershipProductCard } from './DealershipProductCard'
import type { StoreConfig, Category, Product } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

interface Props {
  store: StoreConfig
  categories: Category[]
  products: Product[]
  total: number
  page: number
  totalPages: number
  params: { categoria?: string; busqueda?: string; pagina?: string; tag?: string }
  features?: SiteFeatures
}

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'year-desc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Relevancia' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'year-desc', label: 'Año: más nuevo' },
]

const CONDITIONS = [
  { label: 'Todos', tag: undefined },
  { label: '0 km', tag: '0km' },
  { label: 'Usados', tag: 'usado' },
]

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: false, hasWhatsappCTA: true, hasProductCatalog: true, hasUserAccount: false,
}

export function DealershipCatalogPage({
  store, categories, products, total, page, totalPages, params,
  features = DEFAULT_FEATURES,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [sort, setSort] = useState<SortKey>('default')
  const ACCENT = store.color_accent

  const handleSearch = useDebouncedCallback((val: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (val) p.set('busqueda', val); else p.delete('busqueda')
    p.delete('pagina')
    startTransition(() => { router.push(`${pathname}?${p.toString()}`) })
  }, 300)

  function buildTagHref(tag?: string) {
    const p = new URLSearchParams()
    if (params.categoria) p.set('categoria', params.categoria)
    if (params.busqueda) p.set('busqueda', params.busqueda)
    if (tag) p.set('tag', tag)
    return `/productos?${p.toString()}`
  }

  function buildPageHref(targetPage: number) {
    const p = new URLSearchParams()
    if (params.categoria) p.set('categoria', params.categoria)
    if (params.busqueda) p.set('busqueda', params.busqueda)
    if (params.tag) p.set('tag', params.tag)
    p.set('pagina', String(targetPage))
    return `/productos?${p.toString()}`
  }

  const activeCategory = params.categoria
    ? categories.find(c => c.slug === params.categoria) ?? null
    : null

  const sorted = useMemo(() => {
    const arr = [...products]
    if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price)
    else if (sort === 'year-desc') {
      arr.sort((a, b) => {
        const ya = Number(a.tags?.find(t => /^\d{4}$/.test(t)) ?? 0)
        const yb = Number(b.tags?.find(t => /^\d{4}$/.test(t)) ?? 0)
        return yb - ya
      })
    }
    return arr
  }, [products, sort])

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>

      {/* ── Catalog Hero ──────────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#060810' }} className="px-6 pt-16 pb-0 md:px-10">
        <div className="mx-auto max-w-7xl">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-[10px] uppercase tracking-[0.25em]"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span className="opacity-40">/</span>
            <span style={{ color: ACCENT }}>Vehículos</span>
            {activeCategory && (
              <>
                <span className="opacity-40">/</span>
                <span className="text-white">{activeCategory.name}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-10">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-3" style={{ color: ACCENT }}>
                {activeCategory ? 'Segmento' : 'Catálogo completo'}
              </p>
              <h1 className="font-black uppercase leading-none text-white"
                style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', letterSpacing: '-0.03em' }}>
                {activeCategory?.name ?? 'Todos los modelos'}
              </h1>
              <p className="mt-3 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {total} {total === 1 ? 'vehículo disponible' : 'vehículos disponibles'}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80 shrink-0">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                defaultValue={params.busqueda}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar modelo, motor, año..."
                className="w-full py-3.5 pl-11 pr-4 text-sm outline-none text-white placeholder:text-white/25 transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex items-end overflow-x-auto scrollbar-none border-b"
            style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <CatTab href="/productos" label="Todos" active={!params.categoria} accent={ACCENT} />
            {categories.map(cat => (
              <CatTab key={cat.id}
                href={`/productos?categoria=${cat.slug}${params.tag ? `&tag=${params.tag}` : ''}`}
                label={cat.name} active={params.categoria === cat.slug} accent={ACCENT} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Filters + sort bar ────────────────────────────────────────────────── */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 shrink-0">Condición:</span>
            {CONDITIONS.map(c => (
              <Link key={c.label} href={buildTagHref(c.tag)}
                className="shrink-0 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] transition-all"
                style={params.tag === c.tag || (!params.tag && !c.tag)
                  ? { backgroundColor: ACCENT, color: '#fff' }
                  : { backgroundColor: '#f1f5f9', color: '#64748b' }
                }>
                {c.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 hidden sm:block">Ordenar:</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="text-[10px] font-semibold text-slate-700 bg-slate-100 border-0 outline-none py-1.5 px-3 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Vehicle grid ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-10">
        {sorted.length === 0 ? (
          <div className="py-32 text-center">
            <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center border-2 border-slate-200">
              <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
            </div>
            <p className="text-2xl font-black uppercase tracking-tight text-slate-800 mb-3">Sin resultados</p>
            <p className="text-sm text-slate-400 mb-8">Probá con otros filtros o términos de búsqueda</p>
            <Link href="/productos"
              className="inline-block px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
              style={{ backgroundColor: ACCENT }}>
              Ver todos los modelos
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {sorted.map(product => (
                <DealershipProductCard key={product.id} product={product} store={store} features={features} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-6">
                {page > 1 && (
                  <Link href={buildPageHref(page - 1)}
                    className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-colors hover:border-slate-800 hover:text-slate-900 text-slate-500"
                    style={{ borderColor: '#cbd5e1' }}>
                    ← Anterior
                  </Link>
                )}
                <span className="text-sm font-bold text-slate-400">{page} / {totalPages}</span>
                {page < totalPages && (
                  <Link href={buildPageHref(page + 1)}
                    className="px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                    style={{ backgroundColor: ACCENT }}>
                    Siguiente →
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CatTab({ href, label, active, accent }: { href: string; label: string; active: boolean; accent: string }) {
  return (
    <Link href={href}
      className="shrink-0 px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap"
      style={active
        ? { borderColor: accent, color: '#ffffff' }
        : { borderColor: 'transparent', color: 'rgba(255,255,255,0.3)' }
      }>
      {label}
    </Link>
  )
}
