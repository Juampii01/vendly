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

const HERO_FALLBACK  = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85'
const SPLIT_FALLBACK = 'https://images.unsplash.com/photo-1520975916090-cfc2acebb9b8?w=1200&q=85'

export function AthleticHomePage({ store, products, featured, categories }: Props) {
  const heroSrc     = store.hero_image_url  ?? HERO_FALLBACK
  const editorialSrc = store.home_split_image_url ?? SPLIT_FALLBACK
  const rawItems    = store.home_marquee_items ?? []
  const marqueeItems = rawItems.length > 1
    ? rawItems.slice(1)
    : rawItems.length === 1
      ? [rawItems[0]]
      : ['Nueva colección', store.name.toUpperCase(), 'Envío a todo el país', 'Esencia · Presencia · Estilo']

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>

      {/* ══ HERO — pantalla completa ═══════════════════════════════════════ */}
      <section className="relative w-full" style={{ height: '100svh', minHeight: '640px' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />

        {/* Overlays graduales */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-14 px-8 md:px-14 lg:px-20">
          <div className="max-w-2xl">
            {store.hero_subtitle && (
              <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.45em]"
                style={{ color: 'rgba(255,255,255,0.55)' }}>
                {store.hero_subtitle}
              </p>
            )}
            <h1 className="font-black uppercase leading-[0.86] text-white mb-10"
              style={{ fontSize: 'clamp(3.8rem, 9vw, 8rem)', letterSpacing: '-0.03em' }}>
              {store.hero_title}
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link href={store.hero_cta_url ?? '/productos'}
                className="inline-block px-9 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: store.color_background, color: store.color_primary }}>
                {store.hero_cta_label ?? 'Ver colección'}
              </Link>
              <Link href="/productos"
                className="inline-block px-9 py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 text-white transition-all hover:bg-white/10">
                Ver todo
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2">
          <div className="w-px h-14 animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <p className="text-[7px] font-bold uppercase tracking-[0.4em] rotate-90 mt-3"
            style={{ color: 'rgba(255,255,255,0.3)' }}>Scroll</p>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-3" style={{ backgroundColor: store.color_primary }}>
        <style>{`
          @keyframes ath-mq { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
          .ath-mq-track { display:flex; width:max-content; animation:ath-mq 24s linear infinite; }
        `}</style>
        <div className="ath-mq-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex shrink-0 items-center text-[9px] font-bold uppercase tracking-[0.3em]"
              style={{ color: store.color_background }}>
              {marqueeItems.map((text) => (
                <span key={text} className="mx-10 flex items-center gap-10">
                  {text}
                  <span className="w-1 h-1 rounded-full inline-block opacity-50"
                    style={{ backgroundColor: store.color_background }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ CATEGORÍAS ═══════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-5 py-16 md:px-10 md:py-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight"
                style={{ color: store.color_text }}>
                Colecciones
              </h2>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: store.color_text }}>
                Ver todo →
              </Link>
            </div>

            {categories.length === 1 ? (
              /* Solo 1 */
              <Link href={`/productos?categoria=${categories[0].slug}`}
                className="group relative block overflow-hidden w-full"
                style={{ aspectRatio: '21/9' }}>
                {categories[0].image_url
                  ? <Image src={categories[0].image_url} alt={categories[0].name} fill sizes="100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  : <div className="h-full w-full" style={{ backgroundColor: `${store.color_text}10` }} />
                }
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-8 left-8">
                  <p className="text-3xl font-black uppercase text-white">{categories[0].name}</p>
                </div>
              </Link>
            ) : categories.length === 2 ? (
              /* 2 columnas iguales */
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <CategoryCard key={cat.id} cat={cat} store={store} ratio="4/5" size="50vw" />
                ))}
              </div>
            ) : (
              /* 3+ — primera grande, resto en fila */
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  {categories.slice(0, 2).map(cat => (
                    <CategoryCard key={cat.id} cat={cat} store={store} ratio="4/5" size="50vw" />
                  ))}
                </div>
                {categories.length > 2 && (
                  <div className={`grid gap-3`}
                    style={{ gridTemplateColumns: `repeat(${Math.min(categories.length - 2, 5)}, 1fr)` }}>
                    {categories.slice(2, 7).map(cat => (
                      <CategoryCard key={cat.id} cat={cat} store={store} ratio="3/4" size="20vw" small />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══ DESTACADOS ═══════════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="px-5 pb-16 md:px-10 md:pb-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.35em] mb-1.5 opacity-30"
                  style={{ color: store.color_text }}>
                  Selección
                </p>
                <h2 className="text-2xl font-black uppercase tracking-tight"
                  style={{ color: store.color_text }}>
                  Destacados
                </h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: store.color_text }}>
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {featured.slice(0, 8).map((p, i) => (
                <AthleticProductCard key={p.id} product={p} store={store} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ EDITORIAL SPLIT ══════════════════════════════════════════════════ */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="grid md:grid-cols-2" style={{ minHeight: '600px' }}>
          {/* Foto */}
          <div className="relative overflow-hidden" style={{ minHeight: '440px' }}>
            <Image src={editorialSrc} alt="Editorial" fill sizes="50vw"
              className="object-cover object-center" />
          </div>
          {/* Texto */}
          <div className="flex flex-col justify-center px-10 py-16 md:px-14 lg:px-20"
            style={{ backgroundColor: store.color_primary }}>
            {store.home_editorial_label && (
              <p className="text-[8px] font-bold uppercase tracking-[0.5em] mb-6"
                style={{ color: store.color_accent ?? `${store.color_background}60` }}>
                {store.home_editorial_label}
              </p>
            )}
            <h2 className="font-black uppercase leading-[0.9] mb-7"
              style={{
                color: store.color_background,
                fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                letterSpacing: '-0.02em',
              }}>
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="text-sm leading-relaxed mb-10 max-w-sm"
                style={{ color: `${store.color_background}60` }}>
                {store.home_editorial_body}
              </p>
            )}
            <Link href="/productos"
              className="inline-block self-start px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-85"
              style={{ backgroundColor: store.color_background, color: store.color_primary }}>
              Explorar colección
            </Link>
          </div>
        </section>
      )}

      {/* ══ NUEVA TEMPORADA ══════════════════════════════════════════════════ */}
      {products.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-8 px-5 md:px-10">
              <h2 className="text-2xl font-black uppercase tracking-tight"
                style={{ color: store.color_text }}>
                Nueva temporada
              </h2>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: store.color_text }}>
                Ver todo →
              </Link>
            </div>

            {/* Mobile: scroll horizontal */}
            <div className="flex gap-3 overflow-x-auto px-5 pb-2 md:hidden no-scrollbar"
              style={{ scrollSnapType: 'x mandatory' }}>
              {products.slice(0, 10).map(p => (
                <div key={p.id} className="w-[55vw] shrink-0" style={{ scrollSnapAlign: 'start' }}>
                  <AthleticProductCard product={p} store={store} />
                </div>
              ))}
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid grid-cols-4 gap-x-3 gap-y-12 px-10">
              {products.slice(0, 8).map((p, i) => (
                <AthleticProductCard key={p.id} product={p} store={store} priority={i < 4} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ TRUST — línea horizontal minimal ═════════════════════════════════ */}
      <section className="px-5 py-12 md:px-10 border-t border-b"
        style={{ borderColor: `${store.color_text}08` }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              ),
              title: 'Envío express',
              desc: '24hs CABA y GBA',
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
              ),
              title: 'Cambios gratis',
              desc: 'Hasta 30 días',
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              ),
              title: 'Pago seguro',
              desc: 'MercadoPago',
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24">
                  <rect x="1" y="3" width="15" height="13" rx="1"/>
                  <path d="M16 8h5l3 5v3h-8V8z"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              ),
              title: 'Envío gratis',
              desc: store.free_shipping_threshold
                ? `Compras +${formatPrice(store.free_shipping_threshold, store.currency, store.locale)}`
                : 'Consultá condiciones',
            },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center text-center gap-3">
              <div className="opacity-30" style={{ color: store.color_text }}>{item.icon}</div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em]"
                  style={{ color: store.color_text }}>
                  {item.title}
                </p>
                <p className="text-[10px] mt-0.5 opacity-35" style={{ color: store.color_text }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ NEWSLETTER ═══════════════════════════════════════════════════════ */}
      <section className="px-5 py-24 md:px-10" style={{ backgroundColor: store.color_primary }}>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.5em] mb-5"
            style={{ color: store.color_accent ?? `${store.color_background}50` }}>
            Club {store.name}
          </p>
          <h2 className="font-black uppercase leading-[0.9] mb-4"
            style={{
              color: store.color_background,
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              letterSpacing: '-0.02em',
            }}>
            Primero te enterás vos
          </h2>
          <p className="text-sm mb-10 leading-relaxed"
            style={{ color: `${store.color_background}45` }}>
            Nuevos drops, descuentos y lanzamientos exclusivos. Sin spam.
          </p>
          <NewsletterForm store={store} dark />
        </div>
      </section>

    </div>
  )
}

/* ── Category card helper ───────────────────────────────────────────────── */
function CategoryCard({
  cat, store, ratio, size, small = false,
}: {
  cat: { id: string; slug: string; name: string; image_url?: string | null }
  store: StoreConfig
  ratio: string
  size: string
  small?: boolean
}) {
  return (
    <Link href={`/productos?categoria=${cat.slug}`}
      className="group relative block overflow-hidden"
      style={{ aspectRatio: ratio }}>
      <div className="absolute inset-0">
        {cat.image_url
          ? <Image src={cat.image_url} alt={cat.name} fill sizes={size}
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]" />
          : <div className="h-full w-full" style={{ backgroundColor: `${store.color_text}10` }} />
        }
      </div>
      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/28 transition-colors duration-400" />
      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
        <p className={`font-black uppercase text-white leading-none ${small ? 'text-sm' : 'text-xl md:text-2xl'}`}>
          {cat.name}
        </p>
        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white/50
          translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Ver colección →
        </p>
      </div>
      {/* Accent line bottom */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: store.color_accent ?? store.color_background }} />
    </Link>
  )
}
