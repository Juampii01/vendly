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

export function LibreriaProductCard({ product, store }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const ACCENT = store.color_accent
  const TEXT   = store.color_text
  const BG     = store.color_background

  const img = product.images?.[0]
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  const authorTag = product.tags?.find(t => t.toLowerCase().startsWith('autor:'))
  const author = authorTag ? authorTag.replace(/^autor:/i, '').trim() : null
  const isNew = product.tags?.some(t => /novedad|nuevo|reciente/i.test(t))
  const isBestseller = product.tags?.some(t => /bestseller/i.test(t))

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group flex flex-col h-full">
      {/* Book cover — 2:3 portrait ratio */}
      <div className="relative overflow-hidden rounded-sm mb-3 flex-shrink-0" style={{ aspectRatio: '2/3', backgroundColor: `${TEXT}12` }}>
        {img ? (
          <Image src={img} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4"
            style={{ background: `linear-gradient(135deg, ${ACCENT}22 0%, ${ACCENT}44 100%)`, borderLeft: `5px solid ${ACCENT}` }}>
            <span className="text-4xl mb-3">📖</span>
            <p className="text-center text-xs font-bold leading-tight px-2" style={{ color: TEXT, fontFamily: 'Georgia, serif' }}>
              {product.name}
            </p>
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isNew && <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-sm" style={{ backgroundColor: ACCENT, color: '#FAF6EF' }}>Novedad</span>}
          {isBestseller && !isNew && <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-sm" style={{ backgroundColor: '#7C5C3A', color: '#FAF6EF' }}>Bestseller</span>}
          {hasDiscount && <span className="px-2 py-0.5 text-[8px] font-black uppercase tracking-wider rounded-sm" style={{ backgroundColor: '#C0392B', color: '#fff' }}>Oferta</span>}
        </div>

        {/* Quick add on hover */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAdd} className="w-full py-2.5 text-[9px] font-black uppercase tracking-[0.18em] transition-colors"
            style={{ backgroundColor: added ? '#22c55e' : store.color_primary, color: BG }}>
            {added ? '✓ Agregado' : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {/* Book info */}
      <div className="flex flex-col flex-1">
        {product.category?.name && (
          <p className="text-[8px] font-bold uppercase tracking-[0.25em] mb-1" style={{ color: ACCENT }}>
            {product.category.name}
          </p>
        )}
        <h3 className="text-sm font-bold leading-snug mb-1 line-clamp-2 group-hover:opacity-70 transition-opacity"
          style={{ color: TEXT, fontFamily: 'Georgia, serif' }}>
          {product.name}
        </h3>
        {author && <p className="text-xs mb-2" style={{ color: `${TEXT}70` }}>{author}</p>}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          {product.price > 0 ? (
            <>
              <span className="text-sm font-black" style={{ color: TEXT }}>{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-xs line-through" style={{ color: `${TEXT}45` }}>{formatPrice(product.compare_at_price!)}</span>}
            </>
          ) : (
            <span className="text-xs font-semibold" style={{ color: `${TEXT}55` }}>Consultar precio</span>
          )}
        </div>
      </div>
    </Link>
  )
}
