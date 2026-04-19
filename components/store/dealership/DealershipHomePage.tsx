import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { DealershipProductCard } from './DealershipProductCard'
import type { StoreConfig, Category, Product } from '@/types'

interface Props {
  store: StoreConfig
  products: Product[]
  featured: Product[]
  categories: Category[]
}

const HERO_FALLBACK = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=85'
const HERO_FALLBACK_2 = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85'

export function DealershipHomePage({ store, products, featured, categories }: Props) {
  const GOLD = store.color_accent
  const heroSrc = store.hero_image_url ?? HERO_FALLBACK
  const secondarySrc = store.home_split_image_url ?? HERO_FALLBACK_2

  return (
    <div style={{ backgroundColor: store.color_background, color: store.color_text }}>

      {/* ── HERO: full-screen dramático ──────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '95vh' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />

        {/* Gradient: oscuro abajo izquierda */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end pb-16 px-6 md:px-12 lg:px-20">
          <div className="max-w-2xl">
            {/* Tagline */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
              <p className="text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: GOLD }}>
                {store.hero_subtitle ?? 'Concesionaria Oficial'}
              </p>
            </div>

            {/* Título */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-[0.88] tracking-[-0.02em] text-white mb-8">
              {store.hero_title}
            </h1>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href={store.hero_cta_url}
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: GOLD, color: store.color_primary }}>
                {store.hero_cta_label}
              </Link>
              {store.whatsapp_number && (
                <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola, quiero información sobre los modelos disponibles`}
                  target="_blank" rel="noopener noreferrer"
                  className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] border border-white/30 text-white transition-all hover:bg-white/10">
                  Hablar con un asesor
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar — bottom right */}
        <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-end gap-4">
          {[
            { value: '+500', label: 'Clientes satisfechos' },
            { value: '15 años', label: 'En el mercado' },
            { value: '0km', label: 'Entrega inmediata' },
          ].map(stat => (
            <div key={stat.label} className="text-right">
              <p className="text-2xl font-black leading-none" style={{ color: GOLD }}>{stat.value}</p>
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/40 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── MARQUEE — dorado sobre oscuro ────────────────────────────────────── */}
      <div className="overflow-hidden py-4" style={{ backgroundColor: store.color_primary }}>
        <style>{`
          @keyframes dealer-scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .dealer-track { display:flex; width:max-content; animation: dealer-scroll 25s linear infinite; }
        `}</style>
        <div className="dealer-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="flex shrink-0 items-center text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: GOLD }}>
              {(store.home_marquee_items?.length
                ? store.home_marquee_items
                : ['0KM Y USADOS', 'FINANCIACIÓN A MEDIDA', 'TEST DRIVE SIN COSTO', store.name.toUpperCase(), 'ENTREGA INMEDIATA']
              ).map(text => (
                <span key={text} className="mx-10 flex items-center gap-10">
                  {text}
                  <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: GOLD, opacity: 0.4 }} />
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORÍAS / LÍNEAS ───────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-20" style={{ backgroundColor: `${store.color_text}04` }}>
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>
                  Líneas disponibles
                </p>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[-0.02em]">
                  Nuestros modelos
                </h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 hover:opacity-100 transition-opacity">
                Ver todos →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, idx) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                  className="group relative overflow-hidden"
                  style={{ aspectRatio: idx < 2 ? '4/3' : '1/1' }}>
                  <div className="absolute inset-0">
                    {cat.image_url
                      ? <Image src={cat.image_url} alt={cat.name} fill sizes="25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
                      : <div className="h-full" style={{ backgroundColor: store.color_primary }} />
                    }
                  </div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300" />
                  {/* Gold accent line on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                    style={{ backgroundColor: GOLD }} />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <p className="text-white font-black uppercase text-lg tracking-[-0.01em] leading-tight">
                      {cat.name}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: GOLD }}>
                      Ver modelos →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── VEHÍCULOS DESTACADOS ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>
                  Selección especial
                </p>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[-0.02em]">
                  Modelos destacados
                </h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 hover:opacity-100 transition-opacity">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featured.slice(0, 6).map(product => (
                <DealershipProductCard key={product.id} product={product} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FINANCIACIÓN — split section ─────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 min-h-[500px]" style={{ backgroundColor: store.color_primary }}>
        {/* Imagen */}
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image src={secondarySrc} alt="Financiación" fill sizes="50vw"
            className="object-cover object-center opacity-60" />
          <div className="absolute inset-0"
            style={{ background: `linear-gradient(to right, transparent, ${store.color_primary})` }} />
        </div>

        {/* Contenido */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: GOLD }} />
            <p className="text-[9px] font-black uppercase tracking-[0.35em]" style={{ color: GOLD }}>
              {store.home_editorial_label ?? 'Financiación'}
            </p>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase leading-[0.92] tracking-[-0.02em] mb-6"
            style={{ color: store.color_background }}>
            {store.home_editorial_title ?? 'Tu auto, a tu ritmo'}
          </h2>
          <p className="text-sm leading-relaxed opacity-50 max-w-sm mb-8"
            style={{ color: store.color_background }}>
            {store.home_editorial_body ?? 'Financiación personalizada con los mejores bancos. Hasta 60 cuotas fijas, permuta de usados y entrega inmediata.'}
          </p>
          <div className="grid grid-cols-3 gap-6 mb-10">
            {[
              { value: '60', label: 'cuotas fijas' },
              { value: '0%', label: 'anticipo mín.' },
              { value: '24hs', label: 'aprobación' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-3xl font-black" style={{ color: GOLD }}>{item.value}</p>
                <p className="text-[9px] uppercase tracking-[0.15em] opacity-40 mt-0.5"
                  style={{ color: store.color_background }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
          {store.whatsapp_number && (
            <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Quiero información sobre financiación`}
              target="_blank" rel="noopener noreferrer"
              className="w-fit px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: GOLD, color: store.color_primary }}>
              Consultar financiación
            </a>
          )}
        </div>
      </section>

      {/* ── TODOS LOS VEHÍCULOS ───────────────────────────────────────────────── */}
      {products.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-20">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: GOLD }}>
                  Stock disponible
                </p>
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[-0.02em]">
                  Todos los vehículos
                </h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 hover:opacity-100 transition-opacity">
                Ver catálogo completo →
              </Link>
            </div>
            {/* Mobile scroll */}
            <div className="flex gap-6 overflow-x-auto pb-2 md:hidden" style={{ scrollSnapType: 'x mandatory' }}>
              {products.map(p => (
                <div key={p.id} className="w-[80vw] shrink-0" style={{ scrollSnapAlign: 'start' }}>
                  <DealershipProductCard product={p} store={store} />
                </div>
              ))}
            </div>
            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
              {products.slice(0, 6).map(p => (
                <DealershipProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── POR QUÉ ELEGIRNOS ─────────────────────────────────────────────────── */}
      <section className="px-4 py-16 md:px-8 border-t border-b"
        style={{ borderColor: `${store.color_text}08`, backgroundColor: `${store.color_text}03` }}>
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center mb-2" style={{ color: GOLD }}>
            Por qué elegirnos
          </p>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-[-0.02em] text-center mb-12">
            La diferencia {store.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: '🏆', title: 'Concesionaria oficial', desc: 'Respaldo total de fábrica y garantía oficial.' },
              { icon: '💳', title: 'Financiación flexible', desc: 'Hasta 60 cuotas con todos los bancos del país.' },
              { icon: '🔄', title: 'Tomamos tu usado', desc: 'Tasación justa y descuento en tu nuevo vehículo.' },
              { icon: '🛡️', title: 'Servicio post-venta', desc: 'Taller propio con técnicos certificados.' },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <span className="text-3xl">{item.icon}</span>
                <div className="w-6 h-px" style={{ backgroundColor: GOLD }} />
                <p className="text-sm font-black uppercase tracking-[0.05em]">{item.title}</p>
                <p className="text-xs opacity-40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO FINAL ───────────────────────────────────────────────────── */}
      <section className="px-4 py-20 md:px-8 text-center" style={{ backgroundColor: store.color_primary }}>
        <p className="text-[9px] font-black uppercase tracking-[0.35em] mb-3" style={{ color: GOLD }}>
          Encontrá tu próximo auto
        </p>
        <h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] tracking-[-0.02em] mb-4"
          style={{ color: store.color_background }}>
          ¿Listo para dar<br />el próximo paso?
        </h2>
        <p className="text-sm opacity-40 mb-10 max-w-md mx-auto" style={{ color: store.color_background }}>
          Nuestros asesores te acompañan en cada paso. Visitanos o escribinos cuando quieras.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {store.whatsapp_number && (
            <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Me interesa ver los modelos disponibles.`}
              target="_blank" rel="noopener noreferrer"
              className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: GOLD, color: store.color_primary }}>
              Escribinos por WhatsApp
            </a>
          )}
          <Link href="/productos"
            className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] border transition-all hover:bg-white/10"
            style={{ borderColor: `${store.color_background}30`, color: store.color_background }}>
            Ver catálogo completo
          </Link>
        </div>
      </section>

    </div>
  )
}
