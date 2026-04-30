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

        {/* ── Hero mockup ──────────────────────────────────────────────── */}
        <div className="relative w-full max-w-5xl mx-auto mt-4">

          {/* Glow aura */}
          <div className="absolute -inset-8 rounded-3xl blur-3xl opacity-25 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, #8b5cf6 40%, transparent 70%)' }} />

          {/* Floating stat — left */}
          <div className="absolute -left-4 top-1/4 z-10 hidden lg:block">
            <div className="px-4 py-3 rounded-xl shadow-2xl border"
              style={{ backgroundColor: '#0d0d18', borderColor: 'rgba(255,255,255,0.09)', minWidth: '148px' }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.38)' }}>Visitas hoy</p>
              <p className="text-2xl font-black text-white leading-none">1.247</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold" style={{ color: '#22c55e' }}>↑ 23%</span>
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>vs ayer</span>
              </div>
            </div>
          </div>

          {/* Floating stat — right */}
          <div className="absolute -right-4 top-1/3 z-10 hidden lg:block">
            <div className="px-4 py-3 rounded-xl shadow-2xl border"
              style={{ backgroundColor: '#0d0d18', borderColor: 'rgba(255,255,255,0.09)', minWidth: '148px' }}>
              <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.38)' }}>Consultas / mes</p>
              <p className="text-2xl font-black text-white leading-none">84</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold" style={{ color: '#6366f1' }}>WhatsApp</span>
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>+ Email</span>
              </div>
            </div>
          </div>

          {/* Floating notification — bottom left */}
          <div className="absolute -left-2 bottom-10 z-10 hidden lg:flex items-center gap-3 px-4 py-2.5 rounded-xl border shadow-2xl"
            style={{ backgroundColor: '#0d0d18', borderColor: 'rgba(34,197,94,0.25)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <svg width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 014.69 11.9 19.8 19.8 0 011.62 3.3 2 2 0 013.61 1.1h3a2 2 0 012 1.72 12.8 12.8 0 00.7 2.81 2 2 0 01-.45 2.11L7.91 8.73a16 16 0 006.29 6.29l.89-.97a2 2 0 012.11-.45 12.8 12.8 0 002.81.7A2 2 0 0122 16.92z"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white">Nueva consulta vía WhatsApp</p>
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.4)' }}>hace 2 minutos</p>
            </div>
          </div>

          {/* Browser frame */}
          <div className="relative rounded-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#07070e' }}>

            {/* Chrome bar */}
            <div className="flex items-center gap-3 px-4 h-10 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: '#040408' }}>
              <div className="flex gap-1.5 shrink-0">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#febc2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28c840' }} />
              </div>
              {/* Tabs */}
              <div className="flex items-center gap-1 ml-2 shrink-0">
                <div className="flex items-center gap-1.5 h-7 px-3 rounded-t text-[9px] font-medium"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#D4A847', opacity: 0.8 }} />
                  peugeot — Concesionaria
                </div>
              </div>
              {/* URL */}
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 h-6 px-3 rounded text-[9px] w-56"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  peugeot.vendly-mod.space
                </div>
              </div>
            </div>

            {/* Store content — simulated Peugeot page */}
            <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>

              {/* BG photo */}
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=80"
                alt="Peugeot store preview" fill priority
                className="object-cover object-center"
                style={{ opacity: 0.4 }}
              />
              {/* Cinematic overlay */}
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(115deg, rgba(3,3,8,0.97) 0%, rgba(3,3,8,0.65) 45%, rgba(3,3,8,0.15) 100%)' }} />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(3,3,8,0.9) 0%, transparent 50%)' }} />

              {/* Accent left column */}
              <div className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ background: 'linear-gradient(to bottom, transparent, #D4A847 30%, #D4A847 70%, transparent)' }} />

              {/* Simulated navbar */}
              <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 h-12 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.97)' }}>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-6 rounded-full" style={{ backgroundColor: '#D4A847' }} />
                    <span className="font-black text-slate-900 text-[10px] tracking-[0.08em] uppercase">PEUGEOT</span>
                  </div>
                  <div className="hidden md:flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    <span>Modelos</span>
                    <span>0 km</span>
                    <span>Usados</span>
                  </div>
                </div>
                <div className="px-4 py-1.5 text-[8px] font-black uppercase tracking-wider text-white"
                  style={{ backgroundColor: '#D4A847' }}>
                  Test Drive
                </div>
              </div>

              {/* Hero content */}
              <div className="absolute inset-0 flex flex-col justify-end px-6 pb-5 pt-14">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-px" style={{ backgroundColor: '#D4A847' }} />
                  <span className="text-[7px] font-black uppercase tracking-[0.4em]" style={{ color: '#D4A847' }}>
                    Concesionaria Oficial
                  </span>
                </div>
                <h2 className="font-black uppercase text-white leading-[0.88] mb-4"
                  style={{ fontSize: 'clamp(1.2rem, 3.5vw, 2.8rem)', letterSpacing: '-0.04em' }}>
                  MANEJÁ EL<br/>FUTURO HOY
                </h2>

                {/* Vehicle cards row */}
                <div className="flex gap-2">
                  {[
                    { name: 'Peugeot 208', tag: '0 KM', price: '$28.500.000' },
                    { name: 'Peugeot 3008', tag: 'SUV', price: '$45.200.000' },
                    { name: 'Peugeot 408', tag: '0 KM', price: '$52.800.000' },
                  ].map(card => (
                    <div key={card.name} className="flex-1 min-w-0 overflow-hidden border"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.07)' }}>
                      <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#D4A847' }} />
                      </div>
                      <div className="p-1.5">
                        <p className="text-[7px] font-black text-white leading-none">{card.name}</p>
                        <p className="text-[6px] font-black uppercase tracking-wider mt-0.5" style={{ color: '#D4A847' }}>{card.tag}</p>
                        <p className="text-[7px] font-bold text-white mt-1">{card.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile mockup — overlapping corner */}
          <div className="absolute -bottom-5 -right-3 md:-right-8 z-10 hidden sm:block w-16 md:w-24 rounded-2xl overflow-hidden border shadow-2xl"
            style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#07070e' }}>
            {/* Notch */}
            <div className="h-3 flex items-center justify-center" style={{ backgroundColor: '#040408' }}>
              <div className="w-8 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="relative" style={{ aspectRatio: '9/18' }}>
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=70"
                alt="Mobile preview" fill
                className="object-cover"
                style={{ opacity: 0.35 }}
              />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, rgba(3,3,8,0.85), rgba(3,3,8,0.4) 40%, rgba(3,3,8,0.92))' }} />
              <div className="absolute inset-0 flex flex-col justify-center items-center gap-1">
                <div className="w-6 h-px" style={{ backgroundColor: '#D4A847' }} />
                <p className="text-white font-black uppercase text-[6px] tracking-wider">PEUGEOT</p>
              </div>
              <div className="absolute bottom-2 left-0 right-0 flex flex-col gap-1 px-1.5">
                {['208', '3008', '408'].map(m => (
                  <div key={m} className="h-3 rounded-sm flex items-center px-1 gap-1"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#D4A847' }} />
                    <span className="text-[5px] text-white/60 font-bold">Peugeot {m}</span>
                  </div>
                ))}
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

      {/* ══ PORTFOLIO ════════════════════════════════════════════════════════ */}
      <section id="proyectos" className="py-28 px-6 overflow-hidden">
        <div className="mx-auto max-w-6xl">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#06b6d4' }}>
              Portfolio
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              Proyectos reales, resultados reales.
            </h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Cada web es única, construida para el rubro y la marca de cada cliente.
              Hacé click en cualquier proyecto para verlo en vivo.
            </p>
          </div>

          {/* Featured — Peugeot */}
          <a href="https://peugeot.vendly-mod.space" target="_blank" rel="noopener noreferrer"
            className="group block relative rounded-2xl overflow-hidden border mb-4 hover:scale-[1.005] transition-transform cursor-pointer"
            style={{ borderColor: 'rgba(212,168,71,0.25)' }}>
            <div className="relative overflow-hidden" style={{ aspectRatio: '21/9' }}>
              <Image
                src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80"
                alt="Peugeot" fill
                className="object-cover object-center brightness-50 group-hover:brightness-65 transition-all group-hover:scale-105 duration-700"
              />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(5,5,8,0.4) 60%, rgba(5,5,8,0.97) 100%)' }} />
              <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: '#D4A847' }} />
              <div className="absolute top-5 left-5 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(212,168,71,0.2)', color: '#D4A847', border: '1px solid rgba(212,168,71,0.4)' }}>
                  Automotriz · Concesionaria
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)' }}>
                  Proyecto real
                </span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
              <h3 className="text-3xl font-black mb-2">Peugeot</h3>
              <p className="text-sm mb-5 max-w-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Concesionaria oficial. Hero fullscreen oscuro, catálogo de vehículos con ficha técnica, filtros por condición y CTA directo a WhatsApp. Sin carrito — todo va a consulta directa.
              </p>
              <span className="inline-flex items-center gap-2 text-sm font-bold group-hover:gap-4 transition-all"
                style={{ color: '#D4A847' }}>
                Ver en vivo →
              </span>
            </div>
          </a>

          {/* Grid — 9 proyectos */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              {
                name: 'El Rincón del Libro',
                tag: 'Librería',
                color: '#B5632A',
                img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=75',
                objPos: 'object-center',
                demo: 'el-rincon-del-libro.vendly-mod.space',
                desc: 'Diseño editorial crema y ámbar. Filtros por género, carrito y checkout completo.',
              },
              {
                name: 'Moda Space',
                tag: 'Moda editorial',
                color: '#b48ecf',
                img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=75',
                objPos: 'object-top',
                demo: 'moda-space.vendly-mod.space',
                desc: 'Boutique premium. Hero editorial con modelo, colección lookbook y carrito deslizable.',
              },
              {
                name: 'Modo',
                tag: 'Indumentaria',
                color: '#E63329',
                img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=75',
                objPos: 'object-top',
                demo: 'pagina-prueba.vendly-mod.space',
                desc: 'Paleta crema y rojo fuego. Hero fullscreen, carrusel de colección y editorial split.',
              },
              {
                name: 'Adidas',
                tag: 'Deportivo',
                color: '#FF3A20',
                img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=75',
                objPos: 'object-center',
                demo: 'adidas.vendly-mod.space',
                desc: 'Blanco total, tipografía de impacto, acento rojo. Marquee animado y sección editorial.',
              },
              {
                name: 'Sinergia',
                tag: 'Gym · Athletic',
                color: '#22c55e',
                img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=75',
                objPos: 'object-center',
                demo: 'sinergia.vendly-mod.space',
                desc: 'Gimnasio premium. Dark mode con verde eléctrico, clases, membresías y equipo.',
              },
              {
                name: 'Mosto',
                tag: 'Restaurante',
                color: '#f97316',
                img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75',
                objPos: 'object-center',
                demo: 'mosto.vendly-mod.space',
                desc: 'Menú digital categorizado. Hero con platos, secciones por rubro y pedido por WhatsApp.',
              },
              {
                name: 'Acosta Bienes Raíces',
                tag: 'Inmobiliaria',
                color: '#38bdf8',
                img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=75',
                objPos: 'object-center',
                demo: 'acosta-inmobiliaria.vendly-mod.space',
                desc: 'Propiedades en venta y alquiler. Filtros por tipo, zona y precio. Ficha con galería.',
              },
              {
                name: 'Spriovanni',
                tag: 'Indumentaria premium',
                color: '#C9A96E',
                img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=75',
                objPos: 'object-center',
                demo: 'spriovani-indumentaria.vendly-mod.space',
                desc: 'Fondo negro, acento dorado. Variantes de talle y color, carrito deslizable.',
              },
              {
                name: 'vendly-mod',
                tag: 'Ecommerce',
                color: '#6366f1',
                img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=75',
                objPos: 'object-center',
                demo: 'vendly-mod.space',
                desc: 'Tienda ecommerce completa. Búsqueda, filtros, variantes, carrito y checkout integrado.',
              },
            ] as const).map(({ name, tag, color, img, objPos, demo, desc }) => (
              <a key={name} href={`https://${demo}`} target="_blank" rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden border hover:scale-[1.02] transition-all duration-300 block cursor-pointer"
                style={{ borderColor: `${color}20` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ backgroundColor: color }} />
                <div className="relative aspect-video overflow-hidden">
                  <Image src={img} alt={name} fill
                    className={`object-cover ${objPos} brightness-60 group-hover:brightness-75 transition-all group-hover:scale-105 duration-700`}
                  />
                  <div className="absolute inset-0"
                    style={{ background: `linear-gradient(to bottom, transparent 30%, rgba(5,5,8,0.95) 100%)` }} />
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}>
                      {tag}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-base font-black mb-1">{name}</h3>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold group-hover:gap-2.5 transition-all"
                    style={{ color }}>
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
