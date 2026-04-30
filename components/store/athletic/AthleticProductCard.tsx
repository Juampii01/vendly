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
  priority?: boolean
}

export function AthleticProductCard({ product, store, priority = false }: Props) {
  const addItem  = useCartStore((s) => s.addItem)
  const [added, setAdded]   = useState(false)
  const [hover, setHover]   = useState(false)

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compare_at_price!) * 100)
    : null

  const img0 = product.images?.[0]
  const img1 = product.images?.[1]

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group block"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>

      {/* ── Image container ──────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>

        {/* Primary image */}
        {img0 ? (
          <Image src={img0} alt={product.name} fill priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center transition-opacity duration-500"
            style={{ opacity: hover && img1 ? 0 : 1 }} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${store.color_text}08` }}>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-20"
              style={{ color: store.color_text }}>Sin imagen</span>
          </div>
        )}

        {/* Secondary image — crossfade */}
        {img1 && (
          <Image src={img1} alt={product.name} fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="absolute inset-0 object-cover object-center transition-opacity duration-500"
            style={{ opacity: hover ? 1 : 0 }} />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em]"
              style={{ backgroundColor: store.color_accent, color: store.color_background }}>
              -{discountPct}%
            </span>
          )}
          {product.is_featured && !hasDiscount && (
            <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em]"
              style={{ backgroundColor: store.color_primary, color: store.color_background }}>
              New
            </span>
          )}
        </div>

        {/* Quick add — slide from bottom */}
        <div className="absolute bottom-0 inset-x-0 z-10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button onClick={handleQuickAdd}
            className="w-full py-3.5 text-[9px] font-black uppercase tracking-[0.2em] transition-opacity"
            style={{ backgroundColor: store.color_primary, color: store.color_background }}>
            {added ? '✓ Agregado' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {/* ── Info ─────────────────────────────────────────────────────────── */}
      <div className="mt-3 px-0.5">
        {product.category && (
          <p className="text-[8px] font-bold uppercase tracking-[0.22em] mb-1 opacity-35"
            style={{ color: store.color_text }}>
            {product.category.name}
          </p>
        )}
        <p className="text-[13px] font-medium leading-snug"
          style={{ color: store.color_text }}>
          {product.name}
        </p>
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="text-[13px] font-bold"
            style={{ color: store.color_text }}>
            {formatPrice(product.price, store.currency, store.locale)}
          </span>
          {hasDiscount && (
            <span className="text-[12px] line-through opacity-35"
              style={{ color: store.color_text }}>
              {formatPrice(product.compare_at_price!, store.currency, store.locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
