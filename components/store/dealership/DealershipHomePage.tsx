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

export function DealershipHomePage({ store, products, featured, categories }: Props) {
  const ACCENT = store.color_accent
  const heroSrc = store.hero_image_url ?? HERO_FALLBACK
  const splitSrc = store.home_split_image_url ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85'

  const nuevos     = products.filter(p => p.tags?.some(t => /0\s*km|nuevo/i.test(t))).slice(0, 6)
  const usados     = products.filter(p => p.tags?.some(t => /usado/i.test(t))).slice(0, 3)
  const destacados = featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4)

  return (
    <div className="bg-white text-slate-900">

      {/* ══ HERO — se mantiene oscuro: es una foto a full bleed ══════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '90vh' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(105deg, rgba(5,5,12,0.88) 0%, rgba(5,5,12,0.45) 55%, rgba(5,5,12,0.1) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(5,5,12,0.75) 0%, transparent 55%)' }} />

        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-8 md:px-14 lg:px-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-px" style={{ backgroundColor: ACCENT }} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: ACCENT }}>
                {store.hero_subtitle ?? 'Concesionaria Oficial'}
              </p>
            </div>
            <h1 className="font-black uppercase leading-[0.88] tracking-[-0.02em] text-white mb-8"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
              {store.hero_title}
            </h1>
            <div className="flex gap-10 mb-10">
              {[
                { n: products.length.toString(), l: 'Modelos disponibles' },
                { n: '0km', l: 'Entrega inmediata' },
                { n: '100%', l: 'Certificados' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p className="text-2xl font-black" style={{ color: ACCENT }}>{n}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href="/productos"
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 rounded-xl text-white"
                style={{ backgroundColor: ACCENT }}>
                Ver todos los modelos
              </Link>
              <a href={store.whatsapp_number
                  ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Me gustaría solicitar información sobre sus vehículos.`
                  : '#'}
                target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] border rounded-xl transition-all hover:bg-white/10 text-white"
                style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2">
          <div className="w-px h-12 animate-pulse" style={{ backgroundColor: ACCENT, opacity: 0.5 }} />
        </div>
      </section>

      {/* ══ TRUST BAR ════════════════════════════════════════════════════════ */}
      <div className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🛡️', title: 'Garantía oficial', desc: 'Hasta 3 años' },
            { icon: '💳', title: 'Financiación', desc: 'Desde 12 cuotas' },
            { icon: '🔧', title: 'Service oficial', desc: 'Técnicos certificados' },
            { icon: '🔄', title: 'Parte de pago', desc: 'Tasación inmediata' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <p className="text-xs font-black uppercase tracking-wide text-slate-800">{title}</p>
              <p className="text-[10px] text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORÍAS ════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Explorá por tipo
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">Segmentos</h2>
              </div>
              <Link href="/productos" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat, i) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-slate-100"
                  style={{ aspectRatio: i === 0 ? '2/1.2' : '3/4' }}>
                  <div className="absolute inset-0">
                    {cat.image_url
                      ? <Image src={cat.image_url} alt={cat.name} fill sizes="20vw"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                      : <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                    }
                  </div>
                  <div className="absolute inset-0 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%)' }} />
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <div className="w-5 h-px mb-2 transition-all duration-300 group-hover:w-8" style={{ backgroundColor: ACCENT }} />
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-white">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ MODELOS DESTACADOS ════════════════════════════════════════════════ */}
      {destacados.length > 0 && (
        <section className="px-6 md:px-10 py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Selección premium
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
                  Modelos destacados
                </h2>
              </div>
              <Link href="/productos" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver catálogo completo →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {destacados.map(p => (
                <DealershipProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ EDITORIAL SPLIT — bloque oscuro de contraste ══════════════════════ */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="grid md:grid-cols-2 min-h-[520px]">
          {/* Image */}
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <Image src={splitSrc} alt="Editorial" fill sizes="50vw" className="object-cover object-center" />
          </div>
          {/* Text — dark panel para contraste */}
          <div className="flex flex-col justify-center px-10 py-16 md:px-16 bg-slate-900">
            {store.home_editorial_label && (
              <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: ACCENT }}>
                {store.home_editorial_label}
              </p>
            )}
            <h2 className="font-black uppercase leading-[0.9] tracking-tight text-white mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="text-sm leading-relaxed mb-10 max-w-sm text-slate-400">
                {store.home_editorial_body}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <Link href="/productos"
                className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:brightness-110 rounded-xl text-white"
                style={{ backgroundColor: ACCENT }}>
                Ver modelos
              </Link>
              <a href={store.whatsapp_number
                  ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`
                  : '#'}
                target="_blank" rel="noopener noreferrer"
                className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border rounded-xl transition-all hover:bg-white/10 text-white"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                Contactar
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ══ MODELOS 0KM ══════════════════════════════════════════════════════ */}
      {nuevos.length > 0 && (
        <section className="px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Entrega inmediata
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
                  0 km disponibles
                </h2>
              </div>
              <Link href="/productos?categoria=0km" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nuevos.map(p => (
                <DealershipProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ USADOS CERTIFICADOS ═══════════════════════════════════════════════ */}
      {usados.length > 0 && (
        <section className="px-6 md:px-10 py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Con garantía oficial
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
                  Usados certificados
                </h2>
              </div>
              <Link href="/productos?categoria=usados" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {usados.map(p => (
                <DealershipProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ TEST DRIVE CTA — bloque oscuro con foto ═══════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&q=80"
          alt="Test drive"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(5,5,12,0.92) 0%, rgba(5,5,12,0.7) 50%, rgba(5,5,12,0.4) 100%)' }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px max-w-16" style={{ backgroundColor: ACCENT, opacity: 0.6 }} />
            <p className="text-[9px] font-black uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
              Viví la experiencia
            </p>
            <div className="flex-1 h-px max-w-16" style={{ backgroundColor: ACCENT, opacity: 0.6 }} />
          </div>
          <h2 className="font-black uppercase leading-[0.9] text-white mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.02em' }}>
            SOLICITÁ TU<br />TEST DRIVE HOY
          </h2>
          <p className="text-base mb-10 text-white/50">
            Conocé tu próximo auto en persona.<br />Coordinamos el día y horario que mejor te quede.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={store.whatsapp_number
                ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola! Quiero coordinar un test drive.`
                : '#'}
              target="_blank" rel="noopener noreferrer"
              className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:brightness-110 hover:scale-105 rounded-xl text-white"
              style={{ backgroundColor: ACCENT }}>
              Solicitar por WhatsApp
            </a>
            <Link href="/productos"
              className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] border rounded-xl transition-all hover:bg-white/10 text-white"
              style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════ */}
      {store.home_marquee_items?.length > 0 && (
        <div className="overflow-hidden py-3.5 border-y" style={{ backgroundColor: ACCENT, borderColor: 'transparent' }}>
          <style>{`@keyframes marquee-d{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.mq-d{display:flex;width:max-content;animation:marquee-d 25s linear infinite}`}</style>
          <div className="mq-d">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex shrink-0 items-center text-[10px] font-black uppercase tracking-[0.25em] text-white">
                {store.home_marquee_items.map((t) => (
                  <span key={t} className="mx-8 flex items-center gap-8">
                    {t}<span className="opacity-40">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTACTO ══════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
              Estamos para ayudarte
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900">
              Contacto
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: '📍',
                title: 'Visitanos',
                lines: ['Buenos Aires, Argentina', 'Lun–Vie 9:00–19:00', 'Sáb 9:00–14:00'],
              },
              {
                icon: '💬',
                title: 'WhatsApp',
                lines: [store.whatsapp_number ?? 'Consultar', 'Respondemos en minutos', 'Atención personalizada'],
                link: store.whatsapp_number ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}` : undefined,
              },
              {
                icon: '📧',
                title: 'Email',
                lines: [store.email ?? 'Consultar por email', 'Respondemos en 24hs', 'Cotizaciones y consultas'],
                link: store.email ? `mailto:${store.email}` : undefined,
              },
            ].map(({ icon, title, lines, link }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm"
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-black uppercase tracking-wider text-sm mb-4 text-slate-900">{title}</h3>
                <div className="space-y-1.5">
                  {lines.map((l, i) => (
                    <p
                      key={i}
                      className={`text-sm ${i === 0 ? 'font-semibold text-slate-800' : 'text-slate-400'}`}
                    >
                      {l}
                    </p>
                  ))}
                </div>
                {link && (
                  <a
                    href={link}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-80"
                    style={{ color: ACCENT }}
                  >
                    Contactar →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
