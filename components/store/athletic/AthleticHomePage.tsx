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

const HERO_FALLBACK   = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=85'
const SPLIT_FALLBACK  = 'https://images.unsplash.com/photo-1520975916090-cfc2acebb9b8?w=1200&q=85'

export function AthleticHomePage({ store, products, featured, categories }: Props) {
  const heroSrc      = store.hero_image_url   ?? HERO_FALLBACK
  const editorialSrc = store.home_split_image_url ?? SPLIT_FALLBACK
  const rawItems     = store.home_marquee_items ?? []
  const marqueeItems = rawItems.length > 1
    ? rawItems.slice(1)
    : rawItems.length === 1
      ? [rawItems[0]]
      : ['Nueva colección', store.name.toUpperCase(), 'Envío a todo el país', 'Esencia · Presencia · Estilo']

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>

      {/* ══ HERO — full screen ═══════════════════════════════════════════════ */}
      <section className="relative w-full" style={{ height: '100svh', minHeight: '600px' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 55%, transparent 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />

        <div className="absolute inset-0 flex flex-col justify-end pb-16 px-8 md:px-16 lg:px-24">
          {store.hero_subtitle && (
            <p className="mb-5 text-[9px] font-bold uppercase tracking-[0.45em]"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              {store.hero_subtitle}
            </p>
          )}
          <h1 className="font-black uppercase leading-[0.85] text-white mb-10"
            style={{ fontSize: 'clamp(4rem, 10vw, 9rem)', letterSpacing: '-0.03em' }}>
            {store.hero_title}
          </h1>
          <div className="flex flex-wrap gap-3">
            <Link href={store.hero_cta_url ?? '/productos'}
              className="inline-block px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:opacity-90"
              style={{ backgroundColor: store.color_background, color: store.color_primary }}>
              {store.hero_cta_label ?? 'Ver colección'}
            </Link>
            <Link href="/productos"
              className="inline-block px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 text-white transition-all hover:bg-white/10">
              Ver todo
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-3" style={{ backgroundColor: store.color_primary }}>
        <style>{`
          @keyframes ath-mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
          .ath-mq-track{display:flex;width:max-content;animation:ath-mq 28s linear infinite;}
        `}</style>
        <div className="ath-mq-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex shrink-0 items-center text-[9px] font-bold uppercase tracking-[0.3em]"
              style={{ color: store.color_background }}>
              {marqueeItems.map((t) => (
                <span key={t} className="mx-10 flex items-center gap-10">
                  {t}<span className="w-1 h-1 rounded-full opacity-40"
                    style={{ backgroundColor: store.color_background }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ══ CATEGORÍAS — full bleed ══════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section>
          {/* Header */}
          <div className="flex items-end justify-between px-8 md:px-16 pt-16 pb-6">
            <h2 className="text-xl font-black uppercase tracking-[0.04em]"
              style={{ color: store.color_text }}>Colecciones</h2>
            <Link href="/productos"
              className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: store.color_text }}>Ver todo →</Link>
          </div>

          {/* Grid de categorías */}
          {categories.length === 1 && (
            <CategoryCard cat={categories[0]} store={store} ratio="21/9" size="100vw" titleSize="text-4xl md:text-6xl" />
          )}

          {categories.length === 2 && (
            <div className="grid grid-cols-2">
              {categories.map(cat => (
                <CategoryCard key={cat.id} cat={cat} store={store} ratio="3/4" size="50vw" titleSize="text-2xl md:text-4xl" />
              ))}
            </div>
          )}

          {categories.length >= 3 && (
            <div className="flex flex-col">
              {/* Primera fila: primer elemento grande (2/3) + segundo (1/3) */}
              <div className="grid grid-cols-3">
                <div className="col-span-2">
                  <CategoryCard cat={categories[0]} store={store} ratio="4/3" size="66vw" titleSize="text-3xl md:text-5xl" />
                </div>
                <div className="col-span-1">
                  <CategoryCard cat={categories[1]} store={store} ratio="4/3" size="33vw" titleSize="text-xl md:text-3xl" />
                </div>
              </div>
              {/* Segunda fila: resto de categorías equitativas */}
              {categories.length > 2 && (
                <div className={`grid`}
                  style={{ gridTemplateColumns: `repeat(${Math.min(categories.length - 2, 4)}, 1fr)` }}>
                  {categories.slice(2, 6).map(cat => (
                    <CategoryCard key={cat.id} cat={cat} store={store} ratio="4/3" size="25vw" titleSize="text-lg md:text-2xl" />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ══ DESTACADOS ═══════════════════════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="px-8 md:px-16 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.4em] mb-2 opacity-30">Selección</p>
              <h2 className="text-xl font-black uppercase tracking-[0.04em]">Destacados</h2>
            </div>
            <Link href="/productos"
              className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: store.color_text }}>Ver todos →</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
            {featured.slice(0, 8).map((p, i) => (
              <AthleticProductCard key={p.id} product={p} store={store} priority={i < 4} />
            ))}
          </div>
        </section>
      )}

      {/* ══ EDITORIAL SPLIT ══════════════════════════════════════════════════ */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="grid md:grid-cols-2" style={{ minHeight: '560px' }}>
          <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
            <Image src={editorialSrc} alt="Editorial" fill sizes="50vw"
              className="object-cover object-center" />
          </div>
          <div className="flex flex-col justify-center px-10 py-16 md:px-14 lg:px-20"
            style={{ backgroundColor: store.color_primary }}>
            {store.home_editorial_label && (
              <p className="text-[8px] font-bold uppercase tracking-[0.5em] mb-6"
                style={{ color: store.color_accent ?? `${store.color_background}50` }}>
                {store.home_editorial_label}
              </p>
            )}
            <h2 className="font-black uppercase leading-[0.9] mb-7"
              style={{ color: store.color_background, fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}>
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="text-sm leading-relaxed mb-10 max-w-sm"
                style={{ color: `${store.color_background}55` }}>
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

      {/* ══ NUEVA TEMPORADA — full bleed grid ════════════════════════════════ */}
      {products.length > 0 && (
        <section className="py-20">
          <div className="flex items-end justify-between mb-10 px-8 md:px-16">
            <h2 className="text-xl font-black uppercase tracking-[0.04em]">Nueva temporada</h2>
            <Link href="/productos"
              className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-40 hover:opacity-100 transition-opacity"
              style={{ color: store.color_text }}>Ver todo →</Link>
          </div>

          {/* Mobile: scroll horizontal */}
          <div className="flex gap-4 overflow-x-auto px-8 pb-3 md:hidden"
            style={{ scrollSnapType: 'x mandatory' }}>
            {products.slice(0, 10).map(p => (
              <div key={p.id} className="w-[62vw] shrink-0" style={{ scrollSnapAlign: 'start' }}>
                <AthleticProductCard product={p} store={store} />
              </div>
            ))}
          </div>

          {/* Desktop: 3 col */}
          <div className="hidden md:grid grid-cols-3 gap-x-4 gap-y-14 px-8 md:px-16">
            {products.slice(0, 6).map((p, i) => (
              <AthleticProductCard key={p.id} product={p} store={store} priority={i < 3} />
            ))}
          </div>
        </section>
      )}

      {/* ══ TRUST ════════════════════════════════════════════════════════════ */}
      <div className="border-t border-b" style={{ borderColor: `${store.color_text}08` }}>
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0"
          style={{ '--tw-divide-opacity': '0.06' } as React.CSSProperties}>
          {[
            { icon: <TruckIcon />,  title: 'Envío express',  desc: '24hs CABA y GBA' },
            { icon: <ReturnIcon />, title: 'Cambios gratis', desc: 'Hasta 30 días' },
            { icon: <LockIcon />,   title: 'Pago seguro',    desc: 'MercadoPago' },
            {
              icon: <ShipIcon />,
              title: 'Envío gratis',
              desc: store.free_shipping_threshold
                ? `+${formatPrice(store.free_shipping_threshold, store.currency, store.locale)}`
                : 'Consultá condiciones',
            },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center justify-center text-center gap-3 py-10 px-6"
              style={{ borderColor: `${store.color_text}08` }}>
              <div className="opacity-25" style={{ color: store.color_text }}>{item.icon}</div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em]">{item.title}</p>
                <p className="text-[9px] mt-0.5 opacity-35">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ NEWSLETTER ═══════════════════════════════════════════════════════ */}
      <section className="px-8 py-28 md:px-16" style={{ backgroundColor: store.color_primary }}>
        <div className="max-w-lg mx-auto text-center">
          <p className="text-[8px] font-bold uppercase tracking-[0.5em] mb-5"
            style={{ color: store.color_accent ?? `${store.color_background}45` }}>
            Club {store.name}
          </p>
          <h2 className="font-black uppercase leading-[0.88] mb-4"
            style={{ color: store.color_background, fontSize: 'clamp(2.4rem, 5vw, 4rem)', letterSpacing: '-0.02em' }}>
            Primero te enterás vos
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: `${store.color_background}42` }}>
            Nuevos drops, descuentos y lanzamientos exclusivos. Sin spam.
          </p>
          <NewsletterForm store={store} dark />
        </div>
      </section>

    </div>
  )
}

/* ── Category Card ──────────────────────────────────────────────────────── */
function CategoryCard({
  cat, store, ratio, size, titleSize,
}: {
  cat: { id: string; slug: string; name: string; image_url?: string | null }
  store: StoreConfig
  ratio: string
  size: string
  titleSize: string
}) {
  const hasImage = !!cat.image_url

  return (
    <Link href={`/productos?categoria=${cat.slug}`}
      className="group relative block overflow-hidden w-full"
      style={{ aspectRatio: ratio }}>

      {/* Background: imagen real o fallback premium oscuro */}
      <div className="absolute inset-0">
        {hasImage ? (
          <Image src={cat.image_url!} alt={cat.name} fill sizes={size}
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          /* Fallback: panel oscuro con textura sutil */
          <div className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: store.color_primary }}>
            <p className={`${titleSize} font-black uppercase text-center leading-none px-4`}
              style={{ color: `${store.color_background}12`, letterSpacing: '-0.02em' }}>
              {cat.name}
            </p>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 transition-opacity duration-400"
        style={{ background: hasImage
          ? 'linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.08) 55%)'
          : 'rgba(0,0,0,0)' }} />

      {/* Accent line bottom on hover */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
        style={{ backgroundColor: store.color_accent ?? store.color_background }} />

      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        <p className={`${titleSize} font-black uppercase text-white leading-none`}>{cat.name}</p>
        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/0 group-hover:text-white/50 transition-colors duration-300">
          Ver colección →
        </p>
      </div>
    </Link>
  )
}

/* ── SVG Icons ──────────────────────────────────────────────────────────── */
function TruckIcon() {
  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
}
function ReturnIcon() {
  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
}
function LockIcon() {
  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
}
function ShipIcon() {
  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3m0 0h5l2 5v4h-2m-5-9v9m-7 0a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z"/></svg>
}
