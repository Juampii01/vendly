import Image from 'next/image'
import Link from 'next/link'
import { getStoreConfig, getCategories, getProducts } from '@/lib/store'
import { ProductCard } from '@/components/store/ProductCard'
import { NewsletterForm } from '@/components/store/NewsletterForm'
import { LandingPage } from '@/components/store/LandingPage'
import { ModoHomePage } from '@/components/store/modo/ModoHomePage'
import { AthleticHomePage } from '@/components/store/athletic/AthleticHomePage'
import { DealershipHomePage } from '@/components/store/dealership/DealershipHomePage'
import { LibreriaHomePage } from '@/components/store/libreria/LibreriaHomePage'
import { VendlyMarketingPage } from '@/components/store/vendly-marketing/VendlyMarketingPage'
import { RealEstateHomePage } from '@/components/store/real-estate/RealEstateHomePage'
import { RestaurantHomePage } from '@/components/store/restaurant/RestaurantHomePage'
import { GymHomePage } from '@/components/store/gym/GymHomePage'
import { AdidasHomePage } from '@/components/store/adidas/AdidasHomePage'
import { HomeRenderer } from '@/components/store/HomeRenderer'
import { FadeUp, SlideLeft, SlideRight, StaggerGrid, StaggerItem } from '@/components/store/motion'
import { formatPrice } from '@/lib/format'
import { DEFAULT_SECTIONS } from '@/types'
import type { Metadata } from 'next'
import type { StoreConfig } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return { title: store.meta_title ?? store.name }
}

// ─── Fallbacks — solo se usan si store_config no tiene valores configurados ───

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85'
const SPLIT_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=85'

/** Marquee por defecto: se construye a partir de los datos de la tienda */
function getDefaultMarqueeItems(store: StoreConfig): string[] {
  const items = ['NUEVA COLECCIÓN', store.name.toUpperCase()]
  if (store.free_shipping_threshold) {
    items.push(`ENVÍO GRATIS DESDE ${formatPrice(store.free_shipping_threshold)}`)
  }
  items.push('PIEZAS ÚNICAS')
  return items
}


