'use client'

import { useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
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

export function GymCatalogPage({ store, categories, products, total, page, totalPages, params }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const ACCENT = store.color_accent

  const handleSearch = useDebouncedCallback((val: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (val) { p.set('busqueda', val) } else { p.delete('busqueda') }
    p.delete('pagina')
    startTransition(() => { router.push(`${pathname}?${p.toString()}`) })
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

  return (
    <div style={{ backgroundColor: '#080808', minHeight: '100vh', color: '#f5f5f5' }}>

      {/* ── Hero de sección ── */}
      <section className="border-b px-6 pt-16 pb-12 md:px-10"
        style={{ borderColor: 'rgba(245,245,245,0.06)', backgroundColor: '#0d0d0d' }}>
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="mb-3 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
              {activeCategory ? 'Categoría' : 'Catálogo'}
            </p>
            <h1 className="font-black uppercase leading-none tracking-tight"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 6rem)', letterSpacing: '-0.04em' }}>
              {activeCategory?.name ?? 'Todo'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[11px]" style={{ color: 'rgba(245,245,245,0.3)' }}>
              {total} {total === 1 ? 'producto' : 'productos'}
            </span>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="12" height="12"
                viewBox="0 0 24 24" fill="none" stroke="rgba(245,245,245,0.3)" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="search"
                defaultValue={params.busqueda}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-44 py-2 pl-9 pr-4 text-xs outline-none"
                style={{ backgroundColor: '#1a1a1a', border: `1px solid rgba(245,245,245,0.1)`, color: '#f5f5f5' }}
              />
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="mx-auto max-w-7xl mt-8 flex items-center overflow-x-auto scrollbar-none -mb-px gap-1">
          <CatTab href="/productos" label="Todo" active={!params.categoria} accent={ACCENT} />
          {categories.map(cat => (
            <CatTab key={cat.id} href={`/productos?categoria=${cat.slug}`}
              label={cat.name} active={params.categoria === cat.slug} accent={ACCENT} />
          ))}
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="mx-auto max-w-7xl px-6 md:px-10 py-12">
        {products.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-3xl font-black uppercase mb-4">Sin resultados</p>
            <Link href="/productos" className="inline-block px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em]"
              style={{ backgroundColor: ACCENT, color: '#fff' }}>
              Ver todo
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(product => (
                <GymProductCard key={product.id} product={product} store={store} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-8">
                {page > 1 && (
                  <Link href={buildPageHref(page - 1)}
                    className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] border transition-colors hover:border-white"
                    style={{ borderColor: 'rgba(245,245,245,0.15)', color: 'rgba(245,245,245,0.6)' }}>
                    ← Anterior
                  </Link>
                )}
                <span className="text-xs" style={{ color: 'rgba(245,245,245,0.25)' }}>
                  {page} / {totalPages}
                </span>
                {page < totalPages && (
                  <Link href={buildPageHref(page + 1)}
                    className="px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                    style={{ backgroundColor: ACCENT, color: '#fff' }}>
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

// ─── Product card ─────────────────────────────────────────────────────────────
function GymProductCard({ product, store }: { product: Product; store: StoreConfig }) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const ACCENT = store.color_accent
  const mainImage = product.images[0] ?? null
  const isOnSale  = product.compare_at_price != null && product.compare_at_price > product.price
  const isPopular = product.tags?.includes('popular')

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      {/* Imagen */}
      <div className="relative w-full aspect-square overflow-hidden mb-3" style={{ backgroundColor: '#1a1a1a' }}>
        {mainImage && (
          <Image src={mainImage} alt={product.name} fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        {/* Red accent border on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 2px ${ACCENT}` }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isPopular && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider"
              style={{ backgroundColor: ACCENT, color: '#fff' }}>
              Popular
            </span>
          )}
          {isOnSale && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider bg-white"
              style={{ color: ACCENT }}>
              Oferta
            </span>
          )}
        </div>

        {/* Quick add */}
        <div
          className="absolute inset-x-0 bottom-0 py-3 flex items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
          style={{ backgroundColor: ACCENT }}
          onClick={handleAdd}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">
            {added ? '✓ Agregado' : '+ Agregar'}
          </span>
        </div>
      </div>

      {/* Info */}
      <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1"
        style={{ color: 'rgba(245,245,245,0.3)' }}>
        {product.category?.name}
      </p>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-bold leading-tight truncate flex-1" style={{ color: '#f5f5f5' }}>
          {product.name}
        </p>
        <div className="shrink-0 text-right">
          <p className="text-sm font-black" style={{ color: ACCENT }}>
            {formatPrice(product.price)}
          </p>
          {isOnSale && (
            <p className="text-[10px] line-through" style={{ color: 'rgba(245,245,245,0.3)' }}>
              {formatPrice(product.compare_at_price!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
import { useState } from 'react'

function CatTab({ href, label, active, accent }: { href: string; label: string; active: boolean; accent: string }) {
  return (
    <Link href={href}
      className="shrink-0 px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] border-b-2 transition-all whitespace-nowrap"
      style={active
        ? { borderColor: accent, color: '#f5f5f5' }
        : { borderColor: 'transparent', color: 'rgba(245,245,245,0.35)' }
      }
    >
      {label}
    </Link>
  )
}
