import Image from 'next/image'
import Link from 'next/link'
import { ModoProductCard } from './ModoProductCard'
import { NewsletterForm } from '../NewsletterForm'
import type { StoreConfig, Product, Category } from '@/types'

// ─── Fallback images (fashion editorial) ──────────────────────────────────────
const HERO_MAIN    = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=85'
const HERO_GRID_1  = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80'
const HERO_GRID_2  = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80'
const CAROUSEL_IMGS = [
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
  'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80',
  'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
]

interface Props {
  store: StoreConfig
  products: Product[]
  categories: Category[]
  featured: Product[]
}

export function ModoHomePage({ store, products, categories, featured }: Props) {
  const heroImage = store.hero_image_url ?? HERO_MAIN

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>

      {/* ══════════════════════════════════════════════════════════
          HERO — split layout: texto izquierda, imagen derecha
      ══════════════════════════════════════════════════════════ */}
      <section className="grid md:grid-cols-2 min-h-[92vh] md:min-h-[85vh]">

        {/* Texto */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-24 order-2 md:order-1"
          style={{ backgroundColor: store.color_background }}>

          {store.hero_subtitle && (
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em] opacity-40"
              style={{ color: store.color_text }}>
              {store.hero_subtitle}
            </p>
          )}

          <h1 className="mb-6 text-[clamp(3rem,8vw,7rem)] font-black uppercase leading-[0.88] tracking-tight"
            style={{ color: store.color_text }}>
            {store.hero_title}
          </h1>

          {/* Línea decorativa */}
          <div className="mb-8 h-px w-16" style={{ backgroundColor: store.color_accent }} />

          <Link
            href={store.hero_cta_url}
            className="inline-flex items-center gap-3 group self-start"
          >
            <span
              className="px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: store.color_text, color: store.color_background }}
            >
              {store.hero_cta_label}
            </span>
            <span className="text-xl transition-transform group-hover:translate-x-1"
              style={{ color: store.color_text }}>→</span>
          </Link>

          {/* Stats / trust */}
          {store.free_shipping_threshold && (
            <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.2em] opacity-30"
              style={{ color: store.color_text }}>
              Envío gratis desde {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(store.free_shipping_threshold)}
            </p>
          )}
        </div>

        {/* Imagen + grid secundaria */}
        <div className="relative order-1 md:order-2 h-[55vw] md:h-auto">
          {/* Imagen principal */}
          <div className="absolute inset-0">
            <Image
              src={heroImage}
              alt={store.hero_title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top"
            />
          </div>
          {/* Overlay con grid de dos miniaturas en la esquina inf-der */}
          <div className="absolute bottom-4 right-4 hidden md:grid grid-cols-2 gap-2">
            {[HERO_GRID_1, HERO_GRID_2].map((src, i) => (
              <div key={i} className="relative h-24 w-20 overflow-hidden shadow-lg">
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CARRUSEL DE IMÁGENES — scroll horizontal
      ══════════════════════════════════════════════════════════ */}
      <section className="py-10 overflow-hidden" style={{ backgroundColor: '#f5f0ea' }}>
        <style>{`
          @keyframes modo-slide {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .modo-carousel { display:flex; width:max-content; animation: modo-slide 30s linear infinite; }
          .modo-carousel:hover { animation-play-state: paused; }
        `}</style>
        <div className="modo-carousel gap-3">
          {[...CAROUSEL_IMGS, ...CAROUSEL_IMGS].map((src, i) => (
            <div key={i} className="relative shrink-0 h-64 w-48 overflow-hidden">
              <Image src={src} alt="" fill sizes="192px" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CATEGORÍAS — chips horizontales + cards grandes
      ══════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-6 py-16 md:px-12 md:py-20">
          {/* Chips nav */}
          <div className="mb-10 flex flex-wrap gap-2">
            <Link href="/productos"
              className="rounded-full border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:bg-black hover:text-white hover:border-black"
              style={{ borderColor: `${store.color_text}20`, color: store.color_text }}>
              Todo
            </Link>
            {categories.map((cat) => (
              <Link key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="rounded-full border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] transition-all hover:bg-black hover:text-white hover:border-black"
                style={{ borderColor: `${store.color_text}20`, color: store.color_text }}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Cards grandes — 2 primeras categorías con imagen */}
          {categories.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.slice(0, 2).map((cat) => (
                <Link key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group relative h-80 md:h-[480px] overflow-hidden block"
                  style={{ backgroundColor: '#e8e2da' }}>
                  {cat.image_url && (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight mb-2">
                      {cat.name}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                      Ver colección →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Categorías adicionales — fila horizontal */}
          {categories.length > 2 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(2, 6).map((cat) => (
                <Link key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group relative h-40 overflow-hidden block"
                  style={{ backgroundColor: '#e8e2da' }}>
                  {cat.image_url && (
                    <Image src={cat.image_url} alt={cat.name} fill
                      sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-sm font-black uppercase text-white tracking-tight">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          STATEMENT — texto editorial grande
      ══════════════════════════════════════════════════════════ */}
      {store.home_editorial_title && (
        <section className="px-6 py-20 md:px-12 border-t border-b" style={{ borderColor: `${store.color_text}10` }}>
          <div className="max-w-5xl">
            {store.home_editorial_label && (
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.4em]"
                style={{ color: store.color_accent }}>
                {store.home_editorial_label}
              </p>
            )}
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.9] tracking-tight mb-8"
              style={{ color: store.color_text }}>
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="max-w-md text-sm leading-relaxed opacity-50 mb-10" style={{ color: store.color_text }}>
                {store.home_editorial_body}
              </p>
            )}
            <Link href="/productos"
              className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] group"
              style={{ color: store.color_text }}>
              <span>Explorar colección</span>
              <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          PRODUCTOS DESTACADOS — 3 columnas, tarjetas limpias
      ══════════════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="px-6 py-16 md:px-12 md:py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.35em] opacity-40"
                style={{ color: store.color_text }}>
                Selección
              </p>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight"
                style={{ color: store.color_text }}>
                Destacados
              </h2>
            </div>
            <Link href="/productos"
              className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: store.color_text }}>
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map((p) => (
              <ModoProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          TODOS LOS PRODUCTOS — scroll horizontal mobile
      ══════════════════════════════════════════════════════════ */}
      {products.length > 0 && (
        <section className="py-16 md:py-20" style={{ backgroundColor: '#f5f0ea' }}>
          <div className="mb-8 px-6 md:px-12 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight"
              style={{ color: store.color_text }}>
              Nuevos ingresos
            </h2>
            <Link href="/productos"
              className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: store.color_text }}>
              Ver todos →
            </Link>
          </div>
          {/* Mobile: scroll horizontal */}
          <div className="flex gap-4 overflow-x-auto px-6 pb-2 md:hidden snap-x snap-mandatory">
            {products.slice(0, 8).map((p) => (
              <div key={p.id} className="shrink-0 w-[62vw] snap-start">
                <ModoProductCard product={p} store={store} />
              </div>
            ))}
          </div>
          {/* Desktop: 4 columnas */}
          <div className="hidden md:grid grid-cols-4 gap-4 px-12">
            {products.slice(0, 4).map((p) => (
              <ModoProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          NEWSLETTER — minimal, centrado
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-24 md:px-12 text-center"
        style={{ backgroundColor: store.color_text }}>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] opacity-30"
          style={{ color: store.color_background }}>
          Comunidad
        </p>
        <h2 className="mb-4 text-3xl md:text-4xl font-black uppercase tracking-tight"
          style={{ color: store.color_background }}>
          Suscribite
        </h2>
        <p className="mb-8 text-sm opacity-40 max-w-xs mx-auto" style={{ color: store.color_background }}>
          Novedades y lanzamientos antes que nadie. Sin spam.
        </p>
        <div className="max-w-sm mx-auto">
          <NewsletterForm store={store} dark />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRUST — 3 íconos horizontales
      ══════════════════════════════════════════════════════════ */}
      <section className="px-6 py-12 md:px-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center max-w-3xl mx-auto">
        {[
          { icon: '⚡', title: 'Envío express', desc: 'Recibís en 24–48 hs' },
          { icon: '↺', title: 'Cambios gratis', desc: '30 días sin costo' },
          { icon: '🔒', title: 'Pago 100% seguro', desc: 'Por MercadoPago' },
        ].map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-2">
            <span className="text-3xl">{item.icon}</span>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: store.color_text }}>{item.title}</p>
            <p className="text-xs opacity-40" style={{ color: store.color_text }}>{item.desc}</p>
          </div>
        ))}
      </section>

    </div>
  )
}
