import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { AthleticProductCard } from './AthleticProductCard'
import { NewsletterForm } from '@/components/store/NewsletterForm'
import type { StoreConfig, Category, Product } from '@/types'

interface Props {
  store: StoreConfig
  products: Product[]
  featured: Product[]
  categories: Category[]
}

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1800&q=85'
const HERO_FALLBACK_2 = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1800&q=85'

export function AthleticHomePage({ store, products, featured, categories }: Props) {
  const heroSrc = store.hero_image_url ?? HERO_FALLBACK
  const editorialSrc = store.home_split_image_url ?? HERO_FALLBACK_2
  const marqueeItems = store.home_marquee_items?.length
    ? store.home_marquee_items
    : ['Nueva colección', store.name.toUpperCase(), 'Envío a todo el país', 'Performance · Style', 'Talles S al XXL']

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>

      {/* ── HERO: full-screen con texto bold ──────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '92vh' }}>
        <Image
          src={heroSrc}
          alt={store.hero_title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Gradient: bottom-heavy, left-heavy */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-3xl">
            {store.hero_subtitle && (
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                {store.hero_subtitle}
              </p>
            )}
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black uppercase leading-[0.88] tracking-[-0.02em] text-white mb-8">
              {store.hero_title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link
                href={store.hero_cta_url}
                className="inline-block px-8 py-4 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: store.color_background, color: store.color_primary }}
              >
                {store.hero_cta_label}
              </Link>
              <Link
                href="/productos"
                className="inline-block px-8 py-4 text-xs font-black uppercase tracking-[0.15em] border border-white/40 text-white transition-all hover:bg-white/10"
              >
                Ver colección completa
              </Link>
            </div>
          </div>
        </div>

        {/* Three-stripe decorative element */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full"
              style={{ height: `${60 - i * 12}px`, backgroundColor: store.color_accent, opacity: 0.7 - i * 0.15 }}
            />
          ))}
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden py-3.5" style={{ backgroundColor: store.color_primary }}>
        <style>{`
          @keyframes athletic-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .athletic-track { display:flex; width:max-content; animation: athletic-scroll 20s linear infinite; }
        `}</style>
        <div className="athletic-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex shrink-0 items-center text-[10px] font-black uppercase tracking-[0.25em]"
              style={{ color: store.color_background }}>
              {marqueeItems.map((text) => (
                <span key={text} className="mx-8 flex items-center gap-8">
                  {text}
                  <span
                    className="inline-flex gap-0.5"
                    style={{ color: store.color_accent }}
                  >
                    {[...Array(3)].map((_, j) => (
                      <span key={j} className="inline-block w-0.5 h-2.5 rounded-sm" style={{ backgroundColor: store.color_accent }} />
                    ))}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS — 2 grandes + fila de pequeñas ─────────────────────── */}
      {categories.length > 0 && (
        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-3xl font-black uppercase tracking-[-0.02em]" style={{ color: store.color_text }}>
              Colecciones
            </h2>
            <Link
              href="/productos"
              className="text-xs font-black uppercase tracking-[0.12em] transition-opacity hover:opacity-50"
              style={{ color: store.color_text }}
            >
              Ver todo →
            </Link>
          </div>

          {/* 2 big hero cards */}
          {categories.length >= 2 && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {categories.slice(0, 2).map(cat => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group relative overflow-hidden"
                  style={{ aspectRatio: '4/5' }}
                >
                  <div className="absolute inset-0">
                    {cat.image_url
                      ? <Image src={cat.image_url} alt={cat.name} fill sizes="50vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                      : <div className="h-full w-full" style={{ backgroundColor: store.color_secondary }} />
                    }
                  </div>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xl font-black uppercase tracking-[-0.01em] text-white leading-tight">
                      {cat.name}
                    </p>
                    <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                      Ver colección →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Row of smaller cards */}
          {categories.length > 2 && (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(2).map(cat => (
                <Link
                  key={cat.id}
                  href={`/productos?categoria=${cat.slug}`}
                  className="group relative overflow-hidden rounded-sm"
                  style={{ aspectRatio: '1/1' }}
                >
                  <div className="absolute inset-0">
                    {cat.image_url
                      ? <Image src={cat.image_url} alt={cat.name} fill sizes="20vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                      : <div className="h-full w-full" style={{ backgroundColor: store.color_secondary }} />
                    }
                  </div>
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
                  <div className="absolute inset-x-2 bottom-2">
                    <p className="text-[10px] font-black uppercase text-white leading-tight tracking-wide">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── FEATURED — grid limpio ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-1 opacity-40">
                Los más elegidos
              </p>
              <h2 className="text-3xl font-black uppercase tracking-[-0.02em]">Destacados</h2>
            </div>
            <Link
              href="/productos"
              className="text-xs font-black uppercase tracking-[0.12em] transition-opacity hover:opacity-50"
              style={{ color: store.color_text }}
            >
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map(product => (
              <AthleticProductCard key={product.id} product={product} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* ── FULL-WIDTH EDITORIAL BANNER ───────────────────────────────────── */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="relative w-full overflow-hidden" style={{ minHeight: '60vh' }}>
          <Image
            src={editorialSrc}
            alt="Editorial"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-3xl">
              {store.home_editorial_label && (
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.35em]"
                  style={{ color: store.color_accent }}>
                  {store.home_editorial_label}
                </p>
              )}
              {store.home_editorial_title && (
                <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-[-0.02em] text-white mb-6">
                  {store.home_editorial_title}
                </h2>
              )}
              {store.home_editorial_body && (
                <p className="text-sm text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
                  {store.home_editorial_body}
                </p>
              )}
              <Link
                href="/productos"
                className="inline-block px-8 py-4 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: store.color_background, color: store.color_primary }}
              >
                Explorar colección
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── ALL PRODUCTS — scroll mobile / grid desktop ───────────────────── */}
      {products.length > 0 && (
        <section className="py-12 md:py-16" style={{ backgroundColor: `${store.color_text}04` }}>
          <div className="mb-8 flex items-end justify-between px-4 md:px-8">
            <h2 className="text-3xl font-black uppercase tracking-[-0.02em]">Nueva temporada</h2>
            <Link href="/productos"
              className="text-xs font-black uppercase tracking-[0.12em] transition-opacity hover:opacity-50"
              style={{ color: store.color_text }}>
              Ver todo →
            </Link>
          </div>
          {/* Mobile: scroll horizontal */}
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 md:hidden"
            style={{ scrollSnapType: 'x mandatory' }}>
            {products.map(p => (
              <div key={p.id} className="w-[55vw] shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <AthleticProductCard product={p} store={store} />
              </div>
            ))}
          </div>
          {/* Desktop: 4-col grid */}
          <div className="hidden md:grid grid-cols-4 gap-3 px-8">
            {products.slice(0, 8).map(p => (
              <AthleticProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        </section>
      )}

      {/* ── TRUST BADGES ─────────────────────────────────────────────────── */}
      <section
        className="px-4 py-10 md:px-8 border-t border-b"
        style={{ borderColor: `${store.color_text}10` }}
      >
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '⚡', title: 'Envío express', desc: '24hs CABA y GBA' },
            { icon: '↩️', title: 'Cambios gratis', desc: 'Hasta 30 días' },
            { icon: '🔒', title: 'Pago seguro', desc: 'MercadoPago' },
            {
              icon: '🚚',
              title: 'Envío gratis',
              desc: store.free_shipping_threshold
                ? `En compras +${formatPrice(store.free_shipping_threshold, store.currency, store.locale)}`
                : 'Consultá condiciones'
            },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{item.icon}</span>
              <p className="text-xs font-black uppercase tracking-[0.1em]">{item.title}</p>
              <p className="text-[10px] opacity-40">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-8" style={{ backgroundColor: store.color_primary }}>
        <div className="mx-auto max-w-xl text-center">
          <p
            className="mb-3 text-[9px] font-black uppercase tracking-[0.35em]"
            style={{ color: store.color_accent }}
          >
            Club {store.name}
          </p>
          <h2
            className="mb-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.02em] md:text-5xl"
            style={{ color: store.color_background }}
          >
            Primero te enterás vos
          </h2>
          <p className="mb-8 text-sm opacity-40" style={{ color: store.color_background }}>
            Nuevos drops, descuentos y lanzamientos exclusivos. Sin spam.
          </p>
          <NewsletterForm store={store} dark />
        </div>
      </section>

    </div>
  )
}
