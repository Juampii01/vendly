'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FavoritesButton } from './FavoritesButton'
import { RealEstateHeader } from './RealEstateHeader'
import { RealEstateFooter } from './RealEstateFooter'
import { RealEstateFloatingWhatsApp } from './RealEstateFloatingWhatsApp'
import { FavoritesSidebar } from './FavoritesSidebar'
import { hydrateFavorites } from '@/lib/favorites'
import { FadeUp, SlideLeft, SlideRight } from '@/components/store/motion'
import type { Product, StoreConfig } from '@/types'

interface Props {
  product: Product
  store: StoreConfig
  related: Product[]
}

// ─── Tag extractors ──────────────────────────────────────────────────────────

function extractNum(tags: string[], pattern: RegExp): string | null {
  const t = tags.find(t => pattern.test(t))
  return t ? t.match(/\d+/)?.[0] ?? null : null
}

function getSpecs(tags: string[]) {
  return {
    ambientes: extractNum(tags, /\d+\s*(amb|ambiente)/i),
    dormitorios: extractNum(tags, /\d+\s*(dorm|dormitorio|habitaci)/i),
    baños: extractNum(tags, /\d+\s*(baño|bath|wc)/i),
    cocheras: extractNum(tags, /\d+\s*(cochera|garage|garaje)/i),
    superficie: tags.find(t => /\d+\s*m[²2]/i.test(t)) ?? null,
    superficieTot: tags.find(t => /\d+\s*m[²2]\s*tot/i.test(t)) ?? null,
    antiguedad: extractNum(tags, /\d+\s*(año|años)\s*(antig|antigü)/i),
    piso: extractNum(tags, /piso\s*\d+|\d+°\s*piso/i),
    operacion: tags.find(t => /\bventa\b/i.test(t))
      ? 'venta'
      : tags.find(t => /\balquiler\b/i.test(t))
      ? 'alquiler'
      : null,
    extras: tags.filter(t =>
      !/\d+\s*(amb|ambiente|dorm|dormitorio|baño|bath|cochera|garage|garaje|m[²2]|año|piso)|venta|alquiler|destacado/i.test(t)
    ),
  }
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center">
        <span className="text-6xl opacity-20">🏠</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={images[active]}
          alt={`${name} — foto ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover transition-opacity duration-300"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative shrink-0 overflow-hidden rounded-xl transition-all ${
                i === active ? 'ring-2 opacity-100' : 'opacity-60 hover:opacity-100'
              }`}
              style={{ width: 80, height: 60 }}
            >
              <Image src={src} alt={`foto ${i + 1}`} fill sizes="80px" className="object-cover" />
              {i === active && (
                <div className="absolute inset-0 rounded-xl ring-2" style={{ boxShadow: `inset 0 0 0 2px var(--color-accent)` }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Spec chip ────────────────────────────────────────────────────────────────

function SpecChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 px-4 py-3 min-w-[72px]">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-black text-gray-900">{value}</span>
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function RealEstatePropertyDetail({ product, store, related }: Props) {
  const [favOpen, setFavOpen] = useState(false)
  useEffect(() => { hydrateFavorites() }, [])

  const ACCENT = store.color_accent
  const tags = product.tags ?? []
  const specs = getSpecs(tags)

  const whatsappMsg = encodeURIComponent(
    `Hola! Vi la propiedad "${product.name}" en su sitio y me gustaría recibir más información.`
  )
  const whatsappHref = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=${whatsappMsg}`
    : null

  const operacionColor = specs.operacion === 'alquiler' ? '#0EA5E9' : ACCENT

  const allSpecs = [
    specs.ambientes && { icon: '🏠', label: 'Ambientes', value: specs.ambientes },
    specs.dormitorios && { icon: '🛏', label: 'Dormitorios', value: specs.dormitorios },
    specs.baños && { icon: '🚿', label: 'Baños', value: specs.baños },
    specs.cocheras && { icon: '🚗', label: 'Cochera', value: specs.cocheras },
    specs.superficie && { icon: '📐', label: 'Superficie', value: specs.superficie },
  ].filter(Boolean) as { icon: string; label: string; value: string }[]

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: store.currency ?? 'ARS',
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <div className="min-h-screen bg-white">
      <RealEstateHeader store={store} onFavoritesOpen={() => setFavOpen(true)} />
      <FavoritesSidebar store={store} open={favOpen} onClose={() => setFavOpen(false)} />

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-5 pb-2 md:px-8">
        <nav className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
          <span>/</span>
          <Link href="/productos" className="hover:text-gray-900 transition-colors">Inmuebles</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link href={`/productos?categoria=${product.category.slug}`}
                className="hover:text-gray-900 transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Grid principal ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 px-4 pb-16 pt-4 md:grid-cols-[1.1fr_1fr] md:gap-12 md:px-8">

        {/* ── Galería ─────────────────────────────────────────────────────── */}
        <SlideLeft>
          <Gallery images={product.images} name={product.name} />
        </SlideLeft>

        {/* ── Info ────────────────────────────────────────────────────────── */}
        <SlideRight className="flex flex-col gap-5 md:sticky md:top-20 md:self-start">

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {specs.operacion && (
              <span
                className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-widest text-white"
                style={{ backgroundColor: operacionColor }}
              >
                En {specs.operacion}
              </span>
            )}
            {product.is_featured && (
              <span className="rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest"
                style={{ borderColor: ACCENT, color: ACCENT }}>
                ⭐ Destacado
              </span>
            )}
            {product.category?.name && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="text-2xl font-black leading-tight text-gray-900 md:text-3xl">
            {product.name}
          </h1>

          {/* Precio */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black" style={{ color: ACCENT }}>
              {product.price > 0 ? `USD ${product.price.toLocaleString('es-AR')}` : 'Consultar precio'}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <span className="text-lg line-through text-gray-300">
                USD {product.compare_at_price.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Specs chips */}
          {allSpecs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allSpecs.map(({ icon, label, value }) => (
                <SpecChip key={label} icon={icon} label={label} value={value} />
              ))}
            </div>
          )}

          {/* Descripción */}
          {product.description && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Descripción</h3>
              <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Extras / amenities */}
          {specs.extras.length > 0 && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Características</h3>
              <div className="flex flex-wrap gap-2">
                {specs.extras.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 rounded-full py-4 text-sm font-black uppercase tracking-wider text-white transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: ACCENT }}
              >
                <WAIcon />
                Consultar por WhatsApp
              </a>
            )}
            {store.email && (
              <a
                href={`mailto:${store.email}?subject=Consulta sobre: ${encodeURIComponent(product.name)}`}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-200 py-3.5 text-sm font-bold text-gray-700 transition-all hover:bg-gray-50"
              >
                ✉️ Consultar por email
              </a>
            )}

            {/* Favoritos */}
            <div className="flex items-center gap-3 pt-1">
              <FavoritesButton product={product} accent={ACCENT} size="md" />
              <span className="text-sm text-gray-400">Guardar en favoritos</span>
            </div>
          </div>

          {/* Info asesor */}
          <div className="rounded-2xl bg-gray-50 p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl font-black text-white"
              style={{ backgroundColor: ACCENT }}>
              {store.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{store.name}</p>
              <p className="text-xs text-gray-400">Asesor inmobiliario</p>
              {store.whatsapp_number && (
                <p className="text-xs font-medium mt-0.5" style={{ color: ACCENT }}>
                  {store.whatsapp_number}
                </p>
              )}
            </div>
          </div>

        </SlideRight>
      </div>

      {/* ── Propiedades similares ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className="border-t border-gray-100 px-4 py-14 md:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3" style={{ color: ACCENT }}>
                También te puede interesar
              </p>
              <h2 className="mb-8 text-2xl font-black uppercase tracking-tight md:text-3xl">
                Inmuebles similares
              </h2>
            </FadeUp>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map(p => {
                const relTags = p.tags ?? []
                const relOp = relTags.find(t => /\bventa\b/i.test(t)) ? 'venta'
                  : relTags.find(t => /\balquiler\b/i.test(t)) ? 'alquiler' : null
                const relSuperficie = relTags.find(t => /\d+\s*m[²2]/i.test(t))
                const relAmb = relTags.find(t => /\d+\s*(amb|ambiente)/i.test(t))

                return (
                  <Link key={p.id} href={`/productos/${p.slug}`}
                    className="group flex overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                    <div className="relative w-32 shrink-0 overflow-hidden">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill sizes="128px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-2xl">🏠</span>
                        </div>
                      )}
                      {relOp && (
                        <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[9px] font-black text-white uppercase"
                          style={{ backgroundColor: relOp === 'alquiler' ? '#0EA5E9' : ACCENT }}>
                          {relOp}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center gap-1 p-4 min-w-0">
                      {p.category?.name && (
                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                          {p.category.name}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">
                        {p.name}
                      </p>
                      <div className="flex gap-2 text-[11px] text-gray-400">
                        {relAmb && <span>{relAmb.replace(/^(\d+).*/i, '$1 amb.')}</span>}
                        {relSuperficie && <span>· {relSuperficie}</span>}
                      </div>
                      <p className="text-sm font-black mt-1" style={{ color: ACCENT }}>
                        {p.price > 0 ? `USD ${p.price.toLocaleString('es-AR')}` : 'Consultar'}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <RealEstateFooter store={store} />

      {store.whatsapp_number && (
        <RealEstateFloatingWhatsApp phoneNumber={store.whatsapp_number} />
      )}
    </div>
  )
}

function WAIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}
