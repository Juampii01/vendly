'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/format'
import type { Product, StoreConfig } from '@/types'

interface Props {
  product: Product
  store: StoreConfig
  priority?: boolean
}

const WA = (
  <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function DealershipProductCard({ product, store, priority = false }: Props) {
  const ACCENT = store.color_accent
  const img    = product.images?.[0]
  const waNum  = store.whatsapp_number?.replace(/\D/g, '') ?? ''
  const waLink = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola! Me interesa el ${product.name}. ¿Me pueden dar más información?`)}`
    : '#'

  const hasDiscount = product.compare_at_price != null && product.compare_at_price > product.price
  const yearTag  = product.tags?.find(t => /^\d{4}$/.test(t))
  const kmTag    = product.tags?.find(t => /\d[\d.]+\s*km/i.test(t) && !/^0/i.test(t))
  const fuelTag  = product.tags?.find(t => /^(nafta|diesel|híbrido|eléctrico|gnc)$/i.test(t))
  const transTag = product.tags?.find(t => /^(manual|automático|automática|cvt)$/i.test(t))
  const isNew    = product.tags?.some(t => /^(0\s*km|nuevo)$/i.test(t))
  const isUsed   = product.tags?.some(t => /^usado$/i.test(t))

  return (
    <div className="group flex flex-col bg-white" style={{ border: '1px solid #e8ecf0' }}>

      {/* ── Image ──────────────────────────────────────────────────────────── */}
      <Link href={`/productos/${product.slug}`} className="block relative overflow-hidden bg-slate-100"
        style={{ aspectRatio: '16/10' }}>
        {img
          ? <Image src={img} alt={product.name} fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              priority={priority}
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]" />
          : <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
              <svg width="48" height="48" fill="none" stroke="#cbd5e1" strokeWidth="1" viewBox="0 0 24 24">
                <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="1"/>
              </svg>
            </div>
        }

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white"
              style={{ backgroundColor: ACCENT }}>0 km</span>
          )}
          {isUsed && !isNew && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white"
              style={{ backgroundColor: '#334155' }}>Usado</span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] bg-red-500 text-white">
              Oferta
            </span>
          )}
        </div>

        {/* Year pill bottom-right */}
        {yearTag && (
          <div className="absolute bottom-3 right-3 z-10">
            <span className="px-2.5 py-1 text-[10px] font-black bg-black/60 backdrop-blur-sm text-white">
              {yearTag}
            </span>
          </div>
        )}

        {/* Accent bottom line on hover */}
        <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 z-10"
          style={{ backgroundColor: ACCENT }} />
      </Link>

      {/* ── Info ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-5">

        {/* Category + name */}
        <div className="mb-4">
          {product.category?.name && (
            <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-1.5" style={{ color: ACCENT }}>
              {product.category.name}
            </p>
          )}
          <Link href={`/productos/${product.slug}`}>
            <h3 className="font-black text-[0.95rem] leading-snug text-slate-900 group-hover:text-slate-600 transition-colors">
              {product.name}
              {yearTag ? ` ${yearTag}` : ''}
              {kmTag ? ` — ${kmTag}` : ''}
            </h3>
          </Link>
        </div>

        {/* Specs */}
        {(fuelTag || transTag) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {fuelTag && (
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-500"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 22V8l4-6h10l4 6v14"/><path d="M3 12h18"/>
                </svg>
                {fuelTag}
              </span>
            )}
            {transTag && (
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-500"
                style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M17.66 6.34l-1.41 1.41M4.93 19.07l1.41-1.41"/>
                </svg>
                {transTag}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price + CTA */}
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
          <div className="flex items-baseline justify-between gap-2 mb-3">
            <div>
              {product.price > 0
                ? <>
                    <p className="text-xl font-black text-slate-900 leading-none">
                      {formatPrice(product.price)}
                    </p>
                    {hasDiscount && (
                      <p className="text-xs line-through text-slate-400 mt-0.5">
                        {formatPrice(product.compare_at_price!)}
                      </p>
                    )}
                  </>
                : <p className="text-base font-bold text-slate-400">Consultar precio</p>
              }
            </div>
            {product.price > 0 && (
              <p className="text-[9px] text-slate-400 text-right leading-tight shrink-0">
                Financiación<br />disponible
              </p>
            )}
          </div>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: ACCENT }}
          >
            {WA}
            Consultar
          </a>
        </div>
      </div>
    </div>
  )
}
