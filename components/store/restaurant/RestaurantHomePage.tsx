import Image from 'next/image'
import Link from 'next/link'
import { RestaurantMenuItem } from './RestaurantMenuItem'
import type { StoreConfig, Product, Category } from '@/types'

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1800&q=85'
const ABOUT_IMG     = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=85'
const AMBIANCE_IMGS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=700&q=80',
  'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=700&q=80',
]

interface Props {
  store: StoreConfig
  products: Product[]
  categories: Category[]
  featured: Product[]
}

export function RestaurantHomePage({ store, products, categories, featured }: Props) {
  const heroImg = store.hero_image_url ?? HERO_FALLBACK
  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quisiera hacer una reserva.`
    : null

  // Marquee items
  const ticker = store.home_marquee_items?.length
    ? store.home_marquee_items
    : ['Abierto de martes a domingo', 'Carta de temporada', 'Vinos de autor', 'Reservas por WhatsApp']

  const tickerStr = [...ticker, ...ticker, ...ticker, ...ticker].map(t => `${t}   ·   `).join('')

  return (
    <div style={{ backgroundColor: '#0e0b06', color: '#f0ebe0' }}>

      {/* ══════════════════════════════════════
          HERO — pantalla completa
      ══════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] w-full overflow-hidden">
        <Image
          src={heroImg}
          alt={store.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Overlay oscuro en capas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Contenido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          {store.hero_subtitle && (
            <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.5em]"
              style={{ color: 'rgba(200,144,42,0.8)' }}>
              {store.hero_subtitle}
            </p>
          )}
          <h1
            className="mb-8 font-black uppercase leading-[0.85] tracking-tight"
            style={{ fontSize: 'clamp(5rem, 18vw, 16rem)', color: '#f0ebe0', letterSpacing: '-0.03em' }}
          >
            {store.hero_title}
          </h1>

          {/* Línea dorada */}
          <div className="mb-8 h-px w-20" style={{ backgroundColor: '#c8902a' }} />

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link
              href={store.hero_cta_url ?? '/productos'}
              className="px-10 py-3.5 text-[11px] font-black uppercase tracking-[0.25em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}
            >
              {store.hero_cta_label ?? 'Ver el menú'}
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="px-10 py-3.5 text-[11px] font-black uppercase tracking-[0.25em] transition-opacity hover:opacity-70 border"
                style={{ borderColor: 'rgba(240,235,224,0.3)', color: '#f0ebe0' }}>
                Reservar mesa
              </a>
            )}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-10 animate-[pulse_2s_ease-in-out_infinite]" style={{ backgroundColor: '#c8902a' }} />
          <p className="text-[9px] font-bold uppercase tracking-[0.4em]">Deslizá</p>
        </div>
      </section>

      {/* ══ Ticker ══ */}
      <div className="overflow-hidden py-3" style={{ backgroundColor: '#0a0704', borderTop: '1px solid rgba(200,144,42,0.15)', borderBottom: '1px solid rgba(200,144,42,0.15)' }}>
        <style>{`
          @keyframes rest-ticker { 0% { transform:translateX(0); } 100% { transform:translateX(-50%); } }
          .rest-ticker { display:inline-block; white-space:nowrap; animation: rest-ticker 30s linear infinite; }
        `}</style>
        <div className="rest-ticker text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: 'rgba(200,144,42,0.55)' }}>
          {tickerStr}
        </div>
      </div>

      {/* ══════════════════════════════════════
          SOBRE NOSOTROS — split editorial
      ══════════════════════════════════════ */}
      <section className="grid md:grid-cols-2 min-h-[580px]">
        {/* Imagen */}
        <div className="relative aspect-[4/3] md:aspect-auto order-2 md:order-1">
          <Image src={ABOUT_IMG} alt="Restaurante" fill sizes="50vw" className="object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(14,11,6,0.4) 0%, transparent 100%)' }} />
        </div>

        {/* Texto */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-20 order-1 md:order-2"
          style={{ backgroundColor: '#0a0704' }}>
          {store.home_editorial_label && (
            <p className="mb-4 text-[9px] font-black uppercase tracking-[0.5em]"
              style={{ color: '#c8902a' }}>
              {store.home_editorial_label}
            </p>
          )}
          <h2
            className="mb-6 font-black uppercase leading-[0.88] tracking-tight"
            style={{ color: '#f0ebe0', fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}
          >
            {store.home_editorial_title ?? 'De la tierra\na la mesa'}
          </h2>
          <div className="mb-8 h-px w-12" style={{ backgroundColor: '#c8902a' }} />
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(240,235,224,0.5)' }}>
            {store.home_editorial_body ?? 'Ingredientes de estación, productores de confianza y técnica contemporánea. Una cocina que respeta y celebra el origen de cada plato.'}
          </p>
          <Link href="/productos"
            className="mt-10 inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] group w-fit"
            style={{ color: '#c8902a' }}>
            <span>Ver el menú completo</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORÍAS — grid visual
      ══════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-6 py-16 md:px-10 md:py-20">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: 'rgba(200,144,42,0.6)' }}>
                Nuestra carta
              </p>
              <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight" style={{ color: '#f0ebe0' }}>
                El menú
              </h2>
            </div>
            <Link href="/productos"
              className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-[#c8902a]"
              style={{ color: 'rgba(240,235,224,0.35)' }}>
              Ver todo →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat, i) => (
              <Link key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className={`group relative overflow-hidden block ${i === 0 ? 'col-span-2 md:col-span-1' : ''}`}
                style={{ aspectRatio: i === 0 ? '16/9' : '4/3' }}
              >
                <div className="absolute inset-0" style={{ backgroundColor: '#1a1208' }}>
                  {cat.image_url && (
                    <Image src={cat.image_url} alt={cat.name} fill sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90" />
                  )}
                </div>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,11,6,0.85) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: '#f0ebe0' }}>
                    {cat.name}
                  </p>
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] transition-all group-hover:translate-x-1"
                    style={{ color: '#c8902a' }}>
                    Ver →
                  </p>
                </div>
                {/* Gold accent border on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(200,144,42,0.3)' }} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          PLATOS DESTACADOS — lista editorial
      ══════════════════════════════════════ */}
      {featured.length > 0 && (
        <section className="px-6 py-16 md:px-10 md:py-20" style={{ backgroundColor: '#0a0704' }}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-12 flex items-end justify-between border-b pb-6"
              style={{ borderColor: 'rgba(200,144,42,0.12)' }}>
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: 'rgba(200,144,42,0.6)' }}>
                  Recomendados
                </p>
                <h2 className="text-3xl md:text-4xl font-black uppercase leading-none tracking-tight" style={{ color: '#f0ebe0' }}>
                  Chef&apos;s selection
                </h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-[#c8902a]"
                style={{ color: 'rgba(240,235,224,0.3)' }}>
                Ver menú →
              </Link>
            </div>
            <div>
              {featured.slice(0, 6).map(product => (
                <RestaurantMenuItem key={product.id} product={product} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          GALERÍA DE AMBIENTE
      ══════════════════════════════════════ */}
      <section className="grid grid-cols-3 gap-1">
        {AMBIANCE_IMGS.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden">
            <Image src={src} alt="Ambiente" fill sizes="33vw"
              className="object-cover transition-transform duration-700 hover:scale-105" />
            <div className="absolute inset-0" style={{ backgroundColor: 'rgba(14,11,6,0.2)' }} />
          </div>
        ))}
      </section>

      {/* ══════════════════════════════════════
          HORARIOS Y UBICACIÓN
      ══════════════════════════════════════ */}
      <section className="px-6 py-20 md:px-10 md:py-24">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="mb-4 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: '#c8902a' }}>
              Horarios
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase leading-none tracking-tight mb-8" style={{ color: '#f0ebe0' }}>
              Cuándo<br />visitarnos
            </h2>
            <div className="space-y-4">
              {[
                { day: 'Lunes', hours: 'Cerrado', closed: true },
                { day: 'Mar — Vie', hours: '12:00 – 15:30 · 20:00 – 00:00', closed: false },
                { day: 'Sáb — Dom', hours: '12:00 – 01:00', closed: false },
              ].map(item => (
                <div key={item.day} className="flex justify-between py-3 border-b"
                  style={{ borderColor: 'rgba(240,235,224,0.06)' }}>
                  <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(240,235,224,0.5)' }}>
                    {item.day}
                  </span>
                  <span className="text-xs font-medium" style={{ color: item.closed ? 'rgba(240,235,224,0.2)' : '#c8902a' }}>
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: 'rgba(200,144,42,0.5)' }}>
                Reservas
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(240,235,224,0.5)' }}>
                Recomendamos reservar con anticipación, especialmente los fines de semana. Respondemos en menos de una hora.
              </p>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}>
                  Reservar por WhatsApp
                </a>
              )}
            </div>
            <div>
              <p className="mb-3 text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: 'rgba(200,144,42,0.5)' }}>
                Pedidos online
              </p>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(240,235,224,0.5)' }}>
                También podés armar tu pedido desde nuestra carta digital y coordinamos la entrega o retiro.
              </p>
              <Link href="/productos"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[#c8902a] group"
                style={{ color: 'rgba(240,235,224,0.5)' }}>
                <span>Ver el menú</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
