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

export function DealershipProductCard({ product, store }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [inquired, setInquired] = useState(false)

  const GOLD = store.color_accent
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price

  // Extraer año y km de los tags si existen (ej: "2023", "45.000 km")
  const yearTag = product.tags?.find(t => /^\d{4}$/.test(t))
  const kmTag = product.tags?.find(t => /km/i.test(t))

  function handleInquiry(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setInquired(true)
    setTimeout(() => setInquired(false), 2000)
  }

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      {/* Imagen — ratio apaisado para autos */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '16/10', backgroundColor: `${store.color_text}08` }}
      >
        {product.images?.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: `${store.color_text}08` }}>
            <svg className="w-16 h-16 opacity-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24"
              style={{ color: store.color_text }}>
              <path d="M19 17H5a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2z"/>
              <circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/>
            </svg>
          </div>
        )}

        {/* Gold line accent top */}
        <div className="absolute inset-x-0 top-0 h-0.5 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: GOLD }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_featured && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em]"
              style={{ backgroundColor: GOLD, color: store.color_primary }}>
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] bg-red-600 text-white">
              Oferta
            </span>
          )}
        </div>

        {/* Hover overlay — Consultar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          <button
            onClick={handleInquiry}
            className="w-full py-3.5 text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ backgroundColor: store.color_primary, color: GOLD }}
          >
            {inquired ? '✓ Agregado a consultas' : 'Consultar precio'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 px-1">
        {/* Año + km */}
        {(yearTag || kmTag) && (
          <div className="flex items-center gap-3 mb-1.5">
            {yearTag && (
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40"
                style={{ color: store.color_text }}>
                {yearTag}
              </span>
            )}
            {yearTag && kmTag && <span className="opacity-20 text-[10px]" style={{ color: store.color_text }}>·</span>}
            {kmTag && (
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-40"
                style={{ color: store.color_text }}>
                {kmTag}
              </span>
            )}
          </div>
        )}

        {/* Nombre del modelo */}
        <p className="text-base font-black uppercase tracking-[-0.01em] leading-tight"
          style={{ color: store.color_text }}>
          {product.name}
        </p>

        {/* Categoría */}
        {product.category && (
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] opacity-40"
            style={{ color: store.color_text }}>
            {product.category.name}
          </p>
        )}

        {/* Precio */}
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-lg font-black" style={{ color: store.color_text }}>
            {formatPrice(product.price, store.currency, store.locale)}
          </span>
          {hasDiscount && (
            <span className="text-sm line-through opacity-30" style={{ color: store.color_text }}>
              {formatPrice(product.compare_at_price!, store.currency, store.locale)}
            </span>
          )}
        </div>

        {/* Gold separator */}
        <div className="mt-3 h-px w-8 transition-all duration-300 group-hover:w-full"
          style={{ backgroundColor: GOLD, opacity: 0.4 }} />
      </div>
    </Link>
  )
}
