import Image from 'next/image'
import Link from 'next/link'
import { LibreriaProductCard } from './LibreriaProductCard'
import { FadeUp, SlideLeft, SlideRight, StaggerGrid, StaggerItem } from '@/components/store/motion'
import type { Product, StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  products: Product[]
  categories: Category[]
  featured: Product[]
}

const GENRE_STYLES = [
  { icon: '🔮', bg: '#3D2314', color: '#E8C99A' },
  { icon: '🧠', bg: '#1E2D3D', color: '#A8C4D8' },
  { icon: '🧸', bg: '#2D3B1E', color: '#BCDBA8' },
  { icon: '✍️', bg: '#3B1E2D', color: '#D8A8C4' },
  { icon: '🏛️', bg: '#2D2D1E', color: '#D8D4A8' },
  { icon: '🌱', bg: '#1E3B2D', color: '#A8D8C4' },
]

export function LibreriaHomePage({ store, products, categories, featured }: Props) {
  const ACCENT  = store.color_accent
  const BG      = store.color_background
  const TEXT    = store.color_text
  const PRIMARY = store.color_primary

  const novedades   = products.filter(p => p.tags?.some(t => /novedad|nuevo|reciente/i.test(t))).slice(0, 6)
  const bestsellers = products.filter(p => p.tags?.some(t => /bestseller/i.test(t))).slice(0, 6)
  const featuredBooks = featured.length ? featured.slice(0, 8) : products.slice(0, 8)
  const showcaseBook  = featuredBooks[0]

  return (
    <div style={{ backgroundColor: BG, color: TEXT }}>

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[560px] md:min-h-[680px] flex items-center" style={{ backgroundColor: PRIMARY }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

        {store.hero_image_url && (
          <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block opacity-25">
            <Image src={store.hero_image_url} alt="Hero" fill priority sizes="50vw" className="object-cover object-center" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${PRIMARY} 0%, transparent 60%)` }} />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <FadeUp delay={0.05}>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6" style={{ color: ACCENT }}>
                {store.hero_subtitle ?? 'Tu próxima historia te espera'}
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-6" style={{ color: BG, fontFamily: 'Georgia, serif' }}>
                {store.hero_title ?? 'El mundo cabe en un libro'}
              </h1>
            </FadeUp>
            <FadeUp delay={0.28}>
              <p className="text-base mb-8 max-w-md leading-relaxed" style={{ color: 'rgba(250,246,239,0.6)' }}>
                Más de 10.000 títulos para cada lector. Ficción, ensayo, infantil y todo lo que te inspire.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="flex flex-wrap gap-3">
                <Link href="/productos" className="inline-block px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] transition-opacity hover:opacity-80"
                  style={{ backgroundColor: ACCENT, color: BG }}>
                  Explorar catálogo
                </Link>
                <Link href="/productos" className="inline-block px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:bg-white/10"
                  style={{ color: BG, border: '1px solid rgba(250,246,239,0.25)' }}>
                  Novedades
                </Link>
              </div>
            </FadeUp>
          </div>

          {showcaseBook && (
            <FadeUp delay={0.2} className="hidden md:flex justify-center">
              <Link href={`/productos/${showcaseBook.slug}`} className="group relative">
                <div className="relative rounded-sm overflow-hidden transition-transform duration-500 group-hover:scale-105"
                  style={{ width: 200, aspectRatio: '2/3', boxShadow: '12px 16px 40px rgba(0,0,0,0.5), -4px 0 0 rgba(0,0,0,0.3)' }}>
                  {showcaseBook.images?.[0] ? (
                    <Image src={showcaseBook.images[0]} alt={showcaseBook.name} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-end justify-end p-5"
                      style={{ background: `linear-gradient(135deg, ${ACCENT}44, ${ACCENT}88)`, borderLeft: `8px solid ${ACCENT}` }}>
                      <p className="text-sm font-black text-right leading-tight" style={{ color: BG, fontFamily: 'Georgia, serif' }}>{showcaseBook.name}</p>
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs font-bold" style={{ color: BG }}>{showcaseBook.name}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'rgba(250,246,239,0.5)' }}>Libro destacado</p>
                </div>
              </Link>
            </FadeUp>
          )}
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="border-b" style={{ backgroundColor: `${TEXT}08`, borderColor: `${TEXT}12` }}>
        <div className="max-w-5xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '📦', label: 'Envío a todo el país' },
            { icon: '🔒', label: 'Pago 100% seguro' },
            { icon: '↩️', label: 'Cambios sin costo' },
            { icon: '📖', label: '+10.000 títulos' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2.5">
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: `${TEXT}80` }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GÉNEROS */}
      <section className="px-6 md:px-10 py-14 md:py-16 max-w-7xl mx-auto">
        <FadeUp className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>Explorar por género</p>
            <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'Georgia, serif' }}>¿Qué querés leer hoy?</h2>
          </div>
          <Link href="/productos" className="text-xs font-semibold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Ver todo →</Link>
        </FadeUp>
        <StaggerGrid className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.slice(0, 6).map((cat, idx) => {
            const style = GENRE_STYLES[idx] ?? GENRE_STYLES[0]
            return (
              <StaggerItem key={cat.id}>
                <Link href={`/productos?categoria=${cat.slug}`}
                  className="group flex flex-col items-center gap-3 p-4 rounded-lg transition-all hover:scale-[1.03]"
                  style={{ backgroundColor: style.bg, border: `1px solid ${style.color}22` }}>
                  <span className="text-3xl">{style.icon}</span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-center" style={{ color: style.color }}>{cat.name}</span>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGrid>
      </section>

      {/* NOVEDADES */}
      {(novedades.length > 0 || featuredBooks.length > 0) && (
        <section className="px-6 md:px-10 py-14 md:py-16 max-w-7xl mx-auto">
          <FadeUp className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>Recién llegados</p>
              <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'Georgia, serif' }}>Novedades</h2>
            </div>
            <Link href="/productos" className="text-xs font-semibold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Ver todas →</Link>
          </FadeUp>
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {(novedades.length > 0 ? novedades : featuredBooks).slice(0, 6).map(p => (
              <StaggerItem key={p.id}>
                <LibreriaProductCard product={p} store={store} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {/* EDITORIAL SPLIT */}
      <section className="grid md:grid-cols-2 min-h-[500px]">
        <SlideLeft className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
          <Image src={store.home_split_image_url ?? 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=85'}
            alt="Librería" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-center" />
        </SlideLeft>
        <SlideRight className="flex flex-col justify-center px-10 md:px-16 py-16" style={{ backgroundColor: PRIMARY }}>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: ACCENT }}>
            {store.home_editorial_label ?? 'Nuestra filosofía'}
          </p>
          <h2 className="text-4xl md:text-5xl font-black leading-[1.1] mb-6" style={{ color: BG, fontFamily: 'Georgia, serif' }}>
            {store.home_editorial_title ?? 'Cada libro es una puerta a otro mundo'}
          </h2>
          <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: 'rgba(250,246,239,0.55)' }}>
            {store.home_editorial_body ?? 'Seleccionamos cuidadosamente cada título pensando en lectores de todas las edades e intereses.'}
          </p>
          <Link href="/productos" className="w-fit px-8 py-3.5 text-[11px] font-black uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
            style={{ border: '1px solid rgba(250,246,239,0.3)', color: BG }}>
            Descubrir el catálogo
          </Link>
        </SlideRight>
      </section>

      {/* BESTSELLERS */}
      {(bestsellers.length > 0 || featuredBooks.length > 0) && (
        <section className="px-6 md:px-10 py-14 md:py-16" style={{ backgroundColor: `${TEXT}05` }}>
          <div className="max-w-7xl mx-auto">
            <FadeUp className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>Los más populares</p>
                <h2 className="text-3xl md:text-4xl font-black" style={{ fontFamily: 'Georgia, serif' }}>Bestsellers</h2>
              </div>
              <Link href="/productos" className="text-xs font-semibold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">Ver todos →</Link>
            </FadeUp>
            <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {(bestsellers.length > 0 ? bestsellers : featuredBooks.slice(0, 6)).map(p => (
                <StaggerItem key={p.id}>
                  <LibreriaProductCard product={p} store={store} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* QUOTE */}
      <section className="px-6 py-20 text-center" style={{ backgroundColor: `${ACCENT}15` }}>
        <FadeUp>
          <div className="text-6xl mb-6 opacity-30" style={{ color: ACCENT, fontFamily: 'Georgia, serif' }}>"</div>
          <blockquote className="text-2xl md:text-3xl font-bold max-w-2xl mx-auto leading-snug mb-6" style={{ fontFamily: 'Georgia, serif', color: TEXT }}>
            Una habitación sin libros es como un cuerpo sin alma.
          </blockquote>
          <cite className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: `${TEXT}60` }}>— Marco Tulio Cicerón</cite>
        </FadeUp>
      </section>

      {/* NEWSLETTER */}
      <section className="px-6 py-20" style={{ backgroundColor: PRIMARY }}>
        <FadeUp className="max-w-xl mx-auto text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] mb-3" style={{ color: ACCENT }}>Club de lectores</p>
          <h2 className="text-4xl font-black mb-4 leading-tight" style={{ color: BG, fontFamily: 'Georgia, serif' }}>Unite a nuestra comunidad</h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(250,246,239,0.55)' }}>Recibí recomendaciones, novedades y descuentos exclusivos.</p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
            <input type="email" placeholder="tu@email.com" className="flex-1 px-4 py-3 text-sm outline-none rounded-none"
              style={{ backgroundColor: 'rgba(250,246,239,0.1)', color: BG, border: '1px solid rgba(250,246,239,0.2)' }} />
            <button type="submit" className="px-7 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACCENT, color: BG }}>
              Suscribirme
            </button>
          </form>
          <p className="mt-3 text-[9px]" style={{ color: 'rgba(250,246,239,0.3)' }}>10% de descuento en tu primera compra. Sin spam.</p>
        </FadeUp>
      </section>
    </div>
  )
}
