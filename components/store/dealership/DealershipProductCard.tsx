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

  const hasDiscount = product.compare_at_price != null && product.compare_at_price > product.price
  const img = product.images?.[0]

  const yearTag  = product.tags?.find(t => /^\d{4}$/.test(t))
  const kmTag    = product.tags?.find(t => /\d[\d.]+\s*km/i.test(t) && !/^0/i.test(t))
  const fuelTag  = product.tags?.find(t => /^(nafta|diesel|híbrido|eléctrico|gnc)$/i.test(t))
  const transTag = product.tags?.find(t => /^(manual|automático|automática|cvt)$/i.test(t))
  const isNew    = product.tags?.some(t => /^0\s*km$/i.test(t) || /^nuevo$/i.test(t))
  const isUsed   = product.tags?.some(t => /^usado$/i.test(t))

  function handleConsult(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group block bg-white border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-200 overflow-hidden"
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: '16/10' }}>
        {img
          ? <Image src={img} alt={product.name} fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <svg className="opacity-10" width="60" height="60" fill="none" stroke="#475569"
                strokeWidth="1" viewBox="0 0 24 24">
                <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="1"/>
              </svg>
            </div>
        }

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white"
              style={{ backgroundColor: ACCENT }}>
              0 km
            </span>
          )}
          {isUsed && !isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-slate-700 text-white">
              Usado
            </span>
          )}
          {product.is_featured && !isNew && !isUsed && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white">
              Destacado
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-red-500 text-white">
              Oferta
            </span>
          )}
        </div>

        {/* Year */}
        {yearTag && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 text-[10px] font-black tracking-wide bg-white/90 backdrop-blur-sm"
              style={{ color: ACCENT }}>
              {yearTag}
            </span>
          </div>
        )}

        {/* Accent accent-line that grows on hover */}
        <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
          style={{ backgroundColor: ACCENT }} />
      </div>

      {/* ── Content ── */}
      <div className="p-5">

        {/* Category */}
        {product.category?.name && (
          <p className="text-[9px] font-black uppercase tracking-[0.35em] mb-1.5" style={{ color: ACCENT }}>
            {product.category.name}
          </p>
        )}

        {/* Name */}
        <h3 className="font-black text-[1rem] leading-snug text-slate-900 group-hover:text-slate-700 transition-colors mb-3">
          {product.name}
        </h3>

        {/* Specs pills */}
        {(fuelTag || transTag || kmTag) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {fuelTag && (
              <span className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wide bg-slate-50 border border-slate-100 text-slate-500">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 22V8l4-6h10l4 6v14"/><path d="M3 12h18"/>
                </svg>
                {fuelTag}
              </span>
            )}
            {transTag && (
              <span className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wide bg-slate-50 border border-slate-100 text-slate-500">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
                </svg>
                {transTag}
              </span>
            )}
            {kmTag && (
              <span className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-wide bg-slate-50 border border-slate-100 text-slate-500">
                {kmTag}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-4" />

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-1">
          {product.price > 0
            ? <>
                <span className="text-xl font-black text-slate-900">{formatPrice(product.price)}</span>
                {hasDiscount && (
                  <span className="text-sm line-through text-slate-300">
                    {formatPrice(product.compare_at_price!)}
                  </span>
                )}
              </>
            : <span className="text-base font-bold text-slate-400">Consultar precio</span>
          }
        </div>

        {/* Financing hint */}
        {product.price > 0 && (
          <p className="text-[9px] text-slate-400 mb-4">Financiación disponible</p>
        )}

        {/* CTA */}
        {features.hasCart ? (
          <button
            onClick={handleConsult}
            className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all active:scale-95"
            style={{ backgroundColor: added ? '#22c55e' : ACCENT }}
          >
            {added ? '✓ Guardado en consultas' : 'Solicitar información'}
          </button>
        ) : (
          <a
            href={store.whatsapp_number
              ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola! Me interesa el ${product.name}`)}`
              : '#'}
            target="_blank" rel="noopener noreferrer"
            className="block w-full py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: ACCENT }}
          >
            Consultar por WhatsApp
          </a>
        )}
      </div>
    </Link>
  )
}
