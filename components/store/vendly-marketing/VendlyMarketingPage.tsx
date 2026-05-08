'use client'

/**
 * VENDLY — Landing page de marketing.
 *
 * Sales tool. Primer punto de contacto con el potencial cliente.
 * Filosofía: honesto > exagerado. Si decimos "8 tiendas activas", son 8.
 *
 * Para reemplazar antes de prospectear:
 *   - WHATSAPP_NUMBER: número real de contacto (hoy es placeholder)
 *   - Calendar link / form (opcional, si querés agendar demos)
 *   - Caso de Spriovani con métricas reales si las tenés
 */

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

// ─── Config ──────────────────────────────────────────────────────────────────

// TODO(juampi): reemplazar con tu WhatsApp real antes de promocionar
const WHATSAPP_NUMBER = '5491100000000'
const WA_HELLO   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero información sobre Vendly')}`
const WA_DEMO    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero ver una demo de Vendly')}`
const WA_REQUEST = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola! Quiero solicitar mi tienda')}`

// Stores que efectivamente tienen row en store_config y deberían cargar en
// *.vendly-mod.space cuando el wildcard de Vercel esté configurado.
const PORTFOLIO_HERO = {
  name: 'Spriovanni',
  tag: 'Indumentaria masculina · Premium',
  url: 'https://spriovani-indumentaria.vendly-mod.space',
  description: 'Tienda de indumentaria masculina premium con identidad propia. Hero fullbleed, catálogo con variantes de talle y color, marquee animado, editorial split y newsletter. Construida y entregada en una semana.',
  badge: 'Cliente activo',
  accent: '#C9A96E',
}

