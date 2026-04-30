import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { StoreConfig, Product, Category } from '@/types'

const HERO_FB  = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&q=85'
const SPLIT_FB = 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=85'

const PLAN_FEATURES: Record<string, string[]> = {
  'membresia-basica':       ['Acceso libre lun–sáb 6–23hs','Área de pesas y cardio','Vestuarios y lockers','Wi-Fi gratuito'],
  'membresia-performance':  ['Todo lo básico','Clases grupales ilimitadas','CrossFit · Boxeo · HIIT · Yoga','App de seguimiento'],
  'membresia-elite':        ['Todo Performance','2 sesiones de PT/mes','Asesoramiento nutricional','Acceso prioritario a clases'],
}

interface Props {
  store: StoreConfig
  products: Product[]
  categories: Category[]
  featured: Product[]
}

export function GymHomePage({ store, products, categories, featured }: Props) {
  const heroImg = store.hero_image_url ?? HERO_FB
  const ACCENT  = store.color_accent  // #e63c2f

  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quiero información sobre membresías.`
    : null

  // Get membership products
  const memberships = products.filter(p => p.tags?.includes('mensual')).slice(0, 3)
  // Get class products
  const classes = products.filter(p => p.category?.slug === 'clases' || p.tags?.some(t => ['alta-intensidad','boxeo','yoga','hiit','fuerza'].includes(t))).slice(0, 4)

  const STATS = [
    { num: '500+', label: 'Miembros activos' },
    { num: '20',   label: 'Clases por semana' },
    { num: '5',    label: 'Entrenadores' },
    { num: '3',    label: 'Años de experiencia' },
  ]

  const TRAINERS = [
    { name: 'Lucas Rivas',    role: 'CrossFit & Fuerza',     cert: 'CF-L2 · NSCA-CPT', img: 'https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=400&q=80' },
    { name: 'Valentina Cruz',  role: 'Boxeo Funcional',       cert: 'WBC Certified',     img: 'https://images.unsplash.com/photo-1571019613914-85f342c6a11e?w=400&q=80' },
    { name: 'Martín Solano',   role: 'Personal Training',     cert: 'NSCA · Nutrición',  img: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80' },
    { name: 'Sofía Méndez',    role: 'Yoga & Movilidad',      cert: 'RYT-200 · FMS',     img: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80' },
  ]

  return (
    <div style={{ backgroundColor: '#080808', color: '#f5f5f5' }}>

      {/* ══════════════════════════════════════
          HERO — fullscreen impacto
      ══════════════════════════════════════ */}
      <section className="relative h-screen min-h-[640px] overflow-hidden">
        <Image src={heroImg} alt={store.name} fill priority sizes="100vw"
          className="object-cover object-center" />
        {/* Dark gradient */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.5) 60%, rgba(8,8,8,0.2) 100%)' }} />

        {/* Red accent line */}
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ACCENT }} />

        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
            {store.hero_subtitle ?? 'Entrenamiento de alto rendimiento'}
          </p>

          {/* Giant name */}
          <h1
            className="mb-6 font-black uppercase leading-[0.85]"
            style={{ fontSize: 'clamp(5rem, 16vw, 14rem)', color: '#f5f5f5', letterSpacing: '-0.04em' }}
          >
            {store.hero_title}
          </h1>

          {/* Red underline */}
          <div className="mb-8 h-1 w-20" style={{ backgroundColor: ACCENT }} />

          <p className="mb-10 text-sm md:text-base font-medium max-w-sm" style={{ color: 'rgba(245,245,245,0.5)' }}>
            Metodología funcional, entrenadores certificados y comunidad que te empuja cada día.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/productos?categoria=membresias"
              className="inline-flex items-center px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACCENT, color: '#fff' }}>
              {store.hero_cta_label ?? 'Ver membresías'}
            </Link>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] border transition-colors hover:border-white"
                style={{ borderColor: 'rgba(245,245,245,0.25)', color: '#f5f5f5' }}>
                Consultar →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: ACCENT }}>
        <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className="py-8 px-6 text-center border-r last:border-r-0"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
              <p className="text-4xl md:text-5xl font-black leading-none mb-1" style={{ color: '#fff' }}>
                {s.num}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          MEMBRESÍAS — 3 plan cards
      ══════════════════════════════════════ */}
      <section className="px-6 py-20 md:px-10 md:py-28">
        <div className="mb-14 text-center">
          <p className="mb-3 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
            Nuestros planes
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase leading-none tracking-tight" style={{ color: '#f5f5f5', letterSpacing: '-0.03em' }}>
            Membresías
          </h2>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {memberships.map((plan, i) => {
            const isPopular = plan.tags?.includes('popular')
            const features  = PLAN_FEATURES[plan.slug] ?? plan.description?.split(' · ') ?? []
            return (
              <div key={plan.id}
                className="relative flex flex-col p-8 border transition-all hover:-translate-y-1"
                style={{
                  backgroundColor: isPopular ? ACCENT : '#111',
                  borderColor: isPopular ? ACCENT : 'rgba(245,245,245,0.08)',
                }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[8px] font-black uppercase tracking-[0.2em] bg-white"
                    style={{ color: ACCENT }}>
                    Más elegido
                  </div>
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3"
                  style={{ color: isPopular ? 'rgba(255,255,255,0.7)' : 'rgba(245,245,245,0.35)' }}>
                  {i === 0 ? 'Básica' : i === 1 ? 'Performance' : 'Elite'}
                </p>
                <p className="text-4xl font-black mb-1" style={{ color: '#f5f5f5' }}>
                  {formatPrice(plan.price)}
                </p>
                <p className="text-[10px] mb-8" style={{ color: isPopular ? 'rgba(255,255,255,0.5)' : 'rgba(245,245,245,0.3)' }}>
                  por mes
                </p>
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2 text-xs" style={{ color: isPopular ? 'rgba(255,255,255,0.85)' : 'rgba(245,245,245,0.6)' }}>
                      <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: isPopular ? '#fff' : ACCENT }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/productos/${plan.slug}`}
                  className="block text-center py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                  style={isPopular
                    ? { backgroundColor: '#fff', color: ACCENT }
                    : { backgroundColor: ACCENT, color: '#fff' }
                  }>
                  Elegir plan
                </Link>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/productos?categoria=membresias"
            className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-white"
            style={{ color: 'rgba(245,245,245,0.3)' }}>
            Ver todos los planes →
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CLASES — grid visual
      ══════════════════════════════════════ */}
      {classes.length > 0 && (
        <section style={{ backgroundColor: '#0d0d0d' }}>
          <div className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-24">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
                  Disciplinas
                </p>
                <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight" style={{ letterSpacing: '-0.03em' }}>
                  Clases
                </h2>
              </div>
              <Link href="/productos?categoria=clases"
                className="text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:text-white"
                style={{ color: 'rgba(245,245,245,0.3)' }}>
                Ver todas →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {classes.map((cls, i) => (
                <Link key={cls.id} href={`/productos/${cls.slug}`}
                  className={`group relative overflow-hidden block ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
                  style={{ aspectRatio: i === 0 ? '1/1' : '4/3' }}
                >
                  <div className="absolute inset-0 bg-[#1a1a1a]">
                    {cls.images?.[0] && (
                      <Image src={cls.images[0]} alt={cls.name} fill sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
                    )}
                  </div>
                  {/* Red accent border */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ boxShadow: `inset 0 0 0 2px ${ACCENT}` }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 60%)' }} />
                  <div className="absolute bottom-0 left-0 p-5">
                    <p className="text-sm md:text-base font-black uppercase tracking-tight" style={{ color: '#f5f5f5' }}>
                      {cls.name}
                    </p>
                    <p className="text-xs font-black mt-1" style={{ color: ACCENT }}>
                      {formatPrice(cls.price)} / clase
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════
          FILOSOFÍA — split
      ══════════════════════════════════════ */}
      <section className="grid md:grid-cols-2 min-h-[500px]">
        <div className="relative aspect-[4/3] md:aspect-auto">
          <Image src={SPLIT_FB} alt="Entrenamiento" fill sizes="50vw" className="object-cover" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 60%, rgba(8,8,8,0.8) 100%)' }} />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16" style={{ backgroundColor: '#0d0d0d' }}>
          <p className="mb-4 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>
            {store.home_editorial_label === 'gym' ? 'Nuestra filosofía' : store.home_editorial_label}
          </p>
          <h2 className="mb-4 text-4xl md:text-5xl font-black uppercase leading-[0.9] tracking-tight"
            style={{ color: '#f5f5f5', letterSpacing: '-0.03em' }}>
            {store.home_editorial_title ?? 'Sin excusas'}
          </h2>
          <div className="mb-6 h-1 w-12" style={{ backgroundColor: ACCENT }} />
          <p className="text-sm leading-relaxed max-w-sm mb-10" style={{ color: 'rgba(245,245,245,0.45)' }}>
            {store.home_editorial_body ?? 'Entrenamiento de alto rendimiento para gente que va en serio. Metodología funcional, entrenadores certificados y comunidad que te empuja.'}
          </p>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ backgroundColor: ACCENT, color: '#fff' }}>
              Empezar ahora
            </a>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          ENTRENADORES
      ══════════════════════════════════════ */}
      <section className="px-6 py-20 md:px-10 md:py-24">
        <div className="mb-12">
          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: ACCENT }}>Staff</p>
          <h2 className="text-4xl font-black uppercase leading-none tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            Entrenadores
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TRAINERS.map(trainer => (
            <div key={trainer.name} className="group">
              <div className="relative aspect-[3/4] mb-4 overflow-hidden" style={{ backgroundColor: '#1a1a1a' }}>
                <Image src={trainer.img} alt={trainer.name} fill sizes="25vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                {/* Red overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(to top, ${ACCENT}40 0%, transparent 60%)` }} />
              </div>
              <p className="text-sm font-black uppercase tracking-tight" style={{ color: '#f5f5f5' }}>
                {trainer.name}
              </p>
              <p className="text-[11px] font-bold mt-0.5" style={{ color: ACCENT }}>
                {trainer.role}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(245,245,245,0.3)' }}>
                {trainer.cert}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
          HORARIOS + CTA FINAL
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: ACCENT }}>
        <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-white/60">Horarios</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight text-white mb-8" style={{ letterSpacing: '-0.03em' }}>
              Abrimos<br />todos los días
            </h2>
            <div className="space-y-3">
              {[
                { day: 'Lunes — Viernes', hours: '06:00 – 23:00' },
                { day: 'Sábado',          hours: '08:00 – 20:00' },
                { day: 'Domingo',         hours: '09:00 – 14:00' },
              ].map(item => (
                <div key={item.day} className="flex justify-between py-3 border-b border-white/20">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{item.day}</span>
                  <span className="text-xs font-black text-white">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black uppercase leading-tight text-white mb-4" style={{ letterSpacing: '-0.02em' }}>
              Tu primer clase<br />es gratis
            </h3>
            <p className="text-sm text-white/60 mb-8 leading-relaxed">
              Vení a conocernos sin compromiso. Cualquier clase, cualquier horario. Solo avisá por WhatsApp.
            </p>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: '#080808', color: '#f5f5f5' }}>
                Reservar clase gratis
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
