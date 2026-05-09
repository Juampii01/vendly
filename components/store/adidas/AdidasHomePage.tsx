import Image from 'next/image'
import Link from 'next/link'
import { NewsletterForm } from '@/components/store/NewsletterForm'
import type { StoreConfig, Category, Product } from '@/types'

/**
 * ADIDAS — Flagship custom home (portfolio centerpiece de Vendly).
 *
 * Esta NO es una variante del template athletic config-driven. Es un build
 * dedicado con layout cinematográfico, tipografía monumental y momentos de
 * marca. El objetivo: cuando un prospect llegue a adidas.vendly-mod.space,
 * piense "esta calidad es la que quiero para mi marca".
 *
 * Ruteado desde app/(store)/page.tsx con `if (store.slug === 'adidas')` antes
 * del fallback site_type.
 *
 * Si los products de DB están vacíos, usa fallbacks hardcoded (DEMO_PRODUCTS)
 * para que el showcase nunca se vea pobre.
 */

interface Props {
  store: StoreConfig
  products: Product[]
  featured: Product[]
  categories: Category[]
}

// ─── Demo content (fallback) ────────────────────────────────────────────────
// Productos visuales para que el showcase siempre se vea full. Si la DB de
// Adidas tiene productos reales con imágenes decentes, los usamos.

interface ShowcaseProduct {
  name: string
  category: string
  price: string
  image: string
  badge?: string
}

