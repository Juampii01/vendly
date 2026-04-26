import Image from 'next/image'
import Link from 'next/link'
import { FavoritesButton } from './FavoritesButton'
import type { Product, StoreConfig } from '@/types'

function formatUSD(n: number): string {
  return `USD ${n.toLocaleString('es-AR')}`
}

interface Props {
  product: Product
  store: StoreConfig
  featured?: boolean
}

// ─── Tag extractors ──────────────────────────────────────────────────────────

function extractTag(tags: string[], pattern: RegExp): string | null {
  return tags.find(t => pattern.test(t)) ?? null
}

function getAmbientes(tags: string[]): string | null {
  const t = extractTag(tags, /^\d+\s*(amb|ambiente|ambientes|dorm|dormitorio|dormitorios|rec)/i)
  return t ? t.replace(/^(\d+).*/i, '$1 amb.') : null
}

function getBaños(tags: string[]): string | null {
  const t = extractTag(tags, /^\d+\s*(baño|baños|bath|wc)/i)
  return t ? t.replace(/^(\d+).*/i, '$1 baño') : null
}

function getSuperficie(tags: string[]): string | null {
  return extractTag(tags, /\d+\s*m[²2]/i)
}

function getOperacion(tags: string[]): 'venta' | 'alquiler' | null {
  if (tags.some(t => /\bventa\b|for sale/i.test(t))) return 'venta'
  if (tags.some(t => /\balquiler\b|rent|arriendo/i.test(t))) return 'alquiler'
  return null
}

function getGaraje(tags: string[]): boolean {
  return tags.some(t => /garaje|garage|cochera|estacionamiento|parking/i.test(t))
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RealEstatePropertyCard({ product, store, featured = false }: Props) {
  const ACCENT = store.color_accent
  const tags = product.tags ?? []

  const ambientes = getAmbientes(tags)
  const baños = getBaños(tags)
  const superficie = getSuperficie(tags)
  const operacion = getOperacion(tags)
  const tieneGaraje = getGaraje(tags)

  const amenities = [
    ambientes && { icon: '🛏', label: ambientes },
    baños && { icon: '🚿', label: baños },
    superficie && { icon: '📐', label: superficie },
    tieneGaraje && { icon: '🚗', label: 'Garaje' },
  ].filter(Boolean) as { icon: string; label: string }[]

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#161616] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: featured ? '16/9' : '4/3' }}>
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-white/10 flex items-center justify-center">
            <span className="text-5xl opacity-20">🏠</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Badge operación */}
        {operacion && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
            style={{ backgroundColor: operacion === 'alquiler' ? '#0EA5E9' : ACCENT }}
          >
            En {operacion}
          </div>
        )}

        {/* Favoritos button */}
        <div className="absolute top-3 right-3">
          <FavoritesButton product={product} accent={ACCENT} size="sm" />
        </div>

        {/* Precio sobre imagen */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-black text-xl leading-none drop-shadow-md">
            {product.price > 0 ? formatUSD(product.price) : 'Consultar'}
          </p>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <p className="text-white/60 text-xs line-through mt-0.5">
              {formatUSD(product.compare_at_price)}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4">
        {product.category?.name && (
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
            {product.category.name}
          </p>
        )}

        <h3 className="font-bold text-white leading-snug line-clamp-2 text-sm group-hover:text-white/80 transition-colors">
          {product.name}
        </h3>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-1">
            {amenities.map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1 text-[11px] text-white/50 font-medium">
                <span>{icon}</span> {label}
              </span>
            ))}
          </div>
        )}

        {product.description && (
          <p className="text-xs text-white/35 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  )
}
