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

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      {/* Imagen */}
      <div
        className={`relative w-full overflow-hidden ${variant === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}
        style={{ backgroundColor: '#f0ece6' }}
      >
        {mainImage ? (
          <>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={`object-cover transition-all duration-700 ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center opacity-20">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}

        {/* Badge oferta */}
        {isOnSale && (
          <span
            className="absolute top-3 right-3 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full"
            style={{ backgroundColor: store.color_accent, color: '#fff' }}
          >
            SALE
          </span>
        )}

        {/* Quick add — aparece desde abajo */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center py-3.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
          style={{ backgroundColor: store.color_text }}
          onClick={handleQuickAdd}
        >
          <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: store.color_background }}>
            {added ? '✓ Agregado' : hasVariants ? 'Ver tallas' : 'Agregar'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-snug truncate" style={{ color: store.color_text }}>
            {product.name}
          </p>
          {product.tags?.[0] && (
            <p className="text-[10px] opacity-40 mt-0.5" style={{ color: store.color_text }}>
              {product.tags[0]}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-black" style={{ color: store.color_text }}>
            {formatPrice(product.price)}
          </p>
          {isOnSale && (
            <p className="text-[10px] line-through opacity-30" style={{ color: store.color_text }}>
              {formatPrice(product.compare_at_price!)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