const DEMO_PRODUCTS: ShowcaseProduct[] = [
  { name: 'Speedline Pro 9',  category: 'Running',     price: '$229.000', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=85', badge: 'NUEVO' },
  { name: 'Court Classic Vintage', category: 'Originals', price: '$185.000', image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=900&q=85' },
  { name: 'Stride 24',         category: 'Training',    price: '$195.000', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=900&q=85' },
  { name: 'Court Pro Black',   category: 'Basketball',  price: '$249.000', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=900&q=85', badge: 'EDICIÓN' },
  { name: 'Track Crew Negro',  category: 'Apparel',     price: '$89.000',  image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&q=85' },
  { name: 'Performance Tee',   category: 'Apparel',     price: '$45.000',  image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=85' },
  { name: 'Goalkeeper Pro',    category: 'Football',    price: '$215.000', image: 'https://images.unsplash.com/photo-1487956382158-bb926046304a?w=900&q=85' },
  { name: 'Backpack Tech 24L', category: 'Accesorios',  price: '$72.000',  image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85' },
]

const SPORTS = [
  { name: 'RUNNING',     image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=85', tag: '01' },
  { name: 'FOOTBALL',    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&q=85', tag: '02' },
  { name: 'BASKETBALL',  image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&q=85', tag: '03' },
  { name: 'TRAINING',    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=85', tag: '04' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

const RED = '#FF3A20'

// ── 3-stripes mark (geométrico, no infringe trademark) ────────────────────
function ThreeStripes({ color = '#000', size = 'md' }: { color?: string; size?: 'sm' | 'md' | 'lg' }) {
  const heights = size === 'lg' ? ['h-8', 'h-12', 'h-16'] : size === 'sm' ? ['h-3', 'h-5', 'h-7'] : ['h-5', 'h-8', 'h-11']
  return (
    <div className="inline-flex items-end gap-[3px]">
      {heights.map((h, i) => (
        <span key={i} className={`block w-[3px] ${h}`} style={{ backgroundColor: color }} />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────

export function AdidasHomePage({ store, products }: Props) {
  const heroSrc = store.hero_image_url ?? 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1800&q=85'
  const useDemoProducts = !products?.length || products.every(p => !p.images?.[0])
  const showcaseGrid: ShowcaseProduct[] = useDemoProducts
    ? DEMO_PRODUCTS
    : products.slice(0, 8).map(p => ({
        name: p.name.toUpperCase(),
        category: p.category?.name ?? 'Producto',
        price: `$${p.price.toLocaleString('es-AR')}`,
        image: p.images[0],
      }))

  return (
    <div style={{ backgroundColor: '#FFFFFF', color: '#000' }}>

      {/* ════════ HERO — CINEMATIC FULL-BLEED ═══════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: '100svh', minHeight: '700px', backgroundColor: '#000' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" style={{ opacity: 0.7 }} />

        {/* Cinematic gradient */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(115deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.1) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 45%)' }} />

        {/* Tickmark / scroll indicator left */}
        <div className="absolute left-6 md:left-10 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-3 z-10">
          <div className="w-px h-24 bg-white/30" />
          <span className="text-white/40 text-[9px] font-black tracking-[0.4em] [writing-mode:vertical-lr] uppercase">Scroll</span>
        </div>

        {/* Side label */}
        <div className="absolute right-6 md:right-10 top-32 md:top-40 z-10 flex items-center gap-3">
          <span className="text-white/40 text-[9px] font-black tracking-[0.45em] uppercase hidden md:block">Colección 2026</span>
          <ThreeStripes color="#fff" size="sm" />
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-20 md:pb-28 px-8 md:px-16 lg:px-20">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-7">
              <span className="text-[10px] font-black uppercase tracking-[0.45em] px-3 py-1.5"
                style={{ backgroundColor: RED, color: '#fff' }}>
                Nuevo drop
              </span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">Spring · Verano · 2026</span>
            </div>

            <h1 className="font-black uppercase text-white leading-[0.82] mb-9"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 11rem)', letterSpacing: '-0.04em' }}>
              {store.hero_title || 'IMPOSSIBLE\nIS NOTHING'}
            </h1>

            <p className="text-white/65 text-base md:text-lg max-w-md mb-10 leading-relaxed">
              Equipo técnico para los que no se conforman. Diseñado por atletas, probado en cancha.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/productos"
                className="inline-flex items-center gap-3 px-10 py-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:gap-5"
                style={{ backgroundColor: '#fff', color: '#000' }}>
                Comprar ahora
                <span>→</span>
              </Link>
              <Link href="/productos?categoria=running"
                className="inline-flex items-center gap-3 px-10 py-5 text-[10px] font-black uppercase tracking-[0.25em] border text-white transition-colors hover:bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                Ver running
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom-left brand mark */}
        <div className="absolute bottom-8 right-8 hidden md:flex items-center gap-3 text-white/40">
          <ThreeStripes color="#fff" size="sm" />
          <span className="text-[9px] font-black tracking-[0.4em] uppercase">{store.name || 'Adidas'}</span>
        </div>
      </section>

      {/* ════════ TICKER ════════════════════════════════════════════════════ */}
      <div className="overflow-hidden py-5 border-y border-black/10" style={{ backgroundColor: '#000' }}>
        <style>{`
          @keyframes adidas-mq{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
          .adidas-mq{display:flex;width:max-content;animation:adidas-mq 38s linear infinite;}
        `}</style>
        <div className="adidas-mq">
          {[0, 1].map(i => (
            <span key={i} className="flex shrink-0 items-center text-white text-2xl md:text-4xl font-black uppercase tracking-[-0.02em]">
              {['Running', 'Football', 'Basketball', 'Training', 'Originals', 'Performance', 'Lifestyle', 'Kids'].map((t, j) => (
                <span key={j} className="mx-8 flex items-center gap-8">
                  {t}
                  <span style={{ color: RED }}>×</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ════════ SPORTS GRID — 4 cards monumentales ══════════════════════ */}
      <section className="px-4 md:px-8 py-20 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-end justify-between mb-10 md:mb-14">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.45em] mb-3" style={{ color: RED }}>
                Por deporte
              </p>
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-[-0.04em]">
                Encontrá lo tuyo
              </h2>
            </div>
            <Link href="/productos" className="hidden md:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] hover:gap-3 transition-all">
              Ver todos los deportes <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {SPORTS.map(sport => (
              <Link key={sport.name} href={`/productos?categoria=${sport.name.toLowerCase()}`}
                className="group relative block overflow-hidden" style={{ aspectRatio: '3/4', backgroundColor: '#000' }}>
                <Image src={sport.image} alt={sport.name} fill sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.06]"
                  style={{ filter: 'grayscale(0.85) contrast(1.05)' }} />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                {/* Tag */}
                <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
                  {sport.tag} / 04
                </span>
                {/* Title */}
                <div className="absolute inset-x-4 bottom-4 md:bottom-5">
                  <p className="text-white font-black uppercase tracking-[-0.03em] leading-[0.85]"
                    style={{ fontSize: 'clamp(1.5rem, 3.5vw, 3rem)' }}>
                    {sport.name}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/70 group-hover:text-white transition-colors">
                      Comprar →
                    </span>
                    <ThreeStripes color={RED} size="sm" />
                  </div>
                </div>
                {/* Top accent bar reveals on hover */}
                <div className="absolute top-0 left-0 right-0 h-[3px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
                  style={{ backgroundColor: RED }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ PRODUCT SPOTLIGHT ═════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#F5F4F0' }}>
        <div className="grid lg:grid-cols-2 min-h-[70vh]">
          {/* Image side */}
          <div className="relative order-2 lg:order-1 overflow-hidden" style={{ minHeight: '500px' }}>
            <Image src={DEMO_PRODUCTS[0].image} alt="Spotlight product" fill sizes="(max-width:1024px) 100vw, 50vw"
              className="object-cover object-center" />
            {/* Tech callouts */}
            <div className="absolute top-12 left-12 hidden md:flex items-center gap-3">
              <div className="h-px w-12" style={{ backgroundColor: '#000' }} />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Boost cushioning</span>
            </div>
            <div className="absolute bottom-1/3 right-12 hidden md:flex flex-col items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Primeknit upper</span>
                <div className="h-px w-12" style={{ backgroundColor: '#000' }} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Continental rubber</span>
                <div className="h-px w-8" style={{ backgroundColor: '#000' }} />
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="relative order-1 lg:order-2 flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20">
            <div className="flex items-center gap-3 mb-6">
              <ThreeStripes color={RED} size="sm" />
              <p className="text-[10px] font-black uppercase tracking-[0.45em]" style={{ color: RED }}>
                Pieza del mes
              </p>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-black/50">
              Running · 2026
            </p>

            <h2 className="font-black uppercase leading-[0.82] mb-7"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.04em' }}>
              SPEEDLINE<br/>PRO 9
            </h2>

            <p className="text-base text-black/65 leading-relaxed max-w-md mb-10">
              Construida para los que persiguen el segundo. Cushion responsivo,
              upper de tejido reforzado y suela Continental. Hecha para correr más rápido.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-10 max-w-md">
              <div>
                <p className="text-3xl font-black tracking-tight">7.4</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/50 mt-0.5">Drop (mm)</p>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight">280</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/50 mt-0.5">Peso (g)</p>
              </div>
              <div>
                <p className="text-3xl font-black tracking-tight">42</p>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/50 mt-0.5">Talles disp.</p>
              </div>
            </div>

            <div className="flex items-baseline gap-4 mb-7">
              <span className="text-3xl font-black">$229.000</span>
              <span className="text-sm text-black/40 line-through">$259.000</span>
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1" style={{ backgroundColor: RED, color: '#fff' }}>
                -12%
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/productos"
                className="inline-flex items-center gap-3 px-9 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:gap-5"
                style={{ backgroundColor: '#000', color: '#fff' }}>
                Comprar — $229.000
                <span>→</span>
              </Link>
              <Link href="/productos"
                className="inline-flex items-center gap-3 px-9 py-4 text-[10px] font-black uppercase tracking-[0.25em] border border-black/30 transition-colors hover:bg-black hover:text-white">
                Ver detalle
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ COLLECTION GRID — 8 PRODUCTS ════════════════════════════ */}
      <section className="px-4 md:px-8 py-20 md:py-28">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex items-end justify-between mb-10 md:mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.45em] mb-3" style={{ color: RED }}>
                Lo más buscado
              </p>
              <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-[-0.04em]">
                Top performers
              </h2>
            </div>
            <Link href="/productos" className="hidden md:inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] hover:gap-3 transition-all">
              Ver toda la colección <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-12 md:gap-y-16">
            {showcaseGrid.slice(0, 8).map(p => (
              <Link key={p.name} href="/productos" className="group block">
                <div className="relative overflow-hidden mb-4" style={{ aspectRatio: '1/1', backgroundColor: '#F5F4F0' }}>
                  <Image src={p.image} alt={p.name} fill sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.05]" />
                  {p.badge && (
                    <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-[0.25em] px-2 py-1"
                      style={{ backgroundColor: '#000', color: '#fff' }}>
                      {p.badge}
                    </span>
                  )}
                  <div className="absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                    style={{ backgroundColor: '#000', color: '#fff' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                </div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/50 mb-1">{p.category}</p>
                <p className="text-sm font-bold uppercase tracking-tight mb-1">{p.name}</p>
                <p className="text-sm font-black">{p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ EDITORIAL — TECH STORY ═══════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#0A0A0A' }}>
        <div className="grid lg:grid-cols-[1.2fr_1fr] min-h-[600px]">
          {/* Image side */}
          <div className="relative overflow-hidden" style={{ minHeight: '500px' }}>
            <Image src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1600&q=85"
              alt="Performance" fill sizes="(max-width:1024px) 100vw, 60vw"
              className="object-cover object-center" />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, rgba(10,10,10,0) 60%, rgba(10,10,10,0.85) 100%)' }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.7) 0%, transparent 30%, transparent 70%, rgba(10,10,10,0.6) 100%)' }} />

            {/* Quote overlay */}
            <div className="absolute bottom-12 left-12 max-w-md hidden md:block">
              <p className="text-2xl md:text-3xl font-black uppercase text-white leading-[0.95] tracking-[-0.03em] mb-3">
                "El segundo no se gana<br/>en la pista. Se gana<br/>en el laboratorio."
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                — Maria Tellez, Performance Lab
              </p>
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-20" style={{ backgroundColor: '#0A0A0A' }}>
            <div className="flex items-center gap-3 mb-6">
              <ThreeStripes color={RED} size="sm" />
              <p className="text-[10px] font-black uppercase tracking-[0.45em]" style={{ color: RED }}>
                Tecnología
              </p>
            </div>

            <h2 className="font-black uppercase text-white leading-[0.82] mb-8"
              style={{ fontSize: 'clamp(2.4rem, 5vw, 4.5rem)', letterSpacing: '-0.04em' }}>
              POWERED BY<br/><span style={{ color: RED }}>LIGHTSTRIKE PRO</span>
            </h2>

            <p className="text-white/60 text-base leading-relaxed mb-10">
              Nuestra espuma más liviana y responsiva. Probada en condiciones reales con
              atletas profesionales en pista olímpica. 18% más retorno energético que la
              generación anterior.
            </p>

            <div className="space-y-4 mb-10 border-t border-white/10 pt-7">
              {[
                { label: 'Retorno energético', value: '+18%' },
                { label: 'Reducción de peso',   value: '-22%' },
                { label: 'Durabilidad estimada', value: '800 km' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline justify-between">
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/45">{label}</span>
                  <span className="text-2xl font-black text-white">{value}</span>
                </div>
              ))}
            </div>

            <Link href="/productos"
              className="inline-flex items-center gap-3 self-start px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-colors hover:bg-white hover:text-black border border-white/40 text-white">
              Leer la historia <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════ THREE STRIPES BRAND MOMENT ═══════════════════════════════ */}
      <section className="relative overflow-hidden py-32 md:py-44 px-6" style={{ backgroundColor: '#000' }}>
        {/* Massive negative-space typography */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-black uppercase whitespace-nowrap tracking-[-0.05em] leading-none text-white/[0.04]"
            style={{ fontSize: 'clamp(15rem, 35vw, 35rem)' }}>
            {(store.name || 'Adidas').toUpperCase()}
          </span>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-7 px-4 py-1.5 border" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
            <ThreeStripes color="#fff" size="sm" />
            <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/60">Desde 1949</span>
          </div>

          <h2 className="font-black uppercase text-white leading-[0.82] mb-7"
            style={{ fontSize: 'clamp(3rem, 9vw, 9rem)', letterSpacing: '-0.04em' }}>
            HECHO PARA<br/>
            <span style={{ color: RED }}>SUPERARSE.</span>
          </h2>

          <p className="text-white/55 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Tres rayas. Una marca. Un compromiso con los que no se rinden.
            Cada producto que sale de nuestra línea tiene una historia de superación detrás.
          </p>

          <Link href="/productos"
            className="inline-flex items-center gap-3 px-10 py-5 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:gap-5"
            style={{ backgroundColor: RED, color: '#fff' }}>
            Conocer la marca <span>→</span>
          </Link>
        </div>
      </section>

      {/* ════════ MEMBERS / ADICLUB ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 px-4 md:px-8" style={{ backgroundColor: '#F5F4F0' }}>
        <div className="mx-auto max-w-[1400px]">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 border border-black/10">
                <ThreeStripes color="#000" size="sm" />
                <span className="text-[9px] font-black uppercase tracking-[0.45em] text-black/55">Programa exclusivo</span>
              </div>
              <h2 className="font-black uppercase leading-[0.85] mb-7"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.04em' }}>
                Sumate al<br/>club.
              </h2>
              <p className="text-base text-black/60 leading-relaxed mb-9 max-w-md">
                Acceso prioritario a drops, descuentos exclusivos para miembros,
                envío gratis siempre y eventos privados. Sin costo. Solo para los que
                quieren más.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-9 max-w-lg">
                {[
                  { value: '24h', label: 'Antes que nadie' },
                  { value: '15%', label: 'Descuento miembros' },
                  { value: '0$',  label: 'Envío gratis' },
                ].map(({ value, label }) => (
                  <div key={label} className="border-l-2 border-black pl-3">
                    <p className="text-3xl font-black tracking-tight">{value}</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-black/50 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <Link href="/cuenta"
                className="inline-flex items-center gap-3 px-9 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:gap-5"
                style={{ backgroundColor: '#000', color: '#fff' }}>
                Crear cuenta — gratis <span>→</span>
              </Link>
            </div>

            <div className="relative" style={{ aspectRatio: '4/5' }}>
              <Image src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=85"
                alt="Members" fill sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover object-center" />
              {/* Stat overlay */}
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3">
                <div className="px-5 py-4" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)' }}>
                  <p className="text-2xl font-black text-white tracking-tight">4.8M+</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 mt-1">Miembros activos</p>
                </div>
                <div className="px-5 py-4" style={{ backgroundColor: 'rgba(255,58,32,0.95)', backdropFilter: 'blur(20px)' }}>
                  <p className="text-2xl font-black text-white tracking-tight">120+</p>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80 mt-1">Drops por año</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ NEWSLETTER ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 md:py-32 px-6" style={{ backgroundColor: '#000' }}>
        <Image src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1800&q=85"
          alt="" fill sizes="100vw" className="object-cover object-center"
          style={{ opacity: 0.18, filter: 'grayscale(0.5)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.95), rgba(0,0,0,0.7), rgba(0,0,0,0.95))' }} />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6">
            <ThreeStripes color="#fff" size="sm" />
            <span className="text-[10px] font-black uppercase tracking-[0.45em] text-white/55">Newsletter</span>
            <ThreeStripes color="#fff" size="sm" />
          </div>
          <h2 className="font-black uppercase text-white leading-[0.85] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.04em' }}>
            STAY<br/>AHEAD.
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-9 max-w-md mx-auto">
            Drops, descuentos y lanzamientos antes que nadie. Cero spam.
            Una vez por semana, máximo.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm store={store} dark />
          </div>
        </div>
      </section>

      {/* ════════ TRUST BAR ═══════════════════════════════════════════════ */}
      <section className="border-y border-black/10 py-12 px-6 bg-white">
        <div className="mx-auto max-w-[1600px] grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8">
          {[
            { title: 'Envío gratis', desc: 'Compras +$50.000', n: '01' },
            { title: 'Cambios 30 días', desc: 'Sin preguntas',    n: '02' },
            { title: 'Pago seguro',   desc: 'MercadoPago',         n: '03' },
            { title: 'Calidad pro',   desc: 'Garantía 1 año',      n: '04' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30 mt-0.5">{item.n}</span>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">{item.title}</p>
                <p className="text-[11px] text-black/55 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
