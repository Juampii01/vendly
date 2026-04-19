'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { useCartStore } from '@/lib/cart'
import type { Product, StoreConfig } from '@/types'

interface Props {
  product: Product
  store: StoreConfig
}

export function AthleticProductCard({ product, store }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const [imgIdx, setImgIdx] = useState(0)

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : null

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block"
      onMouseEnter={() => product.images?.length > 1 && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '3/4', backgroundColor: `${store.color_text}08` }}
      >
        {product.images?.length > 0 ? (
          <Image
            src={product.images[imgIdx] ?? product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${store.color_text}10` }}
          >
            <span className="text-xs font-bold uppercase opacity-20" style={{ color: store.color_text }}>
              Sin foto
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hasDiscount && (
            <span
              className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]"
              style={{ backgroundColor: store.color_accent, color: store.color_background }}
            >
              -{discountPct}%
            </span>
          )}
          {product.is_featured && (
            <span
              className="px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]"
              style={{ backgroundColor: store.color_primary, color: store.color_background }}
            >
              Destacado
            </span>
          )}
        </div>

        {/* Quick add CTA */}
        <button
          onClick={handleQuickAdd}
          className="absolute bottom-0 inset-x-0 py-3 text-[10px] font-black uppercase tracking-[0.15em]
            translate-y-full group-hover:translate-y-0 transition-transform duration-200"
          style={{ backgroundColor: store.color_primary, color: store.color_background }}
        >
          {added ? '✓ Agregado' : 'Agregar al carrito'}
        </button>
      </div>

      {/* Info */}
      <div className="mt-3">
        {product.category && (
          <p
            className="text-[9px] font-black uppercase tracking-[0.18em] mb-0.5 opacity-40"
            style={{ color: store.color_text }}
          >
            {product.category.name}
          </p>
        )}
        <p
          className="text-sm font-bold leading-tight"
          style={{ color: store.color_text }}
        >
          {product.name}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-black" style={{ color: store.color_text }}>
            {formatPrice(product.price, store.currency, store.locale)}
          </span>
          {hasDiscount && (
            <span className="text-xs line-through opacity-40" style={{ color: store.color_text }}>
              {formatPrice(product.compare_at_price!, store.currency, store.locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
