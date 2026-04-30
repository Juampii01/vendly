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

const HERO_FALLBACK   = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=85'
const SPLIT_FALLBACK  = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85'
const TD_IMG_FALLBACK = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1400&q=80'

export function DealershipHomePage({ store, products, featured, categories }: Props) {
  const ACCENT = store.color_accent
  const heroSrc  = store.hero_image_url ?? HERO_FALLBACK
  const splitSrc = store.home_split_image_url ?? SPLIT_FALLBACK
  const waNum    = store.whatsapp_number?.replace(/\D/g, '') ?? ''
  const waBase   = waNum ? `https://wa.me/${waNum}` : '#'

  const nuevos     = products.filter(p => p.tags?.some(t => /^(0\s*km|nuevo)$/i.test(t))).slice(0, 6)
  const usados     = products.filter(p => p.tags?.some(t => /^usado$/i.test(t))).slice(0, 3)
  const destacados = featured.length > 0 ? featured.slice(0, 3) : products.slice(0, 3)

  return (
    <div className="bg-white text-slate-900">

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '92vh' }}>
        <Image src={heroSrc} alt={store.hero_title} fill priority sizes="100vw"
          className="object-cover object-center" />

        {/* Deep gradient */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(110deg, rgba(4,4,10,0.94) 0%, rgba(4,4,10,0.5) 55%, rgba(4,4,10,0.15) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,4,10,0.85) 0%, transparent 50%)' }} />

        {/* Left accent line */}
        <div className="absolute top-0 left-0 w-1 h-full opacity-60" style={{ backgroundColor: ACCENT }} />

        <div className="absolute inset-0 flex flex-col justify-end pb-24 px-10 md:px-16 lg:px-24">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: ACCENT }} />
              <p className="text-[10px] font-black uppercase tracking-[0.45em]" style={{ color: ACCENT }}>
                {store.hero_subtitle ?? 'Concesionaria Oficial'}
              </p>
            </div>

            {/* Title */}
            <h1 className="font-black uppercase leading-[0.88] text-white mb-10"
              style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '-0.03em' }}>
              {store.hero_title}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-12">
              {[
                { n: `${products.length}+`, l: 'Modelos disponibles' },
                { n: '0 km', l: 'Entrega inmediata' },
                { n: '60', l: 'Cuotas sin interés' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p className="text-2xl font-black leading-none mb-1" style={{ color: ACCENT }}>{n}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link href="/productos"
                className="px-9 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: ACCENT }}>
                Ver todos los modelos
              </Link>
              {waNum && (
                <a href={`${waBase}?text=${encodeURIComponent('Hola! Me gustaría recibir información sobre sus vehículos.')}`}
                  target="_blank" rel="noopener noreferrer"
                  className="px-9 py-4 text-[11px] font-black uppercase tracking-[0.2em] border text-white transition-all hover:bg-white/10 active:scale-95"
                  style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-12 hidden md:flex flex-col items-center gap-3">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] rotate-90 origin-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}>Scroll</p>
          <div className="w-px h-14 animate-pulse" style={{ backgroundColor: ACCENT, opacity: 0.5 }} />
        </div>
      </section>

      {/* ══ TRUST BAR ════════════════════════════════════════════════════════════ */}
      <div style={{ backgroundColor: '#060810' }}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
              title: 'Garantía oficial',
              desc: 'Hasta 3 años incluida',
            },
            {
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
              title: 'Financiación',
              desc: '12 a 60 cuotas',
            },
            {
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z"/></svg>,
              title: 'Service oficial',
              desc: 'Técnicos certificados',
            },
            {
              icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
              title: 'Parte de pago',
              desc: 'Tasación inmediata',
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4">
              <div className="shrink-0 opacity-60" style={{ color: ACCENT }}>{icon}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-white">{title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATEGORÍAS / SEGMENTOS ════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: ACCENT }}>
                  Explorá por segmento
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Categorías</h2>
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
                  <div className="absolute inset-0 transition-opacity duration-300"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%)' }} />

                  {/* Accent line grows on hover */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: ACCENT }} />

                  <div className="absolute bottom-0 left-0 w-full p-4">
                    <div className="w-4 h-0.5 mb-2 transition-all duration-300 group-hover:w-7"
                      style={{ backgroundColor: ACCENT }} />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white">{cat.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ MODELOS DESTACADOS ════════════════════════════════════════════════════ */}
      {destacados.length > 0 && (
        <section className="px-6 md:px-10 py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: ACCENT }}>
                  Selección premium
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Modelos destacados</h2>
              </div>
              <Link href="/productos"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver catálogo →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destacados.map(p => (
                <DealershipProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ EDITORIAL SPLIT ═══════════════════════════════════════════════════════ */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="grid md:grid-cols-2 min-h-[560px]">
          <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <Image src={splitSrc} alt="Editorial" fill sizes="50vw"
              className="object-cover object-center" />
          </div>
          <div className="flex flex-col justify-center px-10 py-16 md:px-16" style={{ backgroundColor: '#060810' }}>
            {store.home_editorial_label && (
              <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-5" style={{ color: ACCENT }}>
                {store.home_editorial_label}
              </p>
            )}
            <h2 className="font-black uppercase leading-[0.9] tracking-tight text-white mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="text-sm leading-relaxed mb-10 max-w-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {store.home_editorial_body}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <Link href="/productos"
                className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}>
                Ver modelos
              </Link>
              {waNum && (
                <a href={waBase} target="_blank" rel="noopener noreferrer"
                  className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border text-white transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                  Contactar
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ MODELOS 0KM ══════════════════════════════════════════════════════════ */}
      {nuevos.length > 0 && (
        <section className="px-6 md:px-10 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: ACCENT }}>
                  Entrega inmediata
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">0 km disponibles</h2>
              </div>
              <Link href="/productos?tag=0km"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {nuevos.map(p => <DealershipProductCard key={p.id} product={p} store={store} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ USADOS CERTIFICADOS ══════════════════════════════════════════════════ */}
      {usados.length > 0 && (
        <section className="px-6 md:px-10 py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: ACCENT }}>
                  Con garantía oficial
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Usados certificados</h2>
              </div>
              <Link href="/productos?tag=usado"
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {usados.map(p => <DealershipProductCard key={p.id} product={p} store={store} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ SERVICES SECTION ════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#060810' }} className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-3" style={{ color: ACCENT }}>
              Por qué elegirnos
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
              Servicio integral
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>,
                title: 'Test Drive',
                desc: 'Coordinamos una prueba sin compromiso en el día.',
              },
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M6 14h4M14 14h4"/></svg>,
                title: 'Financiación',
                desc: 'Crédito prendario, leasing y permuta de usados.',
              },
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.77 3.77z"/></svg>,
                title: 'Service oficial',
                desc: 'Taller equipado con técnicos certificados por la marca.',
              },
              {
                icon: <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
                title: 'Accesorios',
                desc: 'Repuestos y accesorios originales siempre en stock.',
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="group">
                <div className="mb-4 transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <div className="group-hover:text-[var(--acc)] transition-colors duration-300"
                    style={{ ['--acc' as string]: ACCENT }}>
                    {icon}
                  </div>
                </div>
                <div className="w-6 h-0.5 mb-3 transition-all duration-300 group-hover:w-10"
                  style={{ backgroundColor: ACCENT, opacity: 0.6 }} />
                <h3 className="text-sm font-black uppercase tracking-wide text-white mb-2">{title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEST DRIVE CTA ═══════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <Image src={TD_IMG_FALLBACK} alt="Test drive" fill className="object-cover object-center" />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(4,4,10,0.95) 0%, rgba(4,4,10,0.7) 50%, rgba(4,4,10,0.4) 100%)' }} />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px max-w-16" style={{ backgroundColor: ACCENT, opacity: 0.5 }} />
            <p className="text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
              Viví la experiencia
            </p>
            <div className="flex-1 h-px max-w-16" style={{ backgroundColor: ACCENT, opacity: 0.5 }} />
          </div>
          <h2 className="font-black uppercase leading-[0.9] text-white mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em' }}>
            SOLICITÁ TU<br />TEST DRIVE HOY
          </h2>
          <p className="text-sm mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Conocé tu próximo auto en persona.<br />
            Coordinamos el día y horario que mejor te quede.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {waNum && (
              <a href={`${waBase}?text=${encodeURIComponent('Hola! Quiero coordinar un test drive.')}`}
                target="_blank" rel="noopener noreferrer"
                className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white transition-all hover:brightness-110 hover:scale-105"
                style={{ backgroundColor: ACCENT }}>
                Solicitar por WhatsApp
              </a>
            )}
            <Link href="/productos"
              className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] border text-white transition-all hover:bg-white/10"
              style={{ borderColor: 'rgba(255,255,255,0.25)' }}>
              Ver catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════════════ */}
      {store.home_marquee_items?.length > 0 && (
        <div className="overflow-hidden py-4 border-y" style={{ backgroundColor: ACCENT, borderColor: 'transparent' }}>
          <style>{`
            @keyframes marquee-d { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
            .mq-d { display:flex; width:max-content; animation:marquee-d 28s linear infinite; }
          `}</style>
          <div className="mq-d">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex shrink-0 items-center text-[10px] font-black uppercase tracking-[0.28em] text-white">
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

      {/* ══ CONTACTO ══════════════════════════════════════════════════════════════ */}
      <section className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <p className="text-[9px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: ACCENT }}>
              Estamos para ayudarte
            </p>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Contacto</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Visitanos',
                icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                lines: ['Buenos Aires, Argentina', 'Lun–Vie 9:00–19:00', 'Sáb 9:00–14:00'],
              },
              {
                title: 'WhatsApp',
                icon: <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
                lines: [store.whatsapp_number ?? 'Consultar', 'Respondemos en minutos', 'Atención personalizada'],
                link: waNum ? `${waBase}?text=${encodeURIComponent('Hola! Quiero consultar por sus vehículos.')}` : undefined,
              },
              {
                title: 'Email',
                icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                lines: [store.email ?? 'Consultar por email', 'Respondemos en 24hs', 'Cotizaciones y consultas'],
                link: store.email ? `mailto:${store.email}` : undefined,
              },
            ].map(({ icon, title, lines, link }) => (
              <div key={title}
                className="p-8 border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-5 text-slate-400">{icon}</div>
                <h3 className="font-black uppercase tracking-wider text-sm mb-4 text-slate-900">{title}</h3>
                <div className="space-y-1.5 mb-5">
                  {lines.map((l, i) => (
                    <p key={i}
                      className={`text-sm ${i === 0 ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                      {l}
                    </p>
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
