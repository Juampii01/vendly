'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { StoreConfig, Product } from '@/types'

interface Props {
  store: StoreConfig
  product: Product
  related: Product[]
}

function extractSpecs(tags: string[] = []) {
  return {
    year:         tags.find(t => /^\d{4}$/.test(t)),
    km:           tags.find(t => /\d[\d.]+\s*km/i.test(t) && !/^0/i.test(t)),
    fuel:         tags.find(t => /^(nafta|diesel|híbrido|eléctrico|gnc)$/i.test(t)),
    transmission: tags.find(t => /^(manual|automático|automática|cvt)$/i.test(t)),
    doors:        tags.find(t => /\d\s*(puertas|ptas\.?)/i.test(t)),
    color:        tags.find(t => /^color:/i.test(t))?.replace(/^color:\s*/i, ''),
    isNew:        tags.some(t => /^(0\s*km|nuevo)$/i.test(t)),
    isUsed:       tags.some(t => /^usado$/i.test(t)),
  }
}

export function DealershipVehicleDetail({ store, product, related }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const ACCENT = store.color_accent
  const specs  = extractSpecs(product.tags ?? [])
  const isOnSale = product.compare_at_price != null && product.compare_at_price > product.price
  const waNum  = store.whatsapp_number?.replace(/\D/g, '') ?? ''
  const waText = `Hola! Me interesa el ${product.name}${specs.year ? ` (${specs.year})` : ''}. ¿Me pueden dar más información y coordinar una visita?`
  const tdText = `Hola! Quiero coordinar un test drive del ${product.name}${specs.year ? ` (${specs.year})` : ''}.`
  const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}` : '#'
  const tdLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(tdText)}` : '#'

  const images = product.images?.length > 0 ? product.images : []

  return (
    <div className="bg-white text-slate-900">

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-4">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-slate-700 transition-colors">Vehículos</Link>
            {product.category && (
              <><span>/</span>
              <Link href={`/productos?categoria=${product.category.slug}`}
                className="hover:text-slate-700 transition-colors">{product.category.name}</Link></>
            )}
            <span>/</span>
            <span className="text-slate-700 font-bold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-14">

        {/* Gallery */}
        <div>
          {/* Main image */}
          <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: '16/10' }}>
            {images[activeImg]
              ? <Image src={images[activeImg]} alt={`${product.name} — foto ${activeImg + 1}`}
                  fill sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-center" priority />
              : <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="64" height="64" fill="none" stroke="#cbd5e1" strokeWidth="0.8" viewBox="0 0 24 24">
                    <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                    <rect x="9" y="11" width="14" height="10" rx="1"/>
                  </svg>
                </div>
            }

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {specs.isNew && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  style={{ backgroundColor: ACCENT }}>0 km</span>
              )}
              {specs.isUsed && !specs.isNew && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-slate-700">
                  Usado
                </span>
              )}
              {isOnSale && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-red-500 text-white">
                  Oferta
                </span>
              )}
            </div>

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 px-2.5 py-1 text-[10px] font-bold bg-black/55 text-white backdrop-blur-sm z-10">
                {activeImg + 1} / {images.length}
              </div>
            )}

            {/* Accent bottom line */}
            <div className="absolute bottom-0 left-0 w-full h-[3px]" style={{ backgroundColor: ACCENT }} />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="mt-2 grid gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(images.length, 6)}, 1fr)` }}>
              {images.slice(0, 6).map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className="relative overflow-hidden bg-slate-100 transition-all"
                  style={{
                    aspectRatio: '16/10',
                    outline: `2px solid ${activeImg === i ? ACCENT : 'transparent'}`,
                    outlineOffset: '1px',
                    opacity: activeImg === i ? 1 : 0.5,
                  }}>
                  <Image src={img} alt={`Vista ${i + 1}`} fill sizes="10vw"
                    className="object-cover hover:opacity-90 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Description + specs table below gallery on large screens */}
          {product.description && (
            <div className="hidden lg:block mt-10 pt-8" style={{ borderTop: '1px solid #f1f5f9' }}>
              <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-4" style={{ color: ACCENT }}>
                Descripción
              </p>
              <p className="text-sm leading-loose text-slate-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Info panel ───────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-6">

          {/* Category */}
          {product.category && (
            <p className="text-[9px] font-black uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
              {product.category.name}
            </p>
          )}

          {/* Name + year */}
          <div>
            <h1 className="font-black uppercase leading-[0.9] tracking-tight"
              style={{ fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)' }}>
              {product.name}
            </h1>
            {specs.year && (
              <p className="text-base font-bold mt-2" style={{ color: '#94a3b8' }}>Modelo {specs.year}</p>
            )}
          </div>

          {/* Specs grid */}
          {(specs.fuel || specs.transmission || specs.km || specs.doors) && (
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Combustible',  val: specs.fuel },
                { label: 'Transmisión',  val: specs.transmission },
                { label: 'Kilometraje',  val: specs.km },
                { label: 'Carrocería',   val: specs.doors },
              ].filter(s => s.val).map(({ label, val }) => (
                <div key={label} className="p-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e8ecf0' }}>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-1 text-slate-400">{label}</p>
                  <p className="text-sm font-bold text-slate-800 capitalize">{val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />

          {/* Price */}
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Precio</p>
            {product.price > 0
              ? <>
                  <div className="flex items-baseline gap-3">
                    <span className="font-black text-slate-900" style={{ fontSize: 'clamp(2rem, 3vw, 2.8rem)' }}>
                      {formatPrice(product.price)}
                    </span>
                    {isOnSale && (
                      <span className="text-lg line-through text-slate-300">
                        {formatPrice(product.compare_at_price!)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Financiación disponible · Hasta 60 cuotas con todos los bancos
                  </p>
                </>
              : <p className="text-xl font-black text-slate-400">Consultar precio</p>
            }
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-2.5">
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: ACCENT }}>
              <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Consultar por WhatsApp
            </a>
            <a href={tdLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-slate-800 transition-all hover:bg-slate-100 active:scale-[0.98]"
              style={{ border: '2px solid #e2e8f0' }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="1"/>
                <path d="M13 15h5M13 18h3"/>
              </svg>
              Solicitar test drive
            </a>
          </div>

          {/* Trust row */}
          <div className="pt-4" style={{ borderTop: '1px solid #f1f5f9' }}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Garantía oficial', sub: 'Hasta 3 años' },
                { label: 'Financiación',      sub: 'Todos los bancos' },
                { label: 'Entrega',           sub: 'Inmediata en stock' },
              ].map(b => (
                <div key={b.label} className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-600 leading-tight">{b.label}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Description on mobile ────────────────────────────────────────────── */}
      {product.description && (
        <div className="lg:hidden border-t border-slate-100 px-6 md:px-10 py-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-4" style={{ color: ACCENT }}>
              Descripción
            </p>
            <p className="text-sm leading-loose text-slate-600 whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Full specs table ─────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #f1f5f9' }}
        className="px-6 md:px-10 py-14">
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-6" style={{ color: ACCENT }}>
              Especificaciones
            </p>
            <div className="divide-y divide-slate-100">
              {[
                { label: 'Año',         val: specs.year },
                { label: 'Condición',   val: specs.isNew ? '0 km — Entrega inmediata' : specs.isUsed ? 'Usado certificado' : undefined },
                { label: 'Combustible', val: specs.fuel },
                { label: 'Transmisión', val: specs.transmission },
                { label: 'Kilometraje', val: specs.km },
                { label: 'Carrocería',  val: specs.doors },
                { label: 'Color',       val: specs.color },
                { label: 'Categoría',   val: product.category?.name },
              ].filter(s => s.val).map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between py-3.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                  <span className="text-sm font-bold text-slate-800 capitalize">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financing panel */}
          {product.price > 0 && (
            <div style={{ backgroundColor: '#050508' }} className="p-8 flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-4" style={{ color: ACCENT }}>
                  Financiación
                </p>
                <h3 className="text-2xl font-black uppercase text-white leading-tight mb-4">
                  Tu próximo auto<br />a tu medida
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Hasta 60 cuotas. Crédito prendario, leasing y permuta de usados.
                  Respondemos en 24hs.
                </p>
              </div>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}>
                Consultar financiación
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Related ──────────────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section style={{ backgroundColor: '#fff', borderTop: '1px solid #f1f5f9' }}
          className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: ACCENT }}>
                  Del mismo segmento
                </p>
                <h2 className="text-2xl font-black uppercase tracking-tight">También te puede interesar</h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver catálogo →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.slice(0, 3).map(p => (
                <DealershipProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// Import inside module to avoid circular dependency
import { DealershipProductCard } from './DealershipProductCard'