const PORTFOLIO_GRID = [
  { name: 'Peugeot',            tag: 'Concesionaria',   color: '#D4A847', img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=75', objPos: 'object-center', demo: 'peugeot.vendly-mod.space',          desc: 'Hero oscuro fullscreen, catálogo de vehículos, ficha técnica y CTA a WhatsApp. Sin carrito.' },
  { name: 'Adidas',             tag: 'Deportivo',       color: '#FF3A20', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&q=75',   objPos: 'object-center', demo: 'adidas.vendly-mod.space',            desc: 'Blanco editorial con acento rojo. Marquee animado, grid de productos, sección editorial.' },
  { name: 'El Rincón del Libro', tag: 'Librería',       color: '#B5632A', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=75', objPos: 'object-center', demo: 'el-rincon-del-libro.vendly-mod.space', desc: 'Diseño editorial crema y ámbar. Filtros por género, carrito y checkout completo.' },
  { name: 'Sinergia',           tag: 'Gym',             color: '#22c55e', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=75', objPos: 'object-center', demo: 'sinergia.vendly-mod.space',          desc: 'Dark mode con verde eléctrico. Clases, planes de membresía y team.' },
  { name: 'Mosto',              tag: 'Restaurante',     color: '#f97316', img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=75', objPos: 'object-center', demo: 'mosto.vendly-mod.space',             desc: 'Menú digital categorizado. Hero con platos, secciones por rubro, pedido por WhatsApp.' },
  { name: 'Acosta Bienes Raíces', tag: 'Inmobiliaria',  color: '#38bdf8', img: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=75', objPos: 'object-center', demo: 'acosta-inmobiliaria.vendly-mod.space', desc: 'Propiedades en venta y alquiler. Filtros por tipo, zona y precio. Galería de fotos.' },
  { name: 'Moda Space',         tag: 'Moda editorial',  color: '#b48ecf', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=75', objPos: 'object-top',    demo: 'moda-space.vendly-mod.space',        desc: 'Boutique premium. Hero editorial con modelo, lookbook de colección, carrito deslizable.' },
  { name: 'Modo',               tag: 'Indumentaria',    color: '#E63329', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=75', objPos: 'object-top',    demo: 'pagina-prueba.vendly-mod.space',     desc: 'Paleta crema y rojo fuego. Hero fullscreen, carrusel de colección, editorial split.' },
] as const

// ─── Counter animado ──────────────────────────────────────────────────────────

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1600
          const steps = 40
          const inc = target / steps
          let cur = 0
          const t = setInterval(() => {
            cur += inc
            if (cur >= target) { setCount(target); clearInterval(t) }
            else setCount(Math.floor(cur))
          }, duration / steps)
        }
      },
      { threshold: 0.5 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

// ─── SVG icons ────────────────────────────────────────────────────────────────

function IconConversation() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
}
function IconBuild() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
}
function IconLaunch() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconX() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IconShield() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function IconClock() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IconHandshake() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z"/></svg>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VendlyMarketingPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ backgroundColor: '#08080C', color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ═══════════ NAVBAR ═══════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(8,8,12,0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}>
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white font-black text-xs">V</span>
            </div>
            <span className="font-black text-lg tracking-tight">Vendly</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <a href="#proceso"   className="hover:text-white transition-colors">Cómo funciona</a>
            <a href="#proyectos" className="hover:text-white transition-colors">Proyectos</a>
            <a href="#planes"    className="hover:text-white transition-colors">Planes</a>
            <a href="#faq"       className="hover:text-white transition-colors">FAQ</a>
          </div>
          <a href={WA_DEMO} target="_blank" rel="noopener noreferrer"
            className="text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}>
            Agendar demo
          </a>
        </div>
      </nav>

      {/* ═══════════ HERO ═════════════════════════════════════════════════ */}
      <section id="top" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-20">

        {/* Background atmosphere */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-25 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 40%, transparent 70%)' }} />
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 70%)',
            }} />
        </div>

        {/* Eyebrow */}
        <div className="relative mb-7 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border"
          style={{ borderColor: 'rgba(99,102,241,0.4)', backgroundColor: 'rgba(99,102,241,0.08)', color: '#a5b4fc' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Estudio especializado en LATAM · 2026
        </div>

        {/* Headline */}
        <h1 className="relative text-center font-black leading-[0.92] tracking-[-0.03em] mb-7 max-w-5xl"
          style={{ fontSize: 'clamp(2.6rem, 8vw, 6.5rem)' }}>
          <span className="block text-white">Tu tienda online,</span>
          <span className="block"
            style={{ background: 'linear-gradient(110deg, #c7d2fe, #a78bfa 50%, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            hecha a medida.
          </span>
        </h1>

        <p className="relative text-center max-w-2xl text-base md:text-lg mb-10 leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.62)' }}>
          Diseñamos, configuramos y entregamos tu ecommerce funcionando en <strong style={{ color: 'white' }}>7 a 10 días</strong>.
          Con <strong style={{ color: 'white' }}>identidad propia</strong>, MercadoPago integrado y soporte humano.
          Vos no tocás código.
        </p>

        {/* CTAs */}
        <div className="relative flex flex-col sm:flex-row items-center gap-3 mb-16">
          <a href={WA_DEMO} target="_blank" rel="noopener noreferrer"
            className="group px-8 py-4 rounded-xl font-bold text-base transition-all hover:scale-105 inline-flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
            Agendar demo de 15 min
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
          <a href={PORTFOLIO_HERO.url} target="_blank" rel="noopener noreferrer"
            className="px-6 py-4 rounded-xl font-medium text-base border transition-all hover:bg-white/5 inline-flex items-center gap-2"
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.85)' }}>
            <span>Ver tienda real</span>
            <span style={{ color: PORTFOLIO_HERO.accent }}>↗</span>
          </a>
        </div>

        {/* Hero card — caso real Spriovanni */}
        <div className="relative w-full max-w-5xl mx-auto">
          <div className="absolute -inset-4 rounded-3xl blur-3xl opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, #8b5cf6 40%, transparent 70%)' }} />

          <a href={PORTFOLIO_HERO.url} target="_blank" rel="noopener noreferrer"
            className="relative block rounded-2xl overflow-hidden border shadow-2xl group cursor-pointer"
            style={{ borderColor: 'rgba(255,255,255,0.08)', backgroundColor: '#07070e' }}>

            {/* Browser chrome */}
            <div className="flex items-center gap-3 px-4 h-10 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: '#040408' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#febc2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#28c840' }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 h-6 px-3 rounded-md text-[10px] w-72 max-w-[60%]"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)' }}>
                  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                  spriovani-indumentaria.vendly-mod.space
                </div>
              </div>
              <span className="text-[10px] hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#86efac', border: '1px solid rgba(34,197,94,0.25)' }}>
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            {/* Preview */}
            <div className="relative" style={{ aspectRatio: '16/10' }}>
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80"
                alt="Spriovanni preview" fill priority
                className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                style={{ opacity: 0.5 }}
              />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(115deg, rgba(8,8,12,0.95) 0%, rgba(8,8,12,0.55) 50%, rgba(8,8,12,0.15) 100%)' }} />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(8,8,12,0.95) 0%, transparent 50%)' }} />

              {/* Spriovanni faux UI on top */}
              <div className="absolute inset-0 flex flex-col justify-end px-8 md:px-16 pb-12">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px w-10" style={{ backgroundColor: PORTFOLIO_HERO.accent }} />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]"
                    style={{ color: PORTFOLIO_HERO.accent }}>
                    Indumentaria masculina
                  </span>
                </div>
                <h2 className="font-black uppercase text-white leading-[0.86] mb-6"
                  style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', letterSpacing: '-0.04em' }}>
                  ESTILO.<br/>ACTITUD.
                </h2>
                <div className="inline-flex items-center gap-2 self-start px-5 py-2.5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] rounded"
                  style={{ backgroundColor: 'white', color: '#0A0A0A' }}>
                  Ver colección →
                </div>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: 'rgba(8,8,12,0.7)' }}>
                <span className="px-6 py-3 rounded-full font-bold text-sm border"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
                  Visitar tienda en vivo →
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* ═══════════ TRUST LINE ═══════════════════════════════════════════ */}
      <section className="py-12 border-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] mb-8"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            Tiendas activas funcionando hoy
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-8 items-center justify-items-center">
            {['Spriovanni', 'Peugeot', 'Adidas', 'Mosto', 'Sinergia', 'El Rincón', 'Acosta', 'Modo', 'Moda Space', 'vendly-mod'].map(name => (
              <span key={name} className="text-sm font-black tracking-tight"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NÚMEROS ══════════════════════════════════════════════ */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 10, suffix: '',     label: 'Tiendas activas' },
            { value: 8,  suffix: '',     label: 'Verticales soportados' },
            { value: 7,  suffix: ' días', label: 'Entrega promedio' },
            { value: 100, suffix: '%',   label: 'Llave en mano' },
          ].map(({ value, suffix, label }) => (
            <div key={label}>
              <div className="text-4xl md:text-5xl font-black mb-2 tracking-tight"
                style={{ background: 'linear-gradient(135deg, #c7d2fe, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                <AnimatedCounter target={value} suffix={suffix} />
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CÓMO FUNCIONA ═══════════════════════════════════════ */}
      <section id="proceso" className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>Sin vueltas</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]">Así trabajamos</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                Icon: IconConversation,
                title: 'Discovery call de 30 min',
                desc: 'Nos contás qué vendés, cómo te imaginás la tienda y qué referencias te gustan. De ahí sale una propuesta concreta con plazo y precio.',
                color: '#6366f1',
              },
              {
                step: '02',
                Icon: IconBuild,
                title: 'Diseño y desarrollo',
                desc: 'Te entregamos un diseño exclusivo, cargamos tu catálogo, conectamos MercadoPago y dominio propio. En 7-10 días corridos.',
                color: '#8b5cf6',
              },
              {
                step: '03',
                Icon: IconLaunch,
                title: 'Live + soporte continuo',
                desc: 'Lanzamos. Te enseñamos a usar el panel en una sesión de 30 min. Después, soporte humano todos los meses para cambios y mejoras.',
                color: '#06b6d4',
              },
            ].map(({ step, Icon, title, desc, color }) => (
              <div key={step}
                className="relative p-8 rounded-2xl border group hover:border-white/20 transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${color}30, transparent 60%)` }} />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, color }}>
                      <Icon />
                    </div>
                    <span className="text-xs font-black tracking-widest" style={{ color }}>PASO {step}</span>
                  </div>
                  <h3 className="text-xl font-black mb-3 tracking-tight">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CASO: SPRIOVANNI ═════════════════════════════════════ */}
      <section className="py-24 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: PORTFOLIO_HERO.accent }}>
              Caso de cliente
            </p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]">Spriovanni Indumentaria</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <a href={PORTFOLIO_HERO.url} target="_blank" rel="noopener noreferrer"
              className="block relative rounded-2xl overflow-hidden border group cursor-pointer"
              style={{ borderColor: `${PORTFOLIO_HERO.accent}30` }}>
              <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ backgroundColor: PORTFOLIO_HERO.accent }} />
              <div className="relative" style={{ aspectRatio: '4/3' }}>
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
                  alt="Spriovanni" fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(8,8,12,0.85) 0%, rgba(8,8,12,0.2) 50%, transparent 100%)' }} />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1"
                      style={{ color: PORTFOLIO_HERO.accent }}>{PORTFOLIO_HERO.tag}</p>
                    <p className="text-xl font-black text-white">{PORTFOLIO_HERO.name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#86efac', borderColor: 'rgba(34,197,94,0.25)' }}>
                    Live
                  </span>
                </div>
              </div>
            </a>
            <div>
              <p className="text-base leading-relaxed mb-7" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {PORTFOLIO_HERO.description}
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Diseño exclusivo: hero fullscreen, marquee animado, editorial split',
                  'Catálogo cargado con variantes de talle y color',
                  'MercadoPago integrado con cobranza directa al cliente',
                  'Newsletter + WhatsApp para retención',
                  'Entrega: 7 días desde la primera reunión',
                ].map(b => (
                  <div key={b} className="flex items-start gap-3">
                    <span className="mt-1 shrink-0" style={{ color: PORTFOLIO_HERO.accent }}><IconCheck /></span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{b}</span>
                  </div>
                ))}
              </div>
              <a href={PORTFOLIO_HERO.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-bold transition-all hover:scale-105 border"
                style={{ borderColor: `${PORTFOLIO_HERO.accent}50`, color: PORTFOLIO_HERO.accent }}>
                Visitar la tienda →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PORTFOLIO ════════════════════════════════════════════ */}
      <section id="proyectos" className="py-28 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#06b6d4' }}>Más proyectos</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-4">8 verticales, 1 plataforma</h2>
            <p className="max-w-xl mx-auto text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Cada tienda con su identidad. Click en cualquiera para verla en vivo.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PORTFOLIO_GRID.map(({ name, tag, color, img, objPos, demo, desc }) => (
              <a key={name} href={`https://${demo}`} target="_blank" rel="noopener noreferrer"
                className="group relative rounded-xl overflow-hidden border transition-all duration-300 block cursor-pointer hover:scale-[1.02]"
                style={{ borderColor: `${color}25` }}>
                <div className="absolute top-0 left-0 right-0 h-0.5 z-10" style={{ backgroundColor: color }} />
                <div className="relative aspect-video overflow-hidden">
                  <Image src={img} alt={name} fill
                    className={`object-cover ${objPos} transition-all group-hover:scale-105 duration-700`}
                    style={{ filter: 'brightness(0.55)' }} />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(8,8,12,0.95) 100%)' }} />
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
                      style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}>
                      {tag}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-base font-black mb-1.5 tracking-tight">{name}</h3>
                  <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>
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

      {/* ═══════════ FEATURES (BENEFICIOS) ════════════════════════════════ */}
      <section className="py-28 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>Todo incluido</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]">No te falta nada para vender</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Diseño exclusivo, no plantilla', desc: 'Tu tienda no se parece a otras. Construimos identidad propia: colores, tipografías y layout pensados para tu marca.' },
              { title: 'Cobranza directa con MercadoPago', desc: 'Tarjeta, cuotas y transferencia desde el día uno. La plata va a TU cuenta, Vendly nunca toca tu dinero.' },
              { title: 'Mobile-first, sin compromiso', desc: 'El 70% de tus visitas vienen del celular. Tu tienda se ve impecable en cualquier pantalla.' },
              { title: 'Catálogo cargado por nosotros', desc: 'Mandanos las fotos y los datos. Nosotros cargamos productos, variantes, descripciones y precios. Vos arrancás vendiendo.' },
              { title: 'Carritos abandonados que recuperan', desc: 'El sistema detecta clientes que dejaron compras a mitad y manda recordatorios automáticos. Recuperás 10-15% de las ventas perdidas.' },
              { title: 'WhatsApp como canal de venta', desc: 'Botón flotante que abre directo con tu número. Templates de venta y recovery para automatizar la consulta.' },
              { title: 'Panel de admin pensado para humanos', desc: 'Gestionás pedidos, stock y promociones desde un panel hecho para que lo uses vos, no un dev.' },
              { title: 'IA para contenido y diseño', desc: 'Generá descripciones de productos y ajustes de diseño con un click. Te ahorra horas de copy y escritura.' },
              { title: 'Soporte humano todos los meses', desc: 'No te dejamos solo después del lanzamiento. Cambios, ajustes y mejoras siempre disponibles.' },
            ].map(({ title, desc }) => (
              <div key={title}
                className="p-6 rounded-xl border hover:border-indigo-400/30 transition-all group"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="mb-3" style={{ color: '#a5b4fc' }}><IconCheck /></div>
                <h3 className="font-bold mb-2 text-sm tracking-tight">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PARA QUIÉN ES / NO ES ════════════════════════════════ */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>Honestidad arriba de la mesa</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em]">¿Vendly es para vos?</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {/* Sí */}
            <div className="p-8 rounded-2xl border"
              style={{ backgroundColor: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.2)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <IconCheck />
                </div>
                <h3 className="text-xl font-black tracking-tight">Sí, claramente</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Tenés una marca con identidad (no estás en idea-stage)',
                  'Vendés producto físico: indumentaria, deco, cosmética, gym, food premium',
                  'Catálogo de 10 a 500 productos',
                  'Querés delegar lo técnico, no aprenderlo',
                  'Valorás hecho a medida sobre "tipo Wix"',
                  'Pensás quedarte 6+ meses con tu proveedor',
                ].map(t => (
                  <li key={t} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.78)' }}>
                    <span className="mt-1 shrink-0" style={{ color: '#22c55e' }}><IconCheck /></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* No */}
            <div className="p-8 rounded-2xl border"
              style={{ backgroundColor: 'rgba(239,68,68,0.03)', borderColor: 'rgba(239,68,68,0.18)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171' }}>
                  <IconX />
                </div>
                <h3 className="text-xl font-black tracking-tight">Probablemente no</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Buscás "lo más barato posible" — no somos eso',
                  'Necesitás funcionalidad de marketplace multi-vendor',
                  'Vendés productos regulados (farmacia, alcohol, salud)',
                  'Catálogo enorme >2.000 SKUs con stock multi-depósito',
                  'Tenés equipo IT propio que va a pedir customizaciones constantes',
                  'Querés pagar con equity o cambiar a equity tu deuda',
                ].map(t => (
                  <li key={t} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    <span className="mt-1 shrink-0" style={{ color: '#f87171' }}><IconX /></span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ══════════════════════════════════════════════ */}
      <section id="planes" className="py-28 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>Precios claros</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] mb-4">Planes que crecen con tu marca</h2>
            <p className="max-w-md mx-auto text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Setup único + suscripción mensual. Sin permanencia. Cancelás cuando quieras.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {[
              {
                name: 'Esencial',
                tagline: 'Para marcas que arrancan online',
                price: '$590',
                priceUnit: '/ mes',
                setupFee: 'Setup único $890',
                highlight: false,
                features: [
                  'Diseño exclusivo (1 ronda de revisiones)',
                  'Hasta 30 productos cargados',
                  'Dominio propio configurado',
                  'MercadoPago integrado',
                  'WhatsApp y email de pedidos',
                  'Mobile-first responsive',
                  'Soporte por email — 48h SLA',
                ],
                cta: 'Empezar con Esencial',
                ctaStyle: { border: '1px solid rgba(255,255,255,0.2)', color: 'white', backgroundColor: 'rgba(255,255,255,0.04)' },
              },
              {
                name: 'Pro',
                tagline: 'Para marcas que quieren escalar',
                price: '$1.290',
                priceUnit: '/ mes',
                setupFee: 'Setup único $1.990',
                highlight: true,
                features: [
                  'Todo lo del plan Esencial',
                  'Catálogo ilimitado',
                  'Carritos abandonados automáticos',
                  'Newsletter + drip campaigns',
                  'IA para contenido y diseño',
                  'Panel de métricas y reportes',
                  'Editor visual de tu home (drag & drop)',
                  'Soporte prioritario WhatsApp — 12h SLA',
                ],
                cta: 'Empezar con Pro',
                ctaStyle: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' },
              },
              {
                name: 'Custom',
                tagline: 'Para proyectos con necesidades específicas',
                price: 'Desde $2.500',
                priceUnit: '/ mes',
                setupFee: 'Setup a cotizar',
                highlight: false,
                features: [
                  'Todo lo del plan Pro',
                  'Diseño 100% personalizado',
                  'Integraciones a medida (CRM, ERP, etc.)',
                  'Múltiples páginas o secciones especiales',
                  'Equipo dedicado',
                  'Soporte 24/7 con SLA contractual',
                ],
                cta: 'Hablemos',
                ctaStyle: { border: '1px solid rgba(255,255,255,0.2)', color: 'white', backgroundColor: 'rgba(255,255,255,0.04)' },
              },
            ].map(({ name, tagline, price, priceUnit, setupFee, highlight, features, cta, ctaStyle }) => (
              <div key={name}
                className="relative p-7 rounded-2xl border flex flex-col"
                style={{
                  backgroundColor: highlight ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                  borderColor: highlight ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)',
                  boxShadow: highlight ? '0 0 60px rgba(99,102,241,0.15)' : 'none',
                }}>
                {highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Más elegido
                  </div>
                )}
                <div className="mb-5">
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{name}</p>
                  <p className="text-sm leading-snug" style={{ color: 'rgba(255,255,255,0.65)' }}>{tagline}</p>
                </div>
                <div className="mb-5 pb-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black tracking-tight">{price}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{priceUnit}</span>
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{setupFee}</p>
                </div>
                <ul className="flex-1 space-y-2.5 mb-7">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: 'rgba(255,255,255,0.78)' }}>
                      <span className="mt-0.5 shrink-0" style={{ color: highlight ? '#a5b4fc' : '#22c55e' }}><IconCheck /></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a href={WA_REQUEST} target="_blank" rel="noopener noreferrer"
                  className="block text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
                  style={ctaStyle}>
                  {cta}
                </a>
              </div>
            ))}
          </div>
          <p className="mt-10 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Precios en USD. Cobramos en USD o pesos al equivalente del día. Pagos por Stripe o MercadoPago.
          </p>
        </div>
      </section>

      {/* ═══════════ GARANTÍAS ════════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#22c55e' }}>El riesgo lo corremos nosotros</p>
            <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em]">Garantías que respaldan tu decisión</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                Icon: IconClock,
                title: '7 días o devolvemos el setup',
                desc: 'Si no entregamos tu tienda funcionando en 10 días hábiles desde la primera reunión, te devolvemos el setup completo. Sin discusión.',
              },
              {
                Icon: IconShield,
                title: 'Tus datos son tuyos',
                desc: 'Si en algún momento te querés ir, exportás tu catálogo, clientes y pedidos en CSV. Sin lock-in. Sin penalidad.',
              },
              {
                Icon: IconHandshake,
                title: 'Sin permanencia',
                desc: 'Cancelás con 30 días de aviso. Tu tienda sigue activa hasta el final del mes pago. Justo y simple.',
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title}
                className="p-7 rounded-2xl border"
                style={{ backgroundColor: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.2)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                  <Icon />
                </div>
                <h3 className="font-black mb-2 text-base tracking-tight">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ══════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 px-6" style={{ backgroundColor: 'rgba(255,255,255,0.015)' }}>
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#a78bfa' }}>Las dudas más comunes</p>
            <h2 className="text-4xl font-black tracking-[-0.03em]">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-2">
            {[
              { q: '¿En cuántos días entregan la tienda?',
                a: 'Entre 7 y 10 días hábiles desde la primera reunión, asumiendo que recibimos las fotos y datos a tiempo. Si necesitamos esperar contenido tuyo, el reloj pausa.' },
              { q: '¿Qué necesito de mi parte para arrancar?',
                a: 'Logo (o lo diseñamos), fotos de productos, una lista con nombre/precio/descripción de tu catálogo, y datos de tu cuenta MercadoPago. Tampoco hay que tener todo perfecto desde el principio — vamos completando juntos.' },
              { q: '¿La web es mía o de Vendly?',
                a: 'Es 100% tuya. Vos sos dueño del dominio, del contenido, del catálogo, de los clientes. Vendly es invisible — tus clientes ven tu marca, no la nuestra.' },
              { q: '¿Qué pasa si Vendly cierra mañana?',
                a: 'Pregunta válida. Tu tienda está construida con tecnología estándar (Next.js + Supabase + Vercel). Si algún día desaparecemos, te entregamos el código fuente y la documentación para que la migres a otro proveedor en pocas horas.' },
              { q: '¿Cómo funciona el cobro de mis clientes?',
                a: 'A través de MercadoPago directo a tu cuenta. Vendly NO toca tu plata. Vos cobrás como si fuera tu cuenta personal de MP — porque es tu cuenta personal de MP.' },
              { q: '¿Puedo pedir cambios después del lanzamiento?',
                a: 'Sí, todos los planes incluyen soporte para cambios mensuales. En Esencial son 2 horas/mes, en Pro son 5 horas/mes, en Custom es ilimitado. Pasados esos límites cobramos un fee por hora extra.' },
              { q: '¿Qué pasa si necesito una funcionalidad que no tienen?',
                a: 'En el plan Custom desarrollamos integraciones a medida. En Esencial y Pro, tenemos un roadmap público y vamos agregando features con el tiempo. Si lo que pedís le sirve a más clientes, suele entrar al roadmap.' },
              { q: '¿Aceptan clientes fuera de Argentina?',
                a: 'Sí. Trabajamos con LATAM (México, Colombia, Chile, Uruguay) y también con Europa/EEUU. El producto soporta multi-currency y multi-locale. Los pagos los podemos hacer por USD via Stripe.' },
            ].map(({ q, a }, i) => (
              <div key={i}
                className="rounded-xl border overflow-hidden transition-colors"
                style={{ borderColor: faqOpen === i ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)', backgroundColor: faqOpen === i ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/5">
                  <span className="font-semibold text-sm pr-4">{q}</span>
                  <span className="text-lg transition-transform duration-200 flex-shrink-0"
                    style={{ transform: faqOpen === i ? 'rotate(45deg)' : 'none', color: 'rgba(255,255,255,0.4)' }}>
                    +
                  </span>
                </button>
                {faqOpen === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366f1, #8b5cf6, transparent)' }} />
        </div>
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-5" style={{ color: '#a5b4fc' }}>
            Listo para empezar
          </p>
          <h2 className="text-5xl md:text-6xl font-black tracking-[-0.03em] mb-6 leading-[0.95]">
            Tu tienda activa<br />
            <span style={{ background: 'linear-gradient(110deg, #c7d2fe, #a78bfa 50%, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              en 10 días o menos.
            </span>
          </h2>
          <p className="text-base md:text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Agendá una demo de 15 minutos. Te mostramos cómo trabaja el sistema y armamos<br className="hidden md:block" />
            una propuesta concreta para tu marca.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={WA_DEMO} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-10 py-5 rounded-xl font-black text-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 60px rgba(99,102,241,0.5)' }}>
              Agendar demo de 15 min →
            </a>
            <a href={PORTFOLIO_HERO.url} target="_blank" rel="noopener noreferrer"
              className="px-6 py-5 rounded-xl font-medium text-sm border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
              o vé una tienda real ↗
            </a>
          </div>
          <p className="mt-6 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Respondemos en menos de 24 horas. WhatsApp, email o llamada — vos elegís.
          </p>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════════════════════════════════════════ */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <span className="text-white font-black text-xs">V</span>
                </div>
                <span className="font-black text-lg">Vendly</span>
              </div>
              <p className="text-sm max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Estudio especializado en ecommerce premium para LATAM. Diseñamos, configuramos y entregamos tu tienda funcionando en una semana.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Producto</p>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <li><a href="#proceso" className="hover:text-white transition-colors">Cómo funciona</a></li>
                <li><a href="#proyectos" className="hover:text-white transition-colors">Proyectos</a></li>
                <li><a href="#planes" className="hover:text-white transition-colors">Planes</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Contacto</p>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <li>
                  <a href={WA_HELLO} target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-2">
                    WhatsApp
                  </a>
                </li>
                <li><a href="/terminos" className="hover:text-white transition-colors">Términos</a></li>
                <li><a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              © {new Date().getFullYear()} Vendly. Buenos Aires, Argentina.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Construido con Next.js · Supabase · MercadoPago
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
