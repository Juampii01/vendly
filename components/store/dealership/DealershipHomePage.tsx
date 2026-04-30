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
const SPLIT_FALLBACK = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85'

export function DealershipHomePage({ store, products, featured, categories }: Props) {
  const ACCENT = store.color_accent
  const heroSrc = store.hero_image_url ?? HERO_FALLBACK
  const splitSrc = store.home_split_image_url ?? SPLIT_FALLBACK
  const waNum = store.whatsapp_number?.replace(/\D/g, '') ?? ''
  const wa = (msg: string) => waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}` : '#'

  const nuevos     = products.filter(p => p.tags?.some(t => /^(0\s*km|nuevo)$/i.test(t))).slice(0, 3)
  const usados     = products.filter(p => p.tags?.some(t => /^usado$/i.test(t))).slice(0, 3)
  const destacados = featured.length > 0 ? featured : products
  const hero_feat  = destacados[0] ?? null
  const grid_feat  = destacados.slice(1, 4)

  return (
    <div className="bg-white text-slate-900">

      {/* ══ HERO — fullscreen ═══════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: '100svh', minHeight: '600px' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />

        {/* Layers */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(115deg, rgba(3,3,8,0.96) 0%, rgba(3,3,8,0.55) 50%, rgba(3,3,8,0.1) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(3,3,8,0.9) 0%, transparent 45%)' }} />

        {/* Left accent column */}
        <div className="absolute left-0 top-0 w-[3px] h-full"
          style={{ background: `linear-gradient(to bottom, transparent 0%, ${ACCENT} 30%, ${ACCENT} 70%, transparent 100%)` }} />

        <div className="absolute inset-0 flex flex-col justify-end pb-20 px-10 md:px-16 lg:px-24">
          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-7">
              <div className="w-14 h-px" style={{ backgroundColor: ACCENT }} />
              <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
                {store.hero_subtitle ?? 'Concesionaria Oficial'}
              </p>
            </div>

            {/* Title */}
            <h1 className="font-black uppercase leading-[0.86] text-white mb-12"
              style={{ fontSize: 'clamp(3.5rem, 8vw, 7rem)', letterSpacing: '-0.04em' }}>
              {store.hero_title}
            </h1>

            {/* Bottom strip */}
            <div className="flex flex-wrap items-end gap-10">
              {/* Stats */}
              <div className="flex gap-10">
                {[
                  { n: `${products.length}+`, l: 'Modelos' },
                  { n: '0km',                  l: 'Entrega inmediata' },
                  { n: '60',                   l: 'Cuotas' },
                ].map(({ n, l }) => (
                  <div key={l}>
                    <p className="text-3xl font-black leading-none" style={{ color: ACCENT }}>{n}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] mt-1"
                      style={{ color: 'rgba(255,255,255,0.38)' }}>{l}</p>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link href="/productos"
                  className="px-9 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: ACCENT }}>
                  Ver modelos
                </Link>
                {waNum && (
                  <a href={wa('Hola! Quiero consultar sobre sus vehículos disponibles.')}
                    target="_blank" rel="noopener noreferrer"
                    className="px-9 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-white border transition-all hover:bg-white/10 active:scale-95"
                    style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                    Consultar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-12 hidden md:flex flex-col items-center gap-2">
          <div className="w-px h-16 animate-pulse" style={{ backgroundColor: ACCENT, opacity: 0.45 }} />
          <p className="text-[8px] font-black uppercase tracking-[0.4em] -rotate-90 origin-center mt-4"
            style={{ color: 'rgba(255,255,255,0.2)' }}>Scroll</p>
        </div>
      </section>

      {/* ══ TRUST BAR ════════════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#050508', borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-7 grid grid-cols-2 md:grid-cols-4 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/[0.07]">
          {[
            { icon: <ShieldIcon />, title: 'Garantía oficial', desc: 'Hasta 3 años incluida' },
            { icon: <CardIcon />,   title: 'Financiación',     desc: '12 a 60 cuotas fijas' },
            { icon: <WrenchIcon />, title: 'Service oficial',  desc: 'Técnicos certificados' },
            { icon: <SwapIcon />,   title: 'Parte de pago',    desc: 'Tasación inmediata' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 px-6 py-5 first:pl-0 last:pr-0">
              <div className="shrink-0 opacity-50" style={{ color: ACCENT }}>{icon}</div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-wide text-white">{title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURED MODEL — editorial full bleed ════════════════════════════════ */}
      {hero_feat && (
        <section className="grid md:grid-cols-2 min-h-[580px]">
          {/* Image */}
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden bg-slate-100">
            {hero_feat.images[0]
              ? <Image src={hero_feat.images[0]} alt={hero_feat.name} fill sizes="50vw"
                  className="object-cover object-center transition-transform duration-700 hover:scale-105" />
              : <div className="w-full h-full bg-slate-100" />
            }
            {/* Condition badge */}
            {hero_feat.tags?.some(t => /^(0\s*km|nuevo)$/i.test(t)) && (
              <div className="absolute top-5 left-5">
                <span className="px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] text-white"
                  style={{ backgroundColor: ACCENT }}>0 km</span>
              </div>
            )}
            {/* Accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ backgroundColor: ACCENT }} />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center px-10 py-16 md:px-14" style={{ backgroundColor: '#050508' }}>
            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-5" style={{ color: ACCENT }}>
              Modelo destacado
            </p>
            {hero_feat.category?.name && (
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                {hero_feat.category.name}
              </p>
            )}
            <h2 className="font-black uppercase leading-[0.88] text-white mb-6"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}>
              {hero_feat.name}
            </h2>

            {/* Specs chips */}
            <div className="flex flex-wrap gap-2 mb-8">
              {hero_feat.tags?.filter(t =>
                /^\d{4}$/.test(t) ||
                /^(nafta|diesel|híbrido|eléctrico|gnc)$/i.test(t) ||
                /^(manual|automático|automática|cvt)$/i.test(t)
              ).slice(0, 3).map(t => (
                <span key={t} className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider"
                  style={{ border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                  {t}
                </span>
              ))}
            </div>

            {hero_feat.price > 0 && (
              <div className="mb-8">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.35)' }}>Desde</p>
                <p className="text-3xl font-black text-white leading-none">
                  {formatPrice(hero_feat.price)}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href={`/productos/${hero_feat.slug}`}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}>
                Ver detalles
              </Link>
              {waNum && (
                <a href={wa(`Hola! Me interesa el ${hero_feat.name}. ¿Me pueden dar más información?`)}
                  target="_blank" rel="noopener noreferrer"
                  className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.22em] text-white border transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
                  Consultar
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ CATEGORÍAS / SEGMENTOS ════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.48em] mb-2" style={{ color: ACCENT }}>
                  Explorá
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Segmentos</h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todo →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((cat, i) => (
                <Link key={cat.id} href={`/productos?categoria=${cat.slug}`}
                  className="group relative overflow-hidden bg-slate-100"
                  style={{ aspectRatio: i === 0 ? '2/1.2' : '3/4' }}>
                  <div className="absolute inset-0">
                    {cat.image_url
                      ? <Image src={cat.image_url} alt={cat.name} fill sizes="20vw"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                      : <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200" />
                    }
                  </div>
                  <div className="absolute inset-0 transition-opacity"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.05) 55%)' }} />
                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: ACCENT }} />
                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <div className="w-4 h-0.5 mb-2 transition-all duration-300 group-hover:w-8"
                      style={{ backgroundColor: ACCENT }} />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ GRID MODELOS ════════════════════════════════════════════════════════ */}
      {grid_feat.length > 0 && (
        <section className="px-6 md:px-10 py-20" style={{ backgroundColor: '#f8fafc' }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.48em] mb-2" style={{ color: ACCENT }}>
                  Selección
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Modelos disponibles</h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver catálogo →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {grid_feat.map(p => <DealershipProductCard key={p.id} product={p} store={store} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ EDITORIAL SPLIT ═══════════════════════════════════════════════════════ */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="grid md:grid-cols-2 min-h-[520px]">
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <Image src={splitSrc} alt="Editorial" fill sizes="50vw"
              className="object-cover object-center" />
          </div>
          <div className="flex flex-col justify-center px-10 py-16 md:px-16" style={{ backgroundColor: '#050508' }}>
            {store.home_editorial_label && (
              <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-5" style={{ color: ACCENT }}>
                {store.home_editorial_label}
              </p>
            )}
            <h2 className="font-black uppercase leading-[0.9] tracking-tight text-white mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>
                {store.home_editorial_body}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href="/productos"
                className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}>
                Ver modelos
              </Link>
              {waNum && (
                <a href={wa('Hola! Quiero consultar.')} target="_blank" rel="noopener noreferrer"
                  className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.22em] text-white border transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
                  Contactar
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ 0KM ═════════════════════════════════════════════════════════════════ */}
      {nuevos.length > 0 && (
        <section className="px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.48em] mb-2" style={{ color: ACCENT }}>
                  Entrega inmediata
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">0 km disponibles</h2>
              </div>
              <Link href="/productos?tag=0km"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nuevos.map(p => <DealershipProductCard key={p.id} product={p} store={store} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ USADOS ══════════════════════════════════════════════════════════════ */}
      {usados.length > 0 && (
        <section className="px-6 md:px-10 py-20" style={{ backgroundColor: '#f8fafc' }}>
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.48em] mb-2" style={{ color: ACCENT }}>
                  Con garantía oficial
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Usados certificados</h2>
              </div>
              <Link href="/productos?tag=usado"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {usados.map(p => <DealershipProductCard key={p.id} product={p} store={store} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ SERVICES ════════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#050508' }} className="px-6 md:px-10 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-3" style={{ color: ACCENT }}>
              Nuestros servicios
            </p>
            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">
              Todo en un solo lugar
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { title: 'Test Drive', desc: 'Probá tu próximo auto sin compromiso. Coordinamos día y horario.', icon: <TDIcon /> },
              { title: 'Financiación', desc: 'Crédito prendario, leasing y permuta. Hasta 60 cuotas.', icon: <CardIcon /> },
              { title: 'Service oficial', desc: 'Taller equipado. Técnicos certificados por la marca.', icon: <WrenchIcon /> },
              { title: 'Accesorios', desc: 'Repuestos y accesorios originales siempre disponibles.', icon: <StarIcon /> },
            ].map(({ title, desc, icon }) => (
              <div key={title} className="group">
                <div className="mb-5 opacity-35 group-hover:opacity-100 transition-all duration-300"
                  style={{ color: ACCENT }}>
                  {icon}
                </div>
                <div className="w-6 h-0.5 mb-4 transition-all duration-300 group-hover:w-12"
                  style={{ backgroundColor: ACCENT }} />
                <h3 className="text-sm font-black uppercase tracking-wide text-white mb-2">{title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.38)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEST DRIVE CTA ═══════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6 overflow-hidden">
        <Image src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&q=80"
          alt="Test drive" fill className="object-cover object-center" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(3,3,8,0.97) 0%, rgba(3,3,8,0.72) 50%, rgba(3,3,8,0.35) 100%)' }} />
        <div className="absolute left-0 top-0 w-[3px] h-full opacity-60"
          style={{ background: `linear-gradient(to bottom, transparent, ${ACCENT}, transparent)` }} />
        <div className="relative mx-auto max-w-2xl">
          <div className="flex items-center gap-4 mb-7">
            <div className="w-12 h-px" style={{ backgroundColor: ACCENT }} />
            <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
              Viví la experiencia
            </p>
          </div>
          <h2 className="font-black uppercase leading-[0.88] text-white mb-8"
            style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', letterSpacing: '-0.04em' }}>
            SOLICITÁ TU<br />TEST DRIVE
          </h2>
          <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.42)' }}>
            Sin compromiso. Coordinamos en el día.
          </p>
          <div className="flex flex-wrap gap-4">
            {waNum && (
              <a href={wa('Hola! Quiero coordinar un test drive.')}
                target="_blank" rel="noopener noreferrer"
                className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white transition-all hover:brightness-110 hover:scale-105"
                style={{ backgroundColor: ACCENT }}>
                Reservar ahora
              </a>
            )}
            <Link href="/productos"
              className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white border transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.22)' }}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════════ */}
      {store.home_marquee_items?.length > 0 && (
        <div className="overflow-hidden py-4" style={{ backgroundColor: ACCENT }}>
          <style>{`
            @keyframes mq-dl { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
            .mq-dl { display:flex; width:max-content; animation:mq-dl 28s linear infinite; }
          `}</style>
          <div className="mq-dl">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex shrink-0 items-center text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {store.home_marquee_items.map(t => (
                  <span key={t} className="mx-8 flex items-center gap-8">
                    {t}<span className="opacity-40">◆</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ══ CONTACTO ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: ACCENT }}>
              Contacto
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Estamos para ayudarte</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Visitanos',
                icon: <PinIcon />,
                lines: ['Buenos Aires, Argentina', 'Lun–Vie 9:00–19:00', 'Sáb 9:00–14:00'],
              },
              {
                title: 'WhatsApp',
                icon: <WAIcon />,
                lines: [store.whatsapp_number ?? '–', 'Respondemos en minutos', 'Atención personalizada'],
                link: waNum ? wa('Hola! Quiero consultar.') : undefined,
              },
              {
                title: 'Email',
                icon: <MailIcon />,
                lines: [store.email ?? '–', 'Respondemos en 24hs', 'Cotizaciones y consultas'],
                link: store.email ? `mailto:${store.email}` : undefined,
              },
            ].map(({ icon, title, lines, link }) => (
              <div key={title} className="p-8 border border-slate-100 bg-white hover:shadow-lg transition-shadow duration-300">
                <div className="mb-5 text-slate-300">{icon}</div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-4 text-slate-900">{title}</h3>
                <div className="space-y-1.5 mb-5">
                  {lines.map((l, i) => (
                    <p key={i} className={`text-sm ${i === 0 ? 'font-bold text-slate-800' : 'text-slate-400'}`}>{l}</p>
                  ))}
                </div>
                {link && (
                  <a href={link} target={link.startsWith('https') ? '_blank' : undefined}
                    rel={link.startsWith('https') ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: ACCENT }}>
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

// ─── SVG icons ────────────────────────────────────────────────────────────────
function ShieldIcon() {
  return <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
}
function CardIcon() {
  return <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function WrenchIcon() {
  return <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z"/></svg>
}
function SwapIcon() {
  return <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
}
function TDIcon() {
  return <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"/><rect x="9" y="11" width="14" height="10" rx="1"/></svg>
}
function StarIcon() {
  return <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
function PinIcon() {
  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function WAIcon() {
  return <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
}
function MailIcon() {
  return <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
}
