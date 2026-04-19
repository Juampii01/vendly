'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import type {
  LandingSection, SectionType,
  HeroContent, AboutContent, ServicesContent,
  TestimonialsContent, FaqContent, ContactContent,
} from '@/types'

interface Props {
  initialSections: LandingSection[]
  siteType: string
  storeUrl: string
}

const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero',
  about: 'Sobre nosotros',
  services: 'Servicios',
  testimonials: 'Testimonios',
  pricing: 'Precios',
  gallery: 'Galería',
  faq: 'Preguntas frecuentes',
  contact: 'Contacto',
}

const SECTION_ICONS: Record<SectionType, string> = {
  hero: '🖼', about: '📖', services: '⚡', testimonials: '💬',
  pricing: '💰', gallery: '🖼️', faq: '❓', contact: '📞',
}

// ─── Input primitives ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, multiline = false, placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; placeholder?: string
}) {
  const cls = "w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600 resize-none"
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

// ─── Section content editors ──────────────────────────────────────────────────

function HeroEditor({ content, onChange }: { content: HeroContent; onChange: (c: HeroContent) => void }) {
  const s = (k: keyof HeroContent) => (v: string) => onChange({ ...content, [k]: v })
  return (
    <div className="space-y-3">
      <Field label="Título principal" value={content.title} onChange={s('title')} />
      <Field label="Subtítulo / etiqueta" value={content.subtitle} onChange={s('subtitle')} placeholder="Una línea descriptiva" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Texto del botón" value={content.cta_label} onChange={s('cta_label')} />
        <Field label="Link del botón" value={content.cta_url} onChange={s('cta_url')} placeholder="#contact" />
      </div>
      <Field label="URL imagen de fondo" value={content.image_url} onChange={s('image_url')} placeholder="https://..." />
    </div>
  )
}

function AboutEditor({ content, onChange }: { content: AboutContent; onChange: (c: AboutContent) => void }) {
  const s = (k: keyof AboutContent) => (v: string) => onChange({ ...content, [k]: v })
  return (
    <div className="space-y-3">
      <Field label="Etiqueta" value={content.label} onChange={s('label')} placeholder="Sobre nosotros" />
      <Field label="Título" value={content.title} onChange={s('title')} />
      <Field label="Descripción" value={content.body} onChange={s('body')} multiline />
      <Field label="URL imagen" value={content.image_url} onChange={s('image_url')} placeholder="https://..." />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Texto botón" value={content.cta_label} onChange={s('cta_label')} />
        <Field label="Link botón" value={content.cta_url} onChange={s('cta_url')} placeholder="#contact" />
      </div>
    </div>
  )
}

function ServicesEditor({ content, onChange }: { content: ServicesContent; onChange: (c: ServicesContent) => void }) {
  function updateItem(i: number, k: string, v: string) {
    onChange({ ...content, items: content.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) })
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Título sección" value={content.title} onChange={v => onChange({ ...content, title: v })} />
        <Field label="Subtítulo" value={content.subtitle} onChange={v => onChange({ ...content, subtitle: v })} />
      </div>
      <div className="space-y-2">
        {content.items.map((item, i) => (
          <div key={i} className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Ítem {i + 1}</span>
              <button onClick={() => onChange({ ...content, items: content.items.filter((_, idx) => idx !== i) })}
                className="text-[10px] text-red-400/60 hover:text-red-400">Eliminar</button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Field label="Emoji" value={item.icon} onChange={v => updateItem(i, 'icon', v)} placeholder="⚡" />
              <div className="col-span-3"><Field label="Título" value={item.title} onChange={v => updateItem(i, 'title', v)} /></div>
            </div>
            <Field label="Descripción" value={item.description} onChange={v => updateItem(i, 'description', v)} multiline />
          </div>
        ))}
        <button onClick={() => onChange({ ...content, items: [...content.items, { icon: '✨', title: 'Nuevo servicio', description: '' }] })}
          className="w-full rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs py-2 hover:border-slate-500 hover:text-slate-400 transition-colors">
          + Agregar servicio
        </button>
      </div>
    </div>
  )
}

