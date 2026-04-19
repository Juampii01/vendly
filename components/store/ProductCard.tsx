'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import type { Product, StoreConfig } from '@/types'

interface ProductCardProps {
  product: Product
  store: StoreConfig
}

export function ProductCard({ product, store }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const hasVariants = (product.variants?.length ?? 0) > 0
  const mainImage = product.images[0] ?? null
  const hoverImage = product.images[1] ?? null
  const isOnSale =
    product.compare_at_price !== null && product.compare_at_price > product.price

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (hasVariants) return
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group flex flex-col">
      {/* Imagen — flat, sin bordes, 3:4 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden" style={{ backgroundColor: `${store.color_secondary}30` }}>
        {mainImage ? (
          <>
            <Image
              src={mainImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
                hoverImage ? 'group-hover:opacity-0' : ''
              }`}
            />
            {hoverImage && (
              <Image
                src={hoverImage}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <PlaceholderIcon />
          </div>
        )}

        {/* Badge oferta */}
        {isOnSale && (
          <span
            className="absolute left-0 top-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ backgroundColor: store.color_accent }}
          >
            Sale
          </span>
        )}

        {/* CTA hover — sube desde abajo */}
        <div
          className="absolute bottom-0 left-0 w-full translate-y-full py-3 text-center text-[11px] font-bold uppercase tracking-[0.15em] transition-transform duration-300 group-hover:translate-y-0"
          style={{ backgroundColor: store.color_primary, color: store.color_background }}
          onClick={handleQuickAdd}
        >
          {added ? '¡Agregado!' : hasVariants ? 'Ver opciones' : 'Agregar al carrito'}
        </div>
      </div>

      {/* Info — minimal */}
      <div className="pt-3">
        <p
          className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-40"
          style={{ color: store.color_text }}
        >
          {product.tags?.[0] ?? 'Producto'}
        </p>
        <p
          className="mb-2 text-sm font-bold leading-snug"
          style={{ color: store.color_text }}
        >
          {product.name}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-black" style={{ color: store.color_text }}>
            {formatPrice(product.price)}
          </span>
          {isOnSale && (
            <span className="text-xs line-through opacity-30">
              {formatPrice(product.compare_at_price!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function PlaceholderIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="opacity-20"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}
