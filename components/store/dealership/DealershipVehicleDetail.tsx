'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { useCartStore } from '@/lib/cart'
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
    isNew:        tags.some(t => /^0\s*km$/i.test(t) || /^nuevo$/i.test(t)),
    isUsed:       tags.some(t => /^usado$/i.test(t)),
    isFeatured:   false,
  }
}

const FUEL_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M3 22V8l4-6h10l4 6v14"/><path d="M3 12h18"/>
    <path d="M9 22v-6h6v6"/>
  </svg>
)
const GEAR_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41M12 2v2M12 20v2M2 12h2M20 12h2"/>
  </svg>
)
const ODO_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const DOOR_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="4" y="2" width="16" height="20" rx="2"/><path d="M16 12h.01"/>
  </svg>
)
const CAL_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const WA_ICON = (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

export function DealershipVehicleDetail({ store, product, related }: Props) {
  const [activeImg, setActiveImg] = useState(0)
  const [consulted, setConsulted] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const ACCENT = store.color_accent
  const specs = extractSpecs(product.tags ?? [])
  const isOnSale = product.compare_at_price != null && product.compare_at_price > product.price

  const waNum = store.whatsapp_number?.replace(/\D/g, '') ?? ''
  const waText = `Hola! Me interesa el ${product.name}${specs.year ? ` (${specs.year})` : ''}. ¿Podría recibir más información y coordinar una visita?`
  const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}` : '#'
  const tdText = `Hola! Quiero coordinar un test drive del ${product.name}${specs.year ? ` (${specs.year})` : ''}.`
  const tdLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(tdText)}` : '#'

  function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product, null, 1)
    setConsulted(true)
    setTimeout(() => setConsulted(false), 3000)
  }

  const allImages = product.images?.length > 0 ? product.images : []

  return (
    <div className="bg-white text-slate-900">

      {/* ── Breadcrumb ────────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-4">
          <nav className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]"
            style={{ color: '#94a3b8' }}>
            <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="hover:text-slate-700 transition-colors">Vehículos</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link href={`/productos?categoria=${product.category.slug}`}
                  className="hover:text-slate-700 transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-700 font-bold">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        {/* Gallery */}
        <div>
          {/* Main image */}
          <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: '16/10' }}>
            {allImages[activeImg]
              ? <Image src={allImages[activeImg]} alt={`${product.name} — foto ${activeImg + 1}`}
                  fill sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-opacity duration-300" priority />
              : <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-[0.06]">🚗</span>
                </div>
            }

            {/* Condition badge */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {specs.isNew && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white"
                  style={{ backgroundColor: ACCENT }}>0 km</span>
              )}
              {specs.isUsed && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-700 text-white">
                  Usado
                </span>
              )}
              {product.is_featured && !specs.isNew && !specs.isUsed && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white">
                  Destacado
                </span>
              )}
              {isOnSale && (
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] bg-red-500 text-white">
                  Oferta
                </span>
              )}
            </div>

            {/* Image counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 right-4 px-2.5 py-1 text-[10px] font-bold bg-black/50 text-white backdrop-blur-sm">
                {activeImg + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="mt-2 grid gap-2"
              style={{ gridTemplateColumns: `repeat(${Math.min(allImages.length, 5)}, 1fr)` }}>
              {allImages.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className="relative overflow-hidden transition-all"
                  style={{
                    aspectRatio: '16/10',
                    outline: activeImg === i ? `2px solid ${ACCENT}` : '2px solid transparent',
                    outlineOffset: '1px',
                    opacity: activeImg === i ? 1 : 0.55,
                  }}
                >
                  <Image src={img} alt={`Vista ${i + 1}`} fill sizes="10vw"
                    className="object-cover hover:opacity-90 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Vehicle Info ──────────────────────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 lg:self-start">

          {/* Category label */}
          {product.category && (
            <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-3" style={{ color: ACCENT }}>
              {product.category.name}
            </p>
          )}

          {/* Name + year */}
          <h1 className="font-black uppercase leading-[0.92] tracking-tight mb-3"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            {product.name}
          </h1>
          {specs.year && (
            <p className="text-base font-bold mb-6" style={{ color: '#94a3b8' }}>Modelo {specs.year}</p>
          )}

          {/* Quick specs */}
          {(specs.fuel || specs.transmission || specs.km || specs.doors) && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: CAL_ICON, label: 'Año', val: specs.year },
                { icon: FUEL_ICON, label: 'Combustible', val: specs.fuel },
                { icon: GEAR_ICON, label: 'Transmisión', val: specs.transmission },
                { icon: ODO_ICON, label: 'Kilometraje', val: specs.km },
                { icon: DOOR_ICON, label: 'Carrocería', val: specs.doors },
              ].filter(s => s.val).map(({ icon, label, val }) => (
                <div key={label} className="flex items-start gap-3 p-3 border border-slate-100 bg-slate-50">
                  <span className="mt-0.5 text-slate-400 shrink-0">{icon}</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
                    <p className="text-sm font-bold text-slate-800 capitalize">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-5" />

          {/* Price */}
          <div className="mb-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1.5">Precio</p>
            {product.price > 0
              ? <div className="flex items-baseline gap-3">
                  <span className="font-black text-slate-900" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
                    {formatPrice(product.price)}
                  </span>
                  {isOnSale && (
                    <span className="text-lg line-through text-slate-300">
                      {formatPrice(product.compare_at_price!)}
                    </span>
                  )}
                </div>
              : <p className="text-xl font-black text-slate-400">Consultar precio</p>
            }
          </div>
          {product.price > 0 && (
            <p className="text-xs text-slate-400 mb-7">
              Financiación disponible · Hasta 60 cuotas con todos los bancos
            </p>
          )}

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-7">
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: ACCENT }}>
              {WA_ICON}
              Consultar por WhatsApp
            </a>
            <a href={tdLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 border-2 border-slate-200 transition-all hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98]">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="1"/>
                <path d="M13 14h5M13 18h5"/>
              </svg>
              Solicitar test drive
            </a>
            <button
              onClick={handleSave}
              className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-[0.15em] transition-all"
              style={{ color: consulted ? '#22c55e' : ACCENT }}
            >
              {consulted ? '✓ Guardado en consultas' : '+ Guardar en mis consultas'}
            </button>
          </div>

          {/* Trust row */}
          <div className="pt-5 border-t border-slate-100 grid grid-cols-3 gap-4">
            {[
              { label: 'Garantía oficial', sub: 'Hasta 3 años' },
              { label: 'Financiación', sub: 'Todos los bancos' },
              { label: 'Entrega', sub: 'Inmediata en stock' },
            ].map(b => (
              <div key={b.label} className="text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-700 leading-tight">{b.label}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Description + specs table ─────────────────────────────────────────── */}
      {(product.description || product.tags?.length) && (
        <section className="border-t border-slate-100 px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12">

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-5" style={{ color: ACCENT }}>
                  Descripción del vehículo
                </p>
                <p className="text-sm leading-loose text-slate-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Full specs table */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-5" style={{ color: ACCENT }}>
                Especificaciones técnicas
              </p>
              <div className="divide-y divide-slate-100">
                {[
                  { label: 'Año', val: specs.year },
                  { label: 'Condición', val: specs.isNew ? '0 km — Entrega inmediata' : specs.isUsed ? 'Usado certificado' : undefined },
                  { label: 'Combustible', val: specs.fuel },
                  { label: 'Transmisión', val: specs.transmission },
                  { label: 'Kilometraje', val: specs.km },
                  { label: 'Carrocería', val: specs.doors },
                  { label: 'Color', val: specs.color },
                  { label: 'Categoría', val: product.category?.name },
                ].filter(s => s.val).map(({ label, val }) => (
                  <div key={label} className="flex items-center justify-between py-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</span>
                    <span className="text-sm font-bold text-slate-800 capitalize">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Financing section ─────────────────────────────────────────────────── */}
      {product.price > 0 && (
        <section style={{ backgroundColor: '#060810' }} className="px-6 md:px-10 py-14">
          <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-4" style={{ color: ACCENT }}>
                Financiación
              </p>
              <h2 className="font-black uppercase leading-[0.9] text-white mb-4"
                style={{ fontSize: 'clamp(1.6rem, 3vw, 2.5rem)' }}>
                Tu próximo auto<br />a tu medida
              </h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Trabajamos con todos los bancos y financieras del país.
                Crédito prendario, leasing y permuta de usados.
                Simulá tu cuota sin compromiso.
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}>
                Consultar financiación
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { n: '60', u: 'cuotas', d: 'Máximo de cuotas disponibles' },
                { n: '100%', u: 'online', d: 'Gestión sin ir al banco' },
                { n: '24hs', u: 'aprobación', d: 'Respuesta rápida garantizada' },
                { n: '0%', u: 'anticipo', d: 'En modelos seleccionados' },
              ].map(({ n, u, d }) => (
                <div key={u} className="p-5 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                  <p className="font-black text-white" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', letterSpacing: '-0.02em' }}>
                    {n}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: ACCENT }}>
                    {u}
                  </p>
                  <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Related vehicles ──────────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-slate-100 bg-slate-50 px-6 md:px-10 py-14">
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
                <RelatedCard key={p.id} product={p} accent={ACCENT} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

// ─── Related card ─────────────────────────────────────────────────────────────
function RelatedCard({ product, accent }: { product: Product; accent: string }) {
  const img = product.images?.[0]
  const yearTag = product.tags?.find(t => /^\d{4}$/.test(t))
  const isNew = product.tags?.some(t => /^0\s*km$/i.test(t) || /^nuevo$/i.test(t))

  return (
    <Link href={`/productos/${product.slug}`}
      className="group block bg-white border border-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative overflow-hidden bg-slate-100" style={{ aspectRatio: '16/10' }}>
        {img
          ? <Image src={img} alt={product.name} fill sizes="33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-103" />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-10">🚗</span>
            </div>
        }
        {isNew && (
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white"
            style={{ backgroundColor: accent }}>0 km</span>
        )}
      </div>
      <div className="p-4">
        {product.category?.name && (
          <p className="text-[8px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: accent }}>
            {product.category.name}
          </p>
        )}
        <h3 className="font-black text-sm leading-tight text-slate-800 mb-1">{product.name}</h3>
        {yearTag && <p className="text-[10px] text-slate-400 mb-3">Modelo {yearTag}</p>}
        <p className="text-base font-black text-slate-900">
          {product.price > 0 ? formatPrice(product.price) : 'Consultar precio'}
        </p>
      </div>
    </Link>
  )
}
