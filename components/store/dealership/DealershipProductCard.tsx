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
  const [added, setAdded] = useState(false)
  const GOLD = store.color_accent

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const img = product.images?.[0]

  // Extraer specs de los tags: año (4 dígitos), km, combustible, transmisión
  const yearTag    = product.tags?.find(t => /^\d{4}$/.test(t))
  const kmTag      = product.tags?.find(t => /km/i.test(t))
  const fuelTag    = product.tags?.find(t => /nafta|diesel|híbrido|eléctrico|gnc/i.test(t))
  const transTag   = product.tags?.find(t => /manual|automático|cvt/i.test(t))
  const isNew      = product.tags?.some(t => /0\s*km|nuevo/i.test(t))
  const isFeatured = product.is_featured

  function handleConsult(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <Link href={`/productos/${product.slug}`}
      className="group block rounded-xl overflow-hidden border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-2xl"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.07)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
      }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        {img
          ? <Image src={img} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <span className="text-5xl opacity-20">🚗</span>
            </div>
        }

        {/* Gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,10,18,0.7) 0%, transparent 60%)' }} />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm"
              style={{ backgroundColor: GOLD, color: '#0a0a0f' }}>
              0 km
            </span>
          )}
          {isFeatured && !isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm"
              style={{ backgroundColor: '#6366f1', color: '#fff' }}>
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-sm"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}>
              Oferta
            </span>
          )}
        </div>

        {/* Year bottom-left */}
        {yearTag && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-black tracking-wider" style={{ color: GOLD }}>
              {yearTag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category label */}
        {product.category?.name && (
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-black text-base leading-tight mb-3 text-white group-hover:opacity-90 transition-opacity">
          {product.name}
        </h3>

        {/* Specs row */}
        {(kmTag || fuelTag || transTag) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {[kmTag, fuelTag, transTag].filter(Boolean).map((spec, i) => (
              <span key={i}
                className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wide rounded-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          {product.price > 0
            ? <>
                <span className="text-xl font-black text-white">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm line-through" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {formatPrice(product.compare_at_price!)}
                  </span>
                )}
              </>
            : <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Consultar precio
              </span>
          }
        </div>

        {/* CTA */}
        <button
          onClick={handleConsult}
          className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 rounded-sm"
          style={{ backgroundColor: added ? '#22c55e' : GOLD, color: added ? '#fff' : '#0a0a0f' }}>
          {added ? '✓ Consulta guardada' : 'Solicitar información'}
        </button>
      </div>
    </Link>
  )
}
