'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─────────────────────────────────────────────────────────────────────────────
// VENDLY MARKETING PAGE
// Landing page para presentar Vendly a potenciales clientes.
// Diseño: dark premium, gradientes morado/índigo, tipografía de impacto.
// ─────────────────────────────────────────────────────────────────────────────

// ── Counter animado ───────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const steps = 60
          const increment = target / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= target) { setCount(target); clearInterval(timer) }
            else setCount(Math.floor(current))
          }, duration / steps)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ── Video Modal ───────────────────────────────────────────────────────────────
function VideoModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        style={{ aspectRatio: '16/9' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Placeholder — reemplazá el src con tu URL de YouTube/Vimeo */}
        <div
          className="w-full h-full rounded-2xl flex flex-col items-center justify-center gap-6"
          style={{ backgroundColor: '#111', border: '1px solid #333' }}
        >
          <div className="text-6xl">▶</div>
          <p className="text-white/60 text-sm text-center max-w-xs">
            Reemplazá este bloque con un iframe de YouTube, Vimeo o Loom.<br />
            <code className="text-indigo-400 text-xs mt-2 block">/components/store/vendly-marketing/VendlyMarketingPage.tsx</code>
          </p>
        </div>
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: '#333' }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export function VendlyMarketingPage() {
  const [videoOpen, setVideoOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ backgroundColor: '#050508', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ══ NAVBAR ═══════════════════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(5,5,8,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-black text-lg tracking-tight">Vendly</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: 'Cómo funciona', href: '#como-funciona' },
              { label: 'Proyectos', href: '#proyectos' },
              { label: 'Planes', href: '#planes' },
              { label: 'FAQ', href: '#faq' },
            ].map(item => (
              <a key={item.label} href={item.href}
                className="text-sm text-white/60 hover:text-white transition-colors">
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="https://wa.me/5491100000000?text=Hola! Quiero información sobre Vendly"
              target="_blank" rel="noopener noreferrer"
              className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">
              Contacto
            </a>
            <a href="https://wa.me/5491100000000?text=Hola! Quiero solicitar mi web"
              target="_blank" rel="noopener noreferrer"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Solicitar mi web →
            </a>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-16">

        {/* Glow background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 40%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: '#06b6d4' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
            style={{ background: '#f59e0b' }} />
          {/* Grid */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} />
        </div>

        {/* Badge */}
        <div className="relative mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border"
          style={{ borderColor: 'rgba(99,102,241,0.4)', backgroundColor: 'rgba(99,102,241,0.1)', color: '#a5b4fc' }}>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Servicio activo · webs diseñadas y entregadas
        </div>

        {/* Headline */}
        <h1 className="relative text-center font-black leading-[0.9] tracking-tight mb-6 max-w-5xl"
          style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}>
          <span className="block text-white">TENÉ TU WEB LISTA</span>
          <span className="block"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EN DÍAS, NO EN MESES.
          </span>
        </h1>

        <p className="relative text-center max-w-xl text-lg mb-10"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          Diseñamos, configuramos y dejamos tu página funcionando
          para que empieces a vender sin complicarte.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16">
          <a href="https://wa.me/5491100000000?text=Hola! Quiero solicitar mi web"
            target="_blank" rel="noopener noreferrer"
            className="group px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            }}>
            Solicitar mi web
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <button
            onClick={() => setVideoOpen(true)}
            className="flex items-center gap-3 px-6 py-4 rounded-xl font-medium text-base border transition-all hover:bg-white/5"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            <span className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}>
              ▶
            </span>
            Ver cómo lo hacemos
          </button>
        </div>

        {/* Dashboard mockup */}
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="absolute inset-0 rounded-2xl blur-3xl opacity-30"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
          <div className="relative rounded-2xl overflow-hidden border"
            style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#0d0d14' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 h-10 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0a0a10' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div className="max-w-xs mx-auto h-5 rounded-md flex items-center px-3 text-[10px]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  minegocio.com
                </div>
              </div>
            </div>
            {/* Store preview */}
            <div className="aspect-video relative overflow-hidden" style={{ backgroundColor: '#0d0d14' }}>
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
                alt="Store preview"
                fill
                className="object-cover object-top opacity-60"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, #0d0d14 100%)' }} />
              {/* Overlay UI elements */}
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="px-6 h-12 rounded-full flex items-center gap-8"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <span className="font-black text-sm tracking-[0.2em]">MODO</span>
                  <div className="flex gap-4 text-xs text-white/60">
                    <span>Remeras</span><span>Pantalones</span><span>Vestidos</span>
                  </div>
                  <div className="w-5 h-5 relative">
                    <span className="text-white/80 text-sm">🛒</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-8 left-8">
                <div className="text-4xl font-black uppercase text-white mb-2">VESTITE CON<br/>INTENCIÓN</div>
                <div className="px-4 py-2 text-xs font-bold uppercase rounded inline-block"
                  style={{ backgroundColor: '#6366f1' }}>Explorar →</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ NÚMEROS ═════════════════════════════════════════════════════════ */}
      <section className="py-20 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 8, suffix: '+', label: 'Webs entregadas' },
            { value: 4, suffix: '', label: 'Diseños exclusivos' },
            { value: 100, suffix: '%', label: 'Llave en mano' },
            { value: 7, suffix: 'días', label: 'Entrega promedio' },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <div className="text-4xl md:text-5xl font-black mb-2"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CÓMO FUNCIONA ════════════════════════════════════════════════════ */}
      <section id="como-funciona" className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#6366f1' }}>Sin vueltas</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Así trabajamos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '🗣️',
                title: 'Nos contás qué necesitás',
                desc: 'Nos contás tu rubro, tus productos y cómo te imaginás la página. Sin formularios eternos — una llamada o un mensaje alcanza.',
                color: '#6366f1',
              },
              {
                step: '02',
                icon: '🛠️',
                title: 'Nosotros la construimos',
                desc: 'Nuestro equipo diseña, configura y carga todo. Productos, colores, dominio, medios de pago. Vos no tocás nada técnico.',
                color: '#8b5cf6',
              },
              {
                step: '03',
                icon: '✅',
                title: 'La recibís lista para usar',
                desc: 'En días tenés tu web funcionando, con tu dominio, lista para vender. Y con soporte para lo que necesites después.',
                color: '#06b6d4',
              },
            ].map(({ step, icon, title, desc, color }) => (
              <div key={step}
                className="relative p-8 rounded-2xl border group hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
                  style={{ background: `radial-gradient(circle at center, ${color}20, transparent)` }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{icon}</span>
                    <span className="text-xs font-black" style={{ color: color }}>PASO {step}</span>
                  </div>
                  <h3 className="text-xl font-black mb-3">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ VIDEO ════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Mirá cómo construimos una web</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>2 minutos que te van a ahorrar meses de trabajo</p>
          </div>
          <button
            onClick={() => setVideoOpen(true)}
            className="relative w-full rounded-2xl overflow-hidden group cursor-pointer border"
            style={{ aspectRatio: '16/9', borderColor: 'rgba(255,255,255,0.1)' }}>
            <Image
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"
              alt="Video preview"
              fill
              className="object-cover brightness-50 group-hover:brightness-40 transition-all"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 0 60px rgba(99,102,241,0.6)',
                }}>
                <span className="text-3xl ml-1">▶</span>
              </div>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Ver proceso completo</p>
            </div>
            {/* Glow border */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ boxShadow: 'inset 0 0 60px rgba(99,102,241,0.2)' }} />
          </button>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section className="py-28 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#8b5cf6' }}>Todo lo que necesitás, ya incluido</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Lo que entregamos en cada proyecto</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🎨', title: 'Diseño profesional incluido', desc: 'Tu web diseñada desde cero con identidad propia. Colores, tipografías, imágenes y layout pensados para tu marca.' },
              { icon: '🌐', title: 'Dominio configurado', desc: 'Comprás tu dominio (o ya tenés uno) y nosotros lo conectamos. Tus clientes ven tu dirección, no la nuestra.' },
              { icon: '💳', title: 'MercadoPago listo para cobrar', desc: 'Pagos online, cuotas y transferencias desde el día uno. Sin configuraciones técnicas de tu parte.' },
              { icon: '📱', title: 'Optimizada para mobile', desc: 'La mayoría de tus clientes entran desde el celular. Tu web se ve impecable en cualquier pantalla.' },
              { icon: '📦', title: 'Catálogo de productos cargado', desc: 'Cargamos tus productos con fotos, descripción, precio y variantes. Vos solo empezás a vender.' },
              { icon: '🔔', title: 'Carritos abandonados automáticos', desc: 'El sistema detecta cuando alguien deja productos sin comprar y manda recordatorios automáticos por email y WhatsApp.' },
              { icon: '💬', title: 'WhatsApp integrado', desc: 'Tus clientes pueden consultarte directo por WhatsApp. Sin fricción, sin formularios complicados.' },
              { icon: '📊', title: 'Panel simple para gestionar todo', desc: 'Ves pedidos, métricas y stock en tiempo real. Sin complicaciones técnicas — está hecho para que lo uses vos.' },
              { icon: '⚡', title: 'Velocidad y SEO desde el día uno', desc: 'Tu web carga rápido y está optimizada para Google desde que se entrega. Sin plugins, sin configuración extra.' },
            ].map(({ icon, title, desc }) => (
              <div key={title}
                className="p-6 rounded-xl border hover:border-indigo-500/30 transition-all group"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="text-2xl mb-4">{icon}</div>
                <h3 className="font-bold mb-2 text-sm">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TEMPLATES SHOWCASE ═══════════════════════════════════════════════ */}
      <section id="proyectos" className="py-28 px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#06b6d4' }}>Estructuras probadas</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Estructuras probadas. Resultados garantizados.</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Trabajamos sobre estructuras diseñadas y probadas para acelerar los resultados. Nosotros adaptamos cada una a tu negocio.
            </p>
          </div>
          {/* Proyecto destacado — El Rincón del Libro */}
          {(() => {
            // Librería template: #2C1A0E · #B5632A · #FAF6EF
            const featured = {
              name: 'El Rincón del Libro',
              subtitle: 'Librería',
              tagline: 'Paleta crema y ámbar. Diseño editorial con tipografía serif, filtros por género y carrito completo.',
              accent: '#B5632A',
              img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&q=80',
              demo: 'el-rincon-del-libro.vendly-mod.space',
            }
            return (
              <a href={`https://${featured.demo}`} target="_blank" rel="noopener noreferrer"
                className="group block relative rounded-2xl overflow-hidden border mb-6 hover:scale-[1.005] transition-transform cursor-pointer"
                style={{ borderColor: `${featured.accent}30` }}>
                <div className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
                  <Image src={featured.img} alt={featured.name} fill className="object-cover object-center brightness-60 group-hover:brightness-75 transition-all group-hover:scale-105 duration-700" />
                  {/* Warm gradient matching the librería bg palette */}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 25%, ${featured.accent}18 60%, rgba(5,5,8,0.97) 100%)` }} />
                  {/* Accent bar at top */}
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: featured.accent }} />
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${featured.accent}25`, color: featured.accent, border: `1px solid ${featured.accent}50` }}>
                      {featured.subtitle}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                      Proyecto real
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="text-2xl font-black mb-2">{featured.name}</h3>
                  <p className="text-sm mb-5 max-w-xl" style={{ color: 'rgba(255,255,255,0.55)' }}>{featured.tagline}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                    style={{ color: featured.accent }}>
                    Ver en vivo →
                  </span>
                </div>
              </a>
            )
          })()}

          {/* Resto de proyectos */}
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                name: 'Spriovani',
                desc: 'Indumentaria. Fondo negro, tipografía blanca en mayúsculas, acento dorado. Variantes de talle y color, carrito deslizable.',
                tag: 'Indumentaria',
                // default ecommerce template: dark · gold
                color: '#C9A96E',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75',
                objPos: 'object-center',
                demo: 'spriovani-indumentaria.vendly-mod.space',
              },
              {
                name: 'Modo',
                desc: 'Moda editorial. Paleta crema (#FAF7F2) y rojo fuego (#E63329). Hero de modelo a pantalla completa, carrusel de colección.',
                tag: 'Moda Editorial',
                // modo-setup.sql: color_accent = #E63329
                color: '#E63329',
                img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=75',
                objPos: 'object-top',
                demo: 'pagina-prueba.vendly-mod.space',
              },
              {
                name: 'Adidas',
                desc: 'Streetwear. Blanco total, tipografía negra de impacto, acento rojo fuego (#FF3A20). Marquee animado y sección editorial split.',
                tag: 'Deportivo',
                // athletic-setup.sql: color_accent = #FF3A20
                color: '#FF3A20',
                img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=75',
                objPos: 'object-center',
                demo: 'adidas.vendly-mod.space',
              },
              {
                name: 'Peugeot',
                desc: 'Concesionaria. Fondo casi negro (#0d0d18), acento dorado, cards por vehículo con ficha técnica y CTA directo a WhatsApp.',
                tag: 'Automotriz',
                // dealership template: dark navy · gold
                color: '#D4A847',
                img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=75',
                objPos: 'object-center',
                demo: 'ona-store.vendly-mod.space',
              },
            ].map(({ name, desc, tag, color, img, objPos, demo }) => (
              <a key={name} href={`https://${demo}`} target="_blank" rel="noopener noreferrer"
                className="group relative rounded-2xl overflow-hidden border hover:scale-[1.01] transition-transform block cursor-pointer"
                style={{ borderColor: `${color}25` }}>
                {/* Accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ backgroundColor: color }} />
                <div className="relative aspect-video overflow-hidden">
                  <Image src={img} alt={name} fill className={`object-cover ${objPos} brightness-75 group-hover:brightness-90 transition-all group-hover:scale-105 duration-700`} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 35%, ${color}12 65%, rgba(5,5,8,0.96) 100%)` }} />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${color}25`, color: color, border: `1px solid ${color}50` }}>
                      {tag}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-black mb-1">{name}</h3>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold group-hover:gap-3 transition-all"
                    style={{ color: color }}>
                    Ver en vivo →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══════════════════════════════════════════════════════════ */}
      <section id="planes" className="py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>A tu medida</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Planes según tu proyecto</h2>
            <p className="mt-4 max-w-md mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Cada proyecto es distinto. Hablamos con vos, entendemos qué necesitás y te damos una propuesta a medida.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Presencia Digital',
                tagline: 'Ideal para emprendedores y negocios que recién arrancan.',
                color: 'rgba(255,255,255,0.06)',
                border: 'rgba(255,255,255,0.1)',
                highlight: false,
                features: ['Diseño personalizado', 'Hasta 20 productos cargados', 'Dominio propio configurado', 'MercadoPago integrado', 'WhatsApp conectado'],
                cta: 'Consultar',
                ctaStyle: { border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
              },
              {
                name: 'Tienda Completa',
                tagline: 'Para negocios con catálogo amplio que quieren vender más.',
                color: 'rgba(99,102,241,0.15)',
                border: 'rgba(99,102,241,0.5)',
                highlight: true,
                features: ['Todo del plan Presencia', 'Catálogo ilimitado cargado', 'Carritos abandonados activos', 'Panel de métricas incluido', 'Soporte prioritario post-entrega'],
                cta: 'Consultar',
                ctaStyle: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' },
              },
              {
                name: 'A Medida',
                tagline: 'Para proyectos con necesidades específicas o múltiples páginas.',
                color: 'rgba(255,255,255,0.03)',
                border: 'rgba(255,255,255,0.08)',
                highlight: false,
                features: ['Diseño exclusivo', 'Funcionalidades personalizadas', 'Integraciones especiales', 'Múltiples páginas o secciones', 'Soporte y mantenimiento continuo'],
                cta: 'Hablemos',
                ctaStyle: { border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
              },
            ].map(({ name, tagline, color, border, highlight, features, cta, ctaStyle }) => (
              <div key={name}
                className="relative p-8 rounded-2xl border flex flex-col"
                style={{ backgroundColor: color, borderColor: border }}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Más elegido
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</p>
                  <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.6)' }}>{tagline}</p>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span className="text-green-400 text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="https://wa.me/5491100000000?text=Hola! Quiero información sobre los planes de Vendly"
                  target="_blank" rel="noopener noreferrer"
                  className="block text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
                  style={ctaStyle}>
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ════════════════════════════════════════════════════ */}
      <section className="py-20 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">Lo que dicen nuestros clientes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Lucía M.',
                role: 'Tienda de indumentaria',
                avatar: 'L',
                text: 'Me entregaron la web en menos de una semana. Yo no tuve que hacer nada más que contarles qué quería. Quedó exactamente como lo imaginé.',
                stars: 5,
              },
              {
                name: 'Rodrigo P.',
                role: 'Concesionaria de autos',
                avatar: 'R',
                text: 'Le pedí la página para la concesionaria y en pocos días tenía todo funcionando. MercadoPago, WhatsApp, catálogo de autos — me lo entregaron listo para usar.',
                stars: 5,
              },
              {
                name: 'Valentina S.',
                role: 'Emprendedora',
                avatar: 'V',
                text: 'Yo no entiendo nada de páginas web. Les mandé referencias por Instagram y ellos lo tradujeron en un diseño increíble. Solo tuve que aprobar.',
                stars: 5,
              },
            ].map(({ name, role, avatar, text, stars }) => (
              <div key={name}
                className="p-6 rounded-2xl border"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex mb-4 gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-28 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-2">
            {[
              { q: '¿Cuánto tarda en estar lista mi web?', a: 'En la mayoría de los proyectos entregamos entre 5 y 10 días hábiles. Depende del alcance y la cantidad de productos, pero siempre te damos un plazo estimado antes de arrancar.' },
              { q: '¿Qué necesito de mi parte para arrancar?', a: 'Solo contarnos qué vendés, cómo querés que se vea y compartir tus imágenes y productos. Nosotros nos encargamos del resto.' },
              { q: '¿Puedo pedir cambios después de la entrega?', a: 'Sí. Todos los proyectos incluyen un período de ajustes post-entrega. Y si querés seguir haciendo cambios después, tenemos planes de soporte continuo.' },
              { q: '¿Cómo funcionan los pagos de mis clientes?', a: 'A través de MercadoPago. Los pagos van directo a tu cuenta — nosotros solo configuramos la integración. Vendly no toca tu plata.' },
              { q: '¿Mi web es mía o es de Vendly?', a: 'Es tuya. Vos tenés acceso completo y control total sobre el contenido y el panel de administración. Vendly es completamente invisible para tus clientes.' },
              { q: '¿Qué pasa si quiero cambiar algo del diseño más adelante?', a: 'Podés pedírnoslo cuando quieras. Tenemos planes de mantenimiento o podés contratar cambios puntuales. Siempre vamos a estar disponibles.' },
            ].map(({ q, a }, i) => (
              <div key={i}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: faqOpen === i ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)' }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/5"
                >
                  <span className="font-semibold text-sm">{q}</span>
                  <span className="text-lg transition-transform duration-200 flex-shrink-0 ml-4"
                    style={{ transform: faqOpen === i ? 'rotate(45deg)' : 'none', color: 'rgba(255,255,255,0.4)' }}>
                    +
                  </span>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA FINAL ════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1, #8b5cf6, transparent)' }} />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Tu web lista.<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              En días.
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Días, no meses. Nosotros nos encargamos del diseño,<br />
            la configuración y la entrega. Vos solo empezás a vender.
          </p>
          <a href="https://wa.me/5491100000000?text=Hola! Quiero solicitar mi web"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-black text-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 60px rgba(99,102,241,0.5)',
            }}>
            Solicitar mi web →
          </a>
          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Respondemos en menos de 24 horas.
          </p>
        </div>
      </section>

      {/* ══ FOOTER ═══════════════════════════════════════════════════════════ */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-black">Vendly</span>
            <span className="text-xs ml-2" style={{ color: 'rgba(255,255,255,0.25)' }}>© 2026</span>
          </div>
          <div className="flex gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <a href="/terminos" className="hover:text-white transition-colors">Términos</a>
            <a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a>
            <a href="https://wa.me/5491100000000?text=Hola! Quiero información sobre Vendly"
              target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>

      {/* ══ VIDEO MODAL ══════════════════════════════════════════════════════ */}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}

    </div>
  )
}
