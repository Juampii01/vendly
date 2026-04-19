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
            {['Características', 'Templates', 'Precios', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-sm text-white/60 hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="https://vendly-mod.space/admin/login"
              className="hidden md:block text-sm text-white/60 hover:text-white transition-colors">
              Entrar
            </a>
            <a href="https://vendly-mod.space/admin/login"
              className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Crear mi tienda →
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
          Plataforma en producción · 5 tiendas activas
        </div>

        {/* Headline */}
        <h1 className="relative text-center font-black leading-[0.9] tracking-tight mb-6 max-w-5xl"
          style={{ fontSize: 'clamp(3rem, 9vw, 7rem)' }}>
          <span className="block text-white">TU TIENDA ONLINE</span>
          <span className="block"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EN 5 MINUTOS.
          </span>
        </h1>

        <p className="relative text-center max-w-xl text-lg mb-10"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          Creá tu ecommerce profesional, conectá tu dominio propio y empezá a vender.
          Sin saber programar. Sin complicaciones. Sin excusas.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16">
          <a href="https://vendly-mod.space/admin/login"
            className="group px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 hover:shadow-2xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            }}>
            Crear mi tienda gratis
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
            Ver demo en video
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
                  mitienda.com
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
            { value: 5, suffix: '+', label: 'Tiendas activas' },
            { value: 4, suffix: '', label: 'Templates únicos' },
            { value: 100, suffix: '%', label: 'White-label' },
            { value: 5, suffix: 'min', label: 'Setup promedio' },
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
      <section id="características" className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#6366f1' }}>Simple como debe ser</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Tres pasos y estás vendiendo</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: '🏗️',
                title: 'Creás tu tienda',
                desc: 'Elegís el template, le ponés nombre, configurás los colores. En minutos tenés una tienda lista con tu identidad.',
                color: '#6366f1',
              },
              {
                step: '02',
                icon: '🤖',
                title: 'La IA la completa',
                desc: 'Hablás con el editor y la IA carga productos, ajusta diseño, escribe descripciones. Como tener un equipo de marketing.',
                color: '#8b5cf6',
              },
              {
                step: '03',
                icon: '🚀',
                title: 'Conectás tu dominio',
                desc: 'Apuntás tu dominio propio y listo. Tus clientes entran a mitienda.com — Vendly es completamente invisible.',
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
            <h2 className="text-3xl md:text-4xl font-black mb-4">Mirá cómo funciona</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>2 minutos y vas a querer empezar hoy mismo</p>
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
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Ver presentación completa</p>
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
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#8b5cf6' }}>Todo incluido</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Lo que hace especial a Vendly</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🌐', title: 'Dominio propio', desc: 'Cada cliente tiene su dominio. Tu marca, solo tu marca. Vendly es invisible para el comprador final.' },
              { icon: '🤖', title: 'Editor con IA', desc: 'Hablás en español y la IA cambia colores, textos, crea productos, ajusta diseño. Sin saber programar.' },
              { icon: '💳', title: 'MercadoPago integrado', desc: 'Pagos online, cuotas, transferencias. Sin configuración técnica. Empezás a cobrar desde el día uno.' },
              { icon: '📱', title: '100% responsive', desc: 'Se ve perfecto en celular, tablet y escritorio. Diseño mobile-first para que nadie rebote.' },
              { icon: '📦', title: 'Catálogo completo', desc: 'Productos con variantes (talle, color), stock, imágenes múltiples, descuentos y categorías.' },
              { icon: '🔔', title: 'Carritos abandonados', desc: 'El sistema detecta carritos abandonados y manda emails y WhatsApp automáticos para recuperarlos.' },
              { icon: '🎨', title: '4 templates únicos', desc: 'Default, Editorial, Bold, Concesionaria. Cada uno con su identidad visual y estructura distintas.' },
              { icon: '📊', title: 'Dashboard de métricas', desc: 'Pedidos del día, facturación, tasa de conversión. Todo en tiempo real desde el admin.' },
              { icon: '⚡', title: 'Ultra rápido', desc: 'Next.js 15 con Server Components. Carga en milisegundos. Google lo ama. Tus clientes también.' },
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
      <section id="templates" className="py-28 px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#06b6d4' }}>Diseños listos para usar</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Cuatro templates. Infinitas tiendas.</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Cada template tiene su propia identidad. Vos personalizás los colores, imágenes y contenido — el resultado siempre es único.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                name: 'Default',
                desc: 'Oscuro, elegante, minimalista. Para marcas de indumentaria premium.',
                tag: 'Moda / Lifestyle',
                color: '#f59e0b',
                bg: 'from-yellow-900/20 to-transparent',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=70',
                demo: 'spriovani-indumentaria.vendly-mod.space',
              },
              {
                name: 'Editorial (Modo)',
                desc: 'Crema, rojo fuego, tipografía de revista. Hero split 50/50 y carrusel.',
                tag: 'Moda / Editorial',
                color: '#ef4444',
                bg: 'from-red-900/20 to-transparent',
                img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=70',
                demo: 'pagina-prueba.vendly-mod.space',
              },
              {
                name: 'Bold (Athletic)',
                desc: 'Negro absoluto, blanco, impacto total. Para marcas deportivas y urbanas.',
                tag: 'Deportivo / Streetwear',
                color: '#6366f1',
                bg: 'from-indigo-900/20 to-transparent',
                img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&q=70',
                demo: 'adidas.vendly-mod.space',
              },
              {
                name: 'Dealership',
                desc: 'Azul noche y dorado. Cards de vehículos, ficha técnica, consulta por WhatsApp.',
                tag: 'Autos / Concesionaria',
                color: '#f59e0b',
                bg: 'from-amber-900/20 to-transparent',
                img: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=70',
                demo: 'ona-store.vendly-mod.space',
              },
            ].map(({ name, desc, tag, color, img, demo }) => (
              <div key={name}
                className="group relative rounded-2xl overflow-hidden border hover:scale-[1.01] transition-transform"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  <Image src={img} alt={name} fill className="object-cover object-top brightness-75 group-hover:brightness-90 transition-all group-hover:scale-105 duration-700" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(5,5,8,0.95) 100%)' }} />
                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                      style={{ backgroundColor: `${color}25`, color: color, border: `1px solid ${color}40` }}>
                      {tag}
                    </span>
                  </div>
                </div>
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-lg font-black mb-1">{name}</h3>
                  <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                  <a href={`https://${demo}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold transition-all hover:gap-3"
                    style={{ color: color }}>
                    Ver demo en vivo →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PRICING ══════════════════════════════════════════════════════════ */}
      <section id="precios" className="py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>Sin sorpresas</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">Precios que escalan con vos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '$0',
                period: 'para empezar',
                color: 'rgba(255,255,255,0.06)',
                border: 'rgba(255,255,255,0.1)',
                highlight: false,
                features: ['1 tienda', '10 productos', 'Subdominio vendly', 'Template estándar', 'Soporte por email'],
                cta: 'Empezar gratis',
                ctaStyle: { border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
              },
              {
                name: 'Pro',
                price: '$19.990',
                period: 'por mes',
                color: 'rgba(99,102,241,0.15)',
                border: 'rgba(99,102,241,0.5)',
                highlight: true,
                features: ['1 tienda', 'Productos ilimitados', 'Dominio propio', 'Todos los templates', 'Editor IA incluido', 'MercadoPago', 'Soporte prioritario'],
                cta: 'Empezar ahora',
                ctaStyle: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' },
              },
              {
                name: 'Business',
                price: '$49.990',
                period: 'por mes',
                color: 'rgba(255,255,255,0.03)',
                border: 'rgba(255,255,255,0.08)',
                highlight: false,
                features: ['Tiendas ilimitadas', 'Productos ilimitados', 'Dominios propios', 'Template exclusivo', 'Editor IA avanzado', 'WhatsApp automático', 'Métricas avanzadas'],
                cta: 'Hablar con ventas',
                ctaStyle: { border: '1px solid rgba(255,255,255,0.2)', color: 'white' },
              },
            ].map(({ name, price, period, color, border, highlight, features, cta, ctaStyle }) => (
              <div key={name}
                className="relative p-8 rounded-2xl border flex flex-col"
                style={{ backgroundColor: color, borderColor: border }}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Más popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{price}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      <span className="text-green-400 text-xs">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="https://vendly-mod.space/admin/login"
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
            <h2 className="text-3xl md:text-4xl font-black">Lo que dicen los que ya lo usan</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Lucía M.',
                role: 'Dueña de tienda de indumentaria',
                avatar: 'L',
                text: 'En una tarde armé toda mi tienda. Antes me pedían $80.000 por algo parecido. Con Vendly lo hice sola y quedó mejor.',
                stars: 5,
              },
              {
                name: 'Rodrigo P.',
                role: 'Concesionaria de autos',
                avatar: 'R',
                text: 'El template de concesionaria es exactamente lo que necesitaba. Mis clientes entran a mi dominio y no saben que hay tecnología detrás.',
                stars: 5,
              },
              {
                name: 'Valentina S.',
                role: 'Emprendedora digital',
                avatar: 'V',
                text: 'La IA es un golazo. Le digo qué quiero y lo cambia al toque. Es como tener un diseñador disponible las 24 horas.',
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
              { q: '¿Necesito saber programar?', a: 'Para nada. Vendly está diseñado para que cualquier persona pueda crear y gestionar su tienda. El editor con IA hace el trabajo técnico por vos.' },
              { q: '¿Cómo funciona el dominio propio?', a: 'Comprás tu dominio en cualquier registrador (GoDaddy, Namecheap, NIC Argentina), lo apuntás a nuestros servidores con un registro CNAME, y listo. Los visitantes ven tu dominio — Vendly no aparece.' },
              { q: '¿Puedo cambiar de template después?', a: 'Sí. Podés cambiar el template en cualquier momento desde el panel de administración. El contenido (productos, categorías, imágenes) se mantiene.' },
              { q: '¿Cómo cobro los pagos?', a: 'A través de MercadoPago. Los pagos van directamente a tu cuenta de MercadoPago. Vendly no toca tu plata.' },
              { q: '¿Qué pasa si quiero cancelar?', a: 'Podés cancelar cuando quieras. No hay contratos ni permanencia mínima. En el plan gratuito podés quedarte sin pagar nada.' },
              { q: '¿Puedo tener varias tiendas?', a: 'Sí, con el plan Business tenés tiendas ilimitadas. Podés tener una para cada cliente si sos agencia, o una para cada rubro si tenés varios negocios.' },
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
            Tu tienda online.<br />
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Hoy.
            </span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Empezá gratis. Sin tarjeta de crédito. Sin compromiso.<br />
            En 5 minutos podés estar vendiendo.
          </p>
          <a href="https://vendly-mod.space/admin/login"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-black text-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 0 60px rgba(99,102,241,0.5)',
            }}>
            Crear mi tienda gratis →
          </a>
          <p className="mt-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Sin tarjeta. Sin instalación. Sin técnicos.
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
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            <a href="https://vendly-mod.space/admin/login" className="hover:text-white transition-colors">Admin</a>
          </div>
        </div>
      </footer>

      {/* ══ VIDEO MODAL ══════════════════════════════════════════════════════ */}
      {videoOpen && <VideoModal onClose={() => setVideoOpen(false)} />}

    </div>
  )
}
