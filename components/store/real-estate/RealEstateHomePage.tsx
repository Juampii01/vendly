import Image from 'next/image'
import Link from 'next/link'
import { RealEstatePropertyCard } from './RealEstatePropertyCard'
import { NewsletterForm } from '@/components/store/NewsletterForm'
import { FadeUp, SlideLeft, SlideRight, StaggerGrid, StaggerItem } from '@/components/store/motion'
import { formatPrice } from '@/lib/format'
import type { StoreConfig, Category, Product } from '@/types'

// ─── Fallbacks ────────────────────────────────────────────────────────────────

const HERO_FALLBACK =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&q=85'
const SPLIT_FALLBACK =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85'

interface Props {
  store: StoreConfig
  products: Product[]
  featured: Product[]
  categories: Category[]
}

export function RealEstateHomePage({ store, products, featured, categories }: Props) {
  const ACCENT = store.color_accent

  const heroSrc = store.hero_image_url ?? HERO_FALLBACK
  const splitSrc = store.home_split_image_url ?? SPLIT_FALLBACK

  // Separate featured and all
  const propiedadesDestacadas = featured.length > 0 ? featured.slice(0, 6) : products.slice(0, 6)
  const enVenta = products.filter(p => p.tags?.some(t => /venta/i.test(t))).slice(0, 3)
  const enAlquiler = products.filter(p => p.tags?.some(t => /alquiler|rent/i.test(t))).slice(0, 3)

  const whatsappHref = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Me gustaría consultar sobre una propiedad.`
    : null

  return (
    <div className="bg-white text-gray-900">

      {/* ══ HERO ════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: '88vh' }}>
        <Image
          src={heroSrc}
          alt={store.hero_title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(10,10,20,0.88) 0%, rgba(10,10,20,0.55) 55%, rgba(10,10,20,0.15) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,10,20,0.7) 0%, transparent 45%)' }}
        />

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-14 lg:px-20">
          <div className="max-w-2xl">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px" style={{ backgroundColor: ACCENT }} />
              <p
                className="text-[10px] font-black uppercase tracking-[0.45em]"
                style={{ color: ACCENT }}
              >
                {store.hero_subtitle ?? 'Tu próxima propiedad te espera'}
              </p>
            </div>

            {/* Title */}
            <h1
              className="font-black leading-[0.9] tracking-tight text-white mb-8"
              style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.5rem)' }}
            >
              {store.hero_title}
            </h1>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-10">
              {[
                { n: `${products.length}+`, l: 'Propiedades' },
                { n: '100%', l: 'Asesoramiento' },
                { n: `${categories.length}+`, l: 'Tipos' },
              ].map(({ n, l }) => (
                <div key={l}>
                  <p className="text-2xl font-black" style={{ color: ACCENT }}>{n}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {l}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Link
                href={store.hero_cta_url ?? '/productos'}
                className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}
              >
                {store.hero_cta_label ?? 'Ver propiedades'}
              </Link>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] border transition-all hover:bg-white/10"
                  style={{ borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.9)' }}
                >
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-10 hidden md:flex flex-col items-center gap-2">
          <div className="w-px h-12 animate-pulse" style={{ backgroundColor: ACCENT, opacity: 0.4 }} />
          <p
            className="text-[8px] uppercase tracking-[0.4em] rotate-90 origin-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            scroll
          </p>
        </div>
      </section>

      {/* ══ TRUST BAR ═══════════════════════════════════════════════════════════ */}
      <div className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: '🏠', title: 'Propiedades exclusivas', desc: 'Catálogo actualizado' },
            { icon: '🤝', title: 'Asesoramiento gratuito', desc: 'Expertos en el mercado' },
            { icon: '📋', title: 'Gestión completa', desc: 'Escrituras y trámites' },
            { icon: '🔒', title: 'Transacciones seguras', desc: 'Respaldadas legalmente' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <p className="text-xs font-black uppercase tracking-wide text-gray-800">{title}</p>
              <p className="text-[10px] text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TIPOS DE PROPIEDAD (CATEGORÍAS) ══════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Explorá por tipo
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Tipos de propiedad</h2>
              </div>
              <Link
                href="/productos"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Ver todas →
              </Link>
            </FadeUp>
            <StaggerGrid className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {categories.map((cat, i) => (
                <StaggerItem key={cat.id}>
                  <Link
                    href={`/productos?categoria=${cat.slug}`}
                    className="group relative overflow-hidden rounded-xl"
                    style={{ aspectRatio: i === 0 ? '2/1.2' : '3/4' }}
                  >
                    <div className="absolute inset-0">
                      {cat.image_url ? (
                        <Image
                          src={cat.image_url}
                          alt={cat.name}
                          fill
                          sizes="20vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-4xl opacity-20">🏘</span>
                        </div>
                      )}
                    </div>
                    <div
                      className="absolute inset-0 transition-opacity"
                      style={{ background: 'linear-gradient(to top, rgba(10,10,20,0.75) 0%, rgba(10,10,20,0.1) 60%)' }}
                    />
                    <div className="absolute bottom-0 left-0 w-full p-4">
                      <div
                        className="w-5 h-px mb-2 transition-all group-hover:w-8"
                        style={{ backgroundColor: ACCENT }}
                      />
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-white">{cat.name}</p>
                      {cat.description && (
                        <p className="text-[10px] text-white/60 mt-0.5">{cat.description}</p>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ══ PROPIEDADES DESTACADAS ════════════════════════════════════════════════ */}
      {propiedadesDestacadas.length > 0 && (
        <section className="px-4 py-16 md:px-8 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Selección especial
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  Propiedades destacadas
                </h2>
              </div>
              <Link
                href="/productos?featured=true"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Ver todas →
              </Link>
            </FadeUp>
            <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {propiedadesDestacadas.map(p => (
                <StaggerItem key={p.id}>
                  <RealEstatePropertyCard product={p} store={store} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ══ SPLIT EDITORIAL ══════════════════════════════════════════════════════ */}
      {(store.home_editorial_title || store.home_editorial_body) && (
        <section className="grid md:grid-cols-2 min-h-[520px]">
          <SlideLeft className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
            <Image
              src={splitSrc}
              alt="Sobre nosotros"
              fill
              sizes="50vw"
              className="object-cover object-center"
            />
          </SlideLeft>
          <SlideRight
            className="flex flex-col justify-center px-10 py-16 md:px-16"
            style={{ backgroundColor: '#f9fafb' }}
          >
            {store.home_editorial_label && (
              <p
                className="text-[9px] font-black uppercase tracking-[0.4em] mb-5"
                style={{ color: ACCENT }}
              >
                {store.home_editorial_label}
              </p>
            )}
            <h2
              className="font-black leading-[0.9] tracking-tight text-gray-900 mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              {store.home_editorial_title}
            </h2>
            {store.home_editorial_body && (
              <p className="text-sm leading-relaxed text-gray-500 mb-10 max-w-sm">
                {store.home_editorial_body}
              </p>
            )}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/productos"
                className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:brightness-110"
                style={{ backgroundColor: ACCENT }}
              >
                Ver propiedades
              </Link>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-7 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] border border-gray-300 text-gray-700 transition-all hover:bg-gray-100"
                >
                  Contactar
                </a>
              )}
            </div>
          </SlideRight>
        </section>
      )}

      {/* ══ EN VENTA ══════════════════════════════════════════════════════════════ */}
      {enVenta.length > 0 && (
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>
                  Oportunidades
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">En venta</h2>
              </div>
              <Link
                href="/productos?tag=venta"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Ver todas →
              </Link>
            </FadeUp>
            <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enVenta.map(p => (
                <StaggerItem key={p.id}>
                  <RealEstatePropertyCard product={p} store={store} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ══ EN ALQUILER ══════════════════════════════════════════════════════════ */}
      {enAlquiler.length > 0 && (
        <section className="px-4 py-16 md:px-8 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <FadeUp className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#0EA5E9' }}>
                  Disponible ahora
                </p>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">En alquiler</h2>
              </div>
              <Link
                href="/productos?tag=alquiler"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Ver todas →
              </Link>
            </FadeUp>
            <StaggerGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enAlquiler.map(p => (
                <StaggerItem key={p.id}>
                  <RealEstatePropertyCard product={p} store={store} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ══ CTA CONSULTA ════════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80"
          alt="Contactar asesor"
          fill
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(10,10,20,0.93) 0%, rgba(10,10,20,0.75) 50%, rgba(10,10,20,0.5) 100%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex-1 h-px max-w-20 opacity-50" style={{ backgroundColor: ACCENT }} />
            <p
              className="text-[9px] font-black uppercase tracking-[0.45em]"
              style={{ color: ACCENT }}
            >
              Asesoramiento personalizado
            </p>
            <div className="flex-1 h-px max-w-20 opacity-50" style={{ backgroundColor: ACCENT }} />
          </div>
          <h2
            className="font-black uppercase leading-[0.9] text-white mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', letterSpacing: '-0.02em' }}
          >
            ENCONTRÁ<br />TU PROPIEDAD IDEAL
          </h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Nuestros asesores te acompañan en cada paso del proceso.<br />
            Consulta sin compromiso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] text-white transition-all hover:brightness-110 hover:scale-105"
                style={{ backgroundColor: ACCENT }}
              >
                Consultar por WhatsApp
              </a>
            )}
            <Link
              href="/productos"
              className="px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] border transition-all hover:bg-white/8"
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.85)' }}
            >
              Ver propiedades
            </Link>
          </div>
        </div>
      </section>

      {/* ══ MARQUEE ══════════════════════════════════════════════════════════════ */}
      {store.home_marquee_items?.length > 0 && (
        <div className="overflow-hidden py-3.5 border-y" style={{ backgroundColor: ACCENT }}>
          <style>{`
            @keyframes marquee-re { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
            .mq-re { display: flex; width: max-content; animation: marquee-re 28s linear infinite; }
          `}</style>
          <div className="mq-re">
            {[...Array(2)].map((_, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center text-[10px] font-black uppercase tracking-[0.25em] text-white"
              >
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

      {/* ══ NEWSLETTER ══════════════════════════════════════════════════════════ */}
      <section className="px-4 py-20 md:px-8 bg-gray-900">
        <FadeUp className="mx-auto max-w-xl text-center">
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em]"
            style={{ color: ACCENT }}
          >
            Novedades {store.name}
          </p>
          <h2 className="mb-4 text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-4xl">
            Primero te enterás vos
          </h2>
          <p className="mb-8 text-sm text-white/50">
            Nuevas propiedades, oportunidades y novedades del mercado.
          </p>
          <NewsletterForm store={store} />
        </FadeUp>
      </section>

      {/* ══ CONTACTO ════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📍',
              title: 'Visitanos',
              lines: ['Buenos Aires, Argentina', 'Lun–Vie 9:00–18:00', 'Sáb 9:00–13:00'],
            },
            {
              icon: '💬',
              title: 'WhatsApp',
              lines: [
                store.whatsapp_number ?? 'Consultá',
                'Respondemos en minutos',
                'Asesoramiento personalizado',
              ],
              link: whatsappHref ?? undefined,
            },
            {
              icon: '✉️',
              title: 'Email',
              lines: [
                store.email ?? 'Escribinos',
                'Respondemos en 24hs',
                'Consultas y tasaciones',
              ],
              link: store.email ? `mailto:${store.email}` : undefined,
            },
          ].map(({ icon, title, lines, link }) => (
            <div
              key={title}
              className="rounded-2xl border border-gray-100 p-8 bg-white shadow-sm"
            >
              <div className="text-3xl mb-4">{icon}</div>
              <h3 className="font-black uppercase tracking-wider text-sm mb-4 text-gray-900">{title}</h3>
              <div className="space-y-1.5">
                {lines.map((l, i) => (
                  <p key={i} className={`text-sm ${i === 0 ? 'font-semibold text-gray-900' : 'text-gray-400'}`}>
                    {l}
                  </p>
                ))}
              </div>
              {link && (
                <a
                  href={link}
                  target={link.startsWith('http') ? '_blank' : undefined}
                  rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-70"
                  style={{ color: ACCENT }}
                >
                  Contactar →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