export default async function HomePage() {
  const [store, categories, { products: featured }, { products: all }] = await Promise.all([
    getStoreConfig(),
    getCategories(),
    getProducts({ featured: true, per_page: 8 }),
    getProducts({ per_page: 8 }),
  ])

  // ── Override por slug (flagship custom builds) ────────────────────────────
  // Tiendas que tienen un build dedicado por encima del sistema config-driven.
  // Sirve como showpiece de portfolio: cuando un prospect entra al sitio,
  // ve un build a medida, no un preset reutilizado.
  if (store.slug === 'adidas') {
    return <AdidasHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Sistema config-driven (nuevo) ─────────────────────────────────────────
  // Si el store tiene home_layout setteado, lo renderiza con HomeRenderer y
  // se ignora el dispatcher legacy de site_type. Esto permite migrar
  // store-by-store sin romper los HomePage.tsx existentes.
  if (store.home_layout && store.home_layout.length > 0) {
    return (
      <HomeRenderer
        store={store}
        categories={categories}
        featured={featured}
        all={all}
        layout={store.home_layout}
      />
    )
  }

  // ── Landing page ───────────────────────────────────────────────────────────
  if (store.site_type === 'landing') {
    const sections = store.sections?.length ? store.sections : DEFAULT_SECTIONS
    return <LandingPage store={store} sections={sections} />
  }

  // ── Template Modo ──────────────────────────────────────────────────────────
  if (store.site_type === 'modo') {
    return <ModoHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Template Gym (athletic + label marker) ────────────────────────────────
  if (store.site_type === 'athletic' && store.home_editorial_label === 'gym') {
    return <GymHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Template Athletic (Adidas-style) ──────────────────────────────────────
  if (store.site_type === 'athletic') {
    return <AthleticHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Template Dealership (Concesionaria) ───────────────────────────────────
  if (store.site_type === 'dealership') {
    return <DealershipHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Template Librería ─────────────────────────────────────────────────────
  if (store.site_type === 'libreria') {
    return <LibreriaHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Vendly Marketing Landing Page ─────────────────────────────────────────
  if (store.site_type === 'vendly-marketing') {
    return <VendlyMarketingPage />
  }

  // ── Template Inmobiliaria ─────────────────────────────────────────────────
  if (store.site_type === 'real-estate') {
    return <RealEstateHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  // ── Template Restaurante ──────────────────────────────────────────────────
  if (store.site_type === 'restaurant') {
    return <RestaurantHomePage store={store} products={all} categories={categories} featured={featured} />
  }

  const heroSrc = store.hero_image_url ?? HERO_FALLBACK
  const splitImageSrc = store.home_split_image_url ?? SPLIT_IMAGE_FALLBACK
  const marqueeItems = store.home_marquee_items?.length
    ? store.home_marquee_items
    : getDefaultMarqueeItems(store)

  const editorialLabel = store.home_editorial_label ?? null
  const editorialTitle = store.home_editorial_title ?? null
  const editorialBody = store.home_editorial_body ?? null

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: store.name,
    url: baseUrl,
    logo: store.logo_url ?? undefined,
    contactPoint: store.email
      ? { '@type': 'ContactPoint', email: store.email, contactType: 'customer service' }
      : undefined,
    sameAs: store.instagram_url ? [store.instagram_url] : undefined,
  }

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] w-full overflow-hidden">
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 w-full px-6 pb-12 md:px-12 md:pb-16 lg:px-20">
          <div className="max-w-2xl">
            {store.hero_subtitle && (
              <FadeUp delay={0.1}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  {store.hero_subtitle}
                </p>
              </FadeUp>
            )}
            <FadeUp delay={0.25}>
              <h1 className="mb-6 text-5xl font-black uppercase leading-[0.92] tracking-tight text-white md:text-7xl lg:text-8xl">
                {store.hero_title}
              </h1>
            </FadeUp>
            <FadeUp delay={0.45}>
              <Link href={store.hero_cta_url}
                className="inline-block px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: store.hero_cta_color ?? store.color_accent, color: store.color_primary }}>
                {store.hero_cta_label}
              </Link>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ─────────────────────────────────────────────────────── */}
      <div className="overflow-hidden py-3" style={{ backgroundColor: store.color_accent }}>
        <style>{`
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .marquee-track { display:flex; width:max-content; animation: marquee 22s linear infinite; }
        `}</style>
        <div className="marquee-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex shrink-0 items-center text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              {marqueeItems.map((text) => (
                <span key={text} className="mx-6 flex items-center gap-6">
                  {text}<span className="opacity-40">·</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS ──────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="px-4 py-12 md:px-8 md:py-16">
          <FadeUp className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight md:text-3xl">Categorías</h2>
            <Link href="/productos" className="text-xs font-semibold uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100">
              Ver todo →
            </Link>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {categories.map((cat, idx) => (
              <StaggerItem key={cat.id}>
              <Link href={`/productos?categoria=${cat.slug}`}
                className={`group relative overflow-hidden ${idx === 0 ? 'col-span-2 md:col-span-1' : ''}`}
                style={{ aspectRatio: idx === 0 ? '2/1.2' : '3/4' }}>
                <div className="absolute inset-0">
                  {cat.image_url
                    ? <Image src={cat.image_url} alt={cat.name} fill sizes="(max-width: 768px) 50vw, 20vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    : <div className="h-full w-full" style={{ backgroundColor: store.color_secondary }} />}
                </div>
                <div className="absolute inset-0 bg-black/25 transition-colors duration-300 group-hover:bg-black/40" />
                <div className="absolute bottom-0 left-0 w-full p-4">
                  <p className="text-sm font-black uppercase tracking-[0.15em] text-white">{cat.name}</p>
                </div>
              </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* ── SPLIT EDITORIAL ─────────────────────────────────────────────── */}
      {(editorialTitle || editorialBody || editorialLabel) && (
        <section className="grid min-h-[520px] md:grid-cols-2">
          <SlideLeft className="relative aspect-[4/5] md:aspect-auto">
            <Image src={splitImageSrc} alt="Editorial" fill sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top" />
          </SlideLeft>
          <SlideRight className="flex flex-col justify-center px-8 py-16 md:px-16"
            style={{ backgroundColor: store.color_primary }}>
            {editorialLabel && (
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em]"
                style={{ color: store.color_accent }}>
                {editorialLabel}
              </p>
            )}
            {editorialTitle && (
              <h2 className="mb-6 text-4xl font-black uppercase leading-[0.9] tracking-tight md:text-5xl lg:text-6xl"
                style={{ color: store.color_background }}>
                {editorialTitle}
              </h2>
            )}
            {editorialBody && (
              <p className="mb-10 max-w-xs text-sm leading-relaxed opacity-50"
                style={{ color: store.color_background }}>
                {editorialBody}
              </p>
            )}
            <Link href="/productos"
              className="w-fit border px-8 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-70"
              style={{ borderColor: store.color_background, color: store.color_background }}>
              Explorar colección
            </Link>
          </SlideRight>
        </section>
      )}

      {/* ── DESTACADOS ──────────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="px-4 py-16 md:px-8">
          <FadeUp className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-black uppercase tracking-tight md:text-3xl">Destacados</h2>
            <Link href="/productos"
              className="text-xs font-semibold uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100">
              Ver todos →
            </Link>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} store={store} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* ── MÁS VENDIDOS — scroll horizontal en mobile ──────────────────── */}
      {all.length > 0 && (
        <section className="py-12 md:py-16" style={{ backgroundColor: `${store.color_text}06` }}>
          <FadeUp className="mb-6 flex items-end justify-between px-4 md:px-8">
            <h2 className="text-2xl font-black uppercase tracking-tight md:text-3xl">Más vendidos</h2>
            <Link href="/productos"
              className="text-xs font-semibold uppercase tracking-widest opacity-40 transition-opacity hover:opacity-100">
              Ver todos →
            </Link>
          </FadeUp>
          {/* Mobile: scroll horizontal */}
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 md:hidden"
            style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {all.map((p) => (
              <div key={p.id} className="w-[58vw] shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <ProductCard product={p} store={store} />
              </div>
            ))}
          </div>
          {/* Desktop: grid */}
          <StaggerGrid className="hidden grid-cols-4 gap-3 px-8 md:grid lg:grid-cols-4">
            {all.slice(0, 4).map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} store={store} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* ── GALERÍA DE PRODUCTOS ─────────────────────────────────────────── */}
      {(() => {
        // Collect up to 6 product images from all products (skip products without images)
        const galleryItems = all
          .filter(p => p.images?.length > 0)
          .slice(0, 6)
        if (galleryItems.length < 3) return null
        return (
          <section className="px-4 py-16 md:px-8">
            <FadeUp className="mb-8 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] opacity-40">Galería</p>
              <h2 className="text-2xl font-black uppercase tracking-tight md:text-3xl">
                {store.instagram_url ? (
                  <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-60">
                    @{store.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\/?/, '').replace(/\/$/, '') || store.name}
                  </a>
                ) : 'Nuestras prendas'}
              </h2>
            </FadeUp>
            <div className="grid grid-cols-3 gap-1.5 md:gap-3 lg:grid-cols-6">
              {galleryItems.map((product) => (
                <Link key={product.id} href={`/productos/${product.slug}`}
                  className="group relative aspect-square overflow-hidden block"
                  style={{ backgroundColor: store.color_secondary }}>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-end justify-start p-3 bg-black/0 transition-colors duration-300 group-hover:bg-black/50">
                    <p className="translate-y-1 text-[11px] font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {product.name}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      })()}

      {/* ── NEWSLETTER ──────────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-8" style={{ backgroundColor: store.color_primary }}>
        <FadeUp className="mx-auto max-w-xl text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: store.color_accent }}>
            Comunidad {store.name}
          </p>
          <h2 className="mb-4 text-3xl font-black uppercase leading-tight tracking-tight md:text-4xl"
            style={{ color: store.color_background }}>
            Primero te enterás vos
          </h2>
          <p className="mb-8 text-sm opacity-50" style={{ color: store.color_background }}>
            Lanzamientos, preventas y descuentos exclusivos. Sin spam.
          </p>
          <NewsletterForm store={store} />
        </FadeUp>
      </section>

      {/* ── CONFIANZA ───────────────────────────────────────────────────── */}
      <section className="border-t border-b px-4 py-10" style={{ borderColor: `${store.color_text}12` }}>
        <StaggerGrid className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
          {[
            { icon: '🚚', title: 'Envío gratis', desc: store.free_shipping_threshold ? `En compras desde ${formatPrice(store.free_shipping_threshold)}` : 'Consultá condiciones' },
            { icon: '↩️', title: 'Cambios sin costo', desc: 'Hasta 30 días después de la compra' },
            { icon: '🔒', title: 'Pago seguro', desc: 'Procesado por MercadoPago' },
          ].map((item) => (
            <StaggerItem key={item.title} className="flex flex-col items-center gap-2">
              <span className="text-3xl">{item.icon}</span>
              <p className="text-sm font-black uppercase tracking-wide">{item.title}</p>
              <p className="text-xs opacity-40">{item.desc}</p>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </section>

    </div>
  )
}