function TestimonialsEditor({ content, onChange }: { content: TestimonialsContent; onChange: (c: TestimonialsContent) => void }) {
  function updateItem(i: number, k: string, v: string) {
    onChange({ ...content, items: content.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) })
  }
  return (
    <div className="space-y-3">
      <Field label="Título sección" value={content.title} onChange={v => onChange({ ...content, title: v })} />
      <div className="space-y-2">
        {content.items.map((item, i) => (
          <div key={i} className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Testimonio {i + 1}</span>
              <button onClick={() => onChange({ ...content, items: content.items.filter((_, idx) => idx !== i) })}
                className="text-[10px] text-red-400/60 hover:text-red-400">Eliminar</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Nombre" value={item.name} onChange={v => updateItem(i, 'name', v)} />
              <Field label="Rol" value={item.role} onChange={v => updateItem(i, 'role', v)} />
            </div>
            <Field label="Texto" value={item.text} onChange={v => updateItem(i, 'text', v)} multiline />
          </div>
        ))}
        <button onClick={() => onChange({ ...content, items: [...content.items, { name: 'Nombre', role: 'Cliente', text: '' }] })}
          className="w-full rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs py-2 hover:border-slate-500 hover:text-slate-400 transition-colors">
          + Agregar testimonio
        </button>
      </div>
    </div>
  )
}

function FaqEditor({ content, onChange }: { content: FaqContent; onChange: (c: FaqContent) => void }) {
  function updateItem(i: number, k: string, v: string) {
    onChange({ ...content, items: content.items.map((item, idx) => idx === i ? { ...item, [k]: v } : item) })
  }
  return (
    <div className="space-y-3">
      <Field label="Título sección" value={content.title} onChange={v => onChange({ ...content, title: v })} />
      <div className="space-y-2">
        {content.items.map((item, i) => (
          <div key={i} className="rounded-xl bg-slate-800/60 border border-slate-700/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Pregunta {i + 1}</span>
              <button onClick={() => onChange({ ...content, items: content.items.filter((_, idx) => idx !== i) })}
                className="text-[10px] text-red-400/60 hover:text-red-400">Eliminar</button>
            </div>
            <Field label="Pregunta" value={item.question} onChange={v => updateItem(i, 'question', v)} />
            <Field label="Respuesta" value={item.answer} onChange={v => updateItem(i, 'answer', v)} multiline />
          </div>
        ))}
        <button onClick={() => onChange({ ...content, items: [...content.items, { question: '', answer: '' }] })}
          className="w-full rounded-lg border border-dashed border-slate-700 text-slate-500 text-xs py-2 hover:border-slate-500 hover:text-slate-400 transition-colors">
          + Agregar pregunta
        </button>
      </div>
    </div>
  )
}

function ContactEditor() {
  return (
    <p className="text-xs text-slate-500 leading-relaxed">
      WhatsApp, email e Instagram se toman de la configuración general del panel.
    </p>
  )
}

function SectionEditor({ section, onChange }: { section: LandingSection; onChange: (s: LandingSection) => void }) {
  const update = (content: LandingSection['content']) => onChange({ ...section, content })
  switch (section.type) {
    case 'hero':         return <HeroEditor content={section.content as HeroContent} onChange={update} />
    case 'about':        return <AboutEditor content={section.content as AboutContent} onChange={update} />
    case 'services':     return <ServicesEditor content={section.content as ServicesContent} onChange={update} />
    case 'testimonials': return <TestimonialsEditor content={section.content as TestimonialsContent} onChange={update} />
    case 'faq':          return <FaqEditor content={section.content as FaqContent} onChange={update} />
    case 'contact':      return <ContactEditor />
    default:             return <p className="text-xs text-slate-500">Próximamente.</p>
  }
}

