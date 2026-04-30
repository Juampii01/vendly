'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import type { Product, StoreConfig } from '@/types'

interface Props {
  product: Product
  store: StoreConfig
}

const DIET_LABELS: Record<string, { label: string; color: string }> = {
  'vegetariano': { label: 'V', color: '#5a8a3a' },
  'vegano':      { label: 'VE', color: '#4a7a2a' },
  'sin-gluten':  { label: 'SG', color: '#b8860b' },
  'mariscos':    { label: '🦞', color: '#8b3a3a' },
  'pescado':     { label: '🐟', color: '#3a6a8a' },
}

export function RestaurantMenuItem({ product, store }: Props) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const mainImage = product.images[0] ?? null
  const isOnSale  = product.compare_at_price != null && product.compare_at_price > product.price

  const dietTags = (product.tags ?? []).filter(t => DIET_LABELS[t])

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div
      className="group flex gap-4 md:gap-6 py-6 border-b transition-colors"
      style={{ borderColor: 'rgba(240,235,224,0.06)' }}
    >
      {/* ── Imagen ── */}
      {mainImage && (
        <div className="relative shrink-0 h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-sm">
          <Image
            src={mainImage}
            alt={product.name}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* ── Info ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="min-w-0">
            <h3 className="text-sm font-black uppercase tracking-[0.06em] leading-tight" style={{ color: '#f0ebe0' }}>
              {product.name}
            </h3>
            {/* Diet badges */}
            {dietTags.length > 0 && (
              <div className="flex gap-1.5 mt-1.5">
                {dietTags.map(tag => {
                  const d = DIET_LABELS[tag]
                  return (
                    <span key={tag}
                      className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded-sm"
                      style={{ backgroundColor: `${d.color}22`, color: d.color, border: `1px solid ${d.color}40` }}>
                      {d.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-black" style={{ color: '#c8902a' }}>
              {formatPrice(product.price)}
            </p>
            {isOnSale && (
              <p className="text-[10px] line-through" style={{ color: 'rgba(240,235,224,0.3)' }}>
                {formatPrice(product.compare_at_price!)}
              </p>
            )}
          </div>
        </div>

        {product.description && (
          <p className="text-xs leading-relaxed line-clamp-2 mb-3"
            style={{ color: 'rgba(240,235,224,0.45)' }}>
            {product.description}
          </p>
        )}

        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] transition-all"
          style={added
            ? { backgroundColor: 'rgba(200,144,42,0.15)', color: '#c8902a', border: '1px solid rgba(200,144,42,0.4)' }
            : { backgroundColor: 'transparent', color: 'rgba(240,235,224,0.5)', border: '1px solid rgba(240,235,224,0.12)' }
          }
        >
          {added ? '✓ Agregado al pedido' : '+ Agregar'}
        </button>
      </div>
    </div>
  )
}
