'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import { useCartStore } from '@/lib/cart'
import type { Product, StoreConfig } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: false, hasWhatsappCTA: true, hasProductCatalog: true, hasUserAccount: false,
}

interface Props {
  product: Product
  store: StoreConfig
  features?: SiteFeatures
}

export function DealershipProductCard({ product, store, features = DEFAULT_FEATURES }: Props) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)
  const ACCENT = store.color_accent

  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price
  const img = product.images?.[0]

  const yearTag  = product.tags?.find(t => /^\d{4}$/.test(t))
  const kmTag    = product.tags?.find(t => /km/i.test(t))
  const fuelTag  = product.tags?.find(t => /nafta|diesel|híbrido|eléctrico|gnc/i.test(t))
  const transTag = product.tags?.find(t => /manual|automático|cvt/i.test(t))
  const isNew    = product.tags?.some(t => /0\s*km|nuevo/i.test(t))

  function handleConsult(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: '16/10' }}>
        {img
          ? <Image
              src={img}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
          : <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <span className="text-5xl opacity-20">🚗</span>
            </div>
        }

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span
              className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md text-white"
              style={{ backgroundColor: ACCENT }}
            >
              0 km
            </span>
          )}
          {product.is_featured && !isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md bg-slate-900 text-white">
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-md bg-red-500 text-white">
              Oferta
            </span>
          )}
        </div>

        {/* Year tag */}
        {yearTag && (
          <div className="absolute bottom-3 right-3">
            <span
              className="px-2 py-1 text-[10px] font-black tracking-wider rounded-md bg-white/90 backdrop-blur-sm"
              style={{ color: ACCENT }}
            >
              {yearTag}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {product.category?.name && (
          <p
            className="text-[9px] font-bold uppercase tracking-[0.3em] mb-1.5"
            style={{ color: ACCENT }}
          >
            {product.category.name}
          </p>
        )}

        <h3 className="font-black text-base leading-tight mb-3 text-slate-900 group-hover:text-slate-700 transition-colors">
          {product.name}
        </h3>

        {/* Specs */}
        {(kmTag || fuelTag || transTag) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {[kmTag, fuelTag, transTag].filter(Boolean).map((spec, i) => (
              <span
                key={i}
                className="px-2 py-1 text-[9px] font-semibold uppercase tracking-wide rounded-lg bg-slate-100 text-slate-500"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Separator */}
        <div className="h-px bg-slate-100 mb-4" />

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          {product.price > 0
            ? <>
                <span className="text-xl font-black text-slate-900">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm line-through text-slate-400">
                    {formatPrice(product.compare_at_price!)}
                  </span>
                )}
              </>
            : <span className="text-sm font-semibold text-slate-400">Consultar precio</span>
          }
        </div>

        {/* CTA */}
        {features.hasCart ? (
          <button
            onClick={handleConsult}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 rounded-xl text-white"
            style={{ backgroundColor: added ? '#22c55e' : ACCENT }}
          >
            {added ? '✓ Consulta guardada' : 'Solicitar información'}
          </button>
        ) : (
          <a
            href={store.whatsapp_number
              ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Me interesa el ${encodeURIComponent(product.name)}`
              : '#'}
            target="_blank" rel="noopener noreferrer"
            className="block w-full py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 active:scale-95 rounded-xl text-white"
            style={{ backgroundColor: ACCENT }}
          >
            Solicitar información
          </a>
        )}
      </div>
    </Link>
  )
}