// ─── Save status indicator ────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <span className={`text-xs font-medium transition-all ${
      status === 'saving' ? 'text-slate-400' :
      status === 'saved'  ? 'text-green-400' :
                            'text-red-400'
    }`}>
      {status === 'saving' ? '↑ Guardando...' : status === 'saved' ? '✓ Guardado' : '✗ Error'}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingEditor({ initialSections, siteType, storeUrl }: Props) {
  const [sections, setSections] = useState(initialSections)
  const [currentSiteType, setCurrentSiteType] = useState(siteType)
  const [expanded, setExpanded] = useState<string | null>('hero')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [iframeKey, setIframeKey] = useState(0)
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLanding = currentSiteType === 'landing'

  // ── Debounced auto-save ───────────────────────────────────────────────────
  const scheduleSave = useCallback((newSections: LandingSection[], newSiteType: string) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/landing', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sections: newSections, site_type: newSiteType }),
        })
        if (!res.ok) throw new Error()
        setSaveStatus('saved')
        setIframeKey(k => k + 1)
        setTimeout(() => setSaveStatus('idle'), 2500)
      } catch {
        setSaveStatus('error')
      }
    }, 900)
  }, [])

  function updateSections(newSections: LandingSection[]) {
    setSections(newSections)
    scheduleSave(newSections, currentSiteType)
  }

  function changeSiteType(type: string) {
    setCurrentSiteType(type)
    scheduleSave(sections, type)
  }

  function toggleActive(id: string) {
    updateSections(sections.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  function updateSection(updated: LandingSection) {
    updateSections(sections.map(s => s.id === updated.id ? updated : s))
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 -m-0 overflow-hidden">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-slate-500 hover:text-white text-sm transition-colors">
            ← Admin
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-300 font-medium">Editor de página</span>
        </div>
        <div className="flex items-center gap-4">
          <SaveIndicator status={saveStatus} />
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-white transition-colors">
            Ver sitio ↗
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel: editor ─────────────────────────────────────────── */}
        <div className="w-[340px] shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 overflow-y-auto">

          {/* Site type selector */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Tipo de sitio</p>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { value: 'ecommerce', label: 'Tienda', icon: '🛍️' },
                { value: 'landing',   label: 'Landing', icon: '🚀' },
                { value: 'portfolio', label: 'Portfolio', icon: '🎨', soon: true },
                { value: 'restaurant',label: 'Restaurante', icon: '🍽️', soon: true },
              ].map(opt => (
                <button key={opt.value}
                  onClick={() => !opt.soon && changeSiteType(opt.value)}
                  disabled={!!opt.soon}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                    currentSiteType === opt.value
                      ? 'bg-white text-slate-900 border-white'
                      : 'text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}>
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                  {opt.soon && <span className="ml-auto text-[8px] text-slate-600">SOON</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          {isLanding ? (
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest px-1 mb-2">Secciones</p>
              {sections.map(section => (
                <div key={section.id}
                  className={`rounded-xl border overflow-hidden ${section.active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>

                  {/* Section header */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="text-base">{SECTION_ICONS[section.type]}</span>
                    <button onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                      className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {SECTION_LABELS[section.type]}
                      </p>
                    </button>

                    {/* Toggle */}
                    <button onClick={() => toggleActive(section.id)}
                      className={`relative h-4 w-7 rounded-full transition-colors shrink-0 ${section.active ? 'bg-white' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-slate-900 transition-transform ${section.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>

                    {/* Expand */}
                    <button onClick={() => setExpanded(expanded === section.id ? null : section.id)}
                      className="text-slate-600 text-[10px] shrink-0">
                      {expanded === section.id ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* Section content editor */}
                  {expanded === section.id && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-slate-900/60">
                      <SectionEditor section={section} onChange={updateSection} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center px-6 text-center">
              <div>
                <p className="text-slate-400 text-sm mb-2">Modo ecommerce activo</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  El home se configura desde Configuración y el Asistente de diseño IA.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right panel: live preview ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-slate-950">

          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
            <span className="text-xs text-slate-500">Vista previa</span>
            <div className="flex items-center gap-1">
              {(['desktop', 'mobile'] as const).map(w => (
                <button key={w} onClick={() => setPreviewWidth(w)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    previewWidth === w ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  {w === 'desktop' ? '🖥 Escritorio' : '📱 Móvil'}
                </button>
              ))}
              <button onClick={() => setIframeKey(k => k + 1)}
                className="ml-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-slate-300 border border-slate-700 transition-colors">
                ↺
              </button>
            </div>
          </div>

          {/* iFrame */}
          <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
            <div className={`relative h-full transition-all duration-300 ${previewWidth === 'mobile' ? 'w-[390px]' : 'w-full'}`}>
              {saveStatus === 'saving' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/50 rounded-xl pointer-events-none">
                  <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
                    Actualizando...
                  </span>
                </div>
              )}
              <iframe
                key={iframeKey}
                src={storeUrl}
                className="w-full h-full rounded-xl border border-slate-700 bg-white"
                style={{ minHeight: '600px' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
