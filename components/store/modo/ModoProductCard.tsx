'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import type { Product, StoreConfig } from '@/types'

interface Props {
  product: Product
  store: StoreConfig
  variant?: 'portrait' | 'landscape'
}

export function ModoProductCard({ product, store, variant = 'portrait' }: Props) {
  const [added, setAdded] = useState(false)
  const [wished, setWished] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const hasVariants = (product.variants?.length ?? 0) > 0
  const mainImage = product.images[0] ?? null
  const hoverImage = product.images[1] ?? null
  const isOnSale = product.compare_at_price !== null && product.compare_at_price > product.price

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (hasVariants) return
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  function handleWish(e: React.MouseEvent) {
    e.preventDefault()
    setWished(v => !v)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      {/* ── Imagen ── */}
      <div
        className={`relative w-full overflow-hidden ${variant === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}
        style={{ backgroundColor: '#ede9e3' }}
      >
        {mainImage ? (
          <>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-700 ease-out ${
                hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-[1.04]'
              }`}
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8"
              className="opacity-20">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* ── Badges ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isOnSale && (
            <span
              className="px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.15em]"
              style={{ backgroundColor: store.color_accent, color: '#fff' }}
            >
              Sale
            </span>
          )}
          {/* "Nuevo" badge for recent products (first 30 days implied by position ordering) */}
          {!isOnSale && product.tags?.includes('nuevo') && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.15em] bg-black text-white">
              Nuevo
            </span>
          )}
        </div>

        {/* ── Wishlist heart ── */}
        <button
          onClick={handleWish}
          aria-label="Guardar"
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <HeartIcon filled={wished} />
        </button>

        {/* ── Quick add — desliza desde abajo ── */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out cursor-pointer"
          style={{ backgroundColor: store.color_text }}
          onClick={handleQuickAdd}
        >
          <span className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: store.color_background }}>
            {added ? '✓ Agregado' : hasVariants ? 'Elegir talla' : '+ Agregar'}
          </span>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="mt-3.5 space-y-0.5">
        {/* Categoría / brand */}
        {product.category?.name && (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-35" style={{ color: store.color_text }}>
            {product.category.name}
          </p>
        )}

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[11px] font-semibold leading-snug truncate flex-1" style={{ color: store.color_text }}>
            {product.name}
          </p>
          <div className="shrink-0 text-right">
            <p className="text-[11px] font-black" style={{ color: store.color_text }}>
              {formatPrice(product.price)}
            </p>
            {isOnSale && (
              <p className="text-[9px] line-through opacity-30" style={{ color: store.color_text }}>
                {formatPrice(product.compare_at_price!)}
              </p>
            )}
          </div>
        </div>

        {/* Variants count hint */}
        {hasVariants && (
          <p className="text-[9px] opacity-30" style={{ color: store.color_text }}>
            {product.variants!.length} opciones
          </p>
        )}
      </div>
    </Link>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#0a0a0a' : 'none'}
      stroke="#0a0a0a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
}
