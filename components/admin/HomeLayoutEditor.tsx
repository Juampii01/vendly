'use client'

/**
 * Editor visual de `home_layout` (HomeSection[]) para stores ecommerce.
 *
 * Filosofía:
 *   - Cambiar orden / agregar / borrar secciones desde la UI
 *   - Editar el `content` de cada sección con un formulario tipado
 *   - Auto-save con debounce + iframe live preview a la derecha
 *   - Aplicar un preset reemplaza el layout entero (athletic / default / minimal)
 *
 * Para agregar un nuevo tipo de sección:
 *   1. Agregar la variante a HomeSection en types/index.ts
 *   2. Agregar el componente reusable en components/store/sections/Xxx.tsx
 *   3. Registrar en HomeRenderer.tsx
 *   4. Agregar entrada en SECTION_META + un editor en SECTION_EDITORS abajo
 */
import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import type {
  HomeSection, HomeSectionType,
  HeroSectionContent, MarqueeSectionContent, CategoryGridContent,
  EditorialSplitContent, FeaturedProductsContent, ProductScrollContent,
  InstagramGalleryContent, NewsletterSectionContent, TrustBarContent, TrustBarItem,
} from '@/types'

interface Props {
  initialLayout: HomeSection[]
  storeUrl: string
}

// ─── Section metadata ──────────────────────────────────────────────────────

const SECTION_META: Record<HomeSectionType, { label: string; icon: string; description: string }> = {
  hero:             { icon: '🖼',  label: 'Hero',                description: 'Imagen full-bleed con título grande y CTA' },
  marquee:          { icon: '➤',   label: 'Banda animada',       description: 'Texto que se desplaza horizontal en loop' },
  categoryGrid:     { icon: '▦',   label: 'Categorías',          description: 'Grid de categorías (bento o uniforme)' },
  editorialSplit:   { icon: '◧',   label: 'Editorial split',     description: '50/50 imagen + bloque de texto' },
  featuredProducts: { icon: '★',   label: 'Productos destacados',description: 'Grid uniforme de productos' },
  productScroll:    { icon: '↔',   label: 'Productos scroll',    description: 'Scroll horizontal (mobile) + grid (desktop)' },
  instagramGallery: { icon: '⚏',   label: 'Galería Instagram',   description: '6 imágenes en grid 6-col' },
  newsletter:       { icon: '✉',   label: 'Newsletter',          description: 'Form de suscripción con mensaje' },
  trustBar:         { icon: '◆',   label: 'Trust bar',           description: 'Iconos de envío / cambios / pago seguro' },
}

const ALL_TYPES = Object.keys(SECTION_META) as HomeSectionType[]

// Defaults seguros para cuando se agrega una sección nueva — todos los campos
// son opcionales en HomeSection.content, así que un objeto vacío es válido y
// el SectionRenderer cae a defaults sensatos.
const NEW_SECTION_CONTENT: Record<HomeSectionType, object> = {
  hero:             { height: 'screen', overlay: 'gradient-bottom' } satisfies HeroSectionContent,
  marquee:          { background: 'accent', speed: 'medium' } satisfies MarqueeSectionContent,
  categoryGrid:     { layout: 'bento' } satisfies CategoryGridContent,
  editorialSplit:   { imagePosition: 'left' } satisfies EditorialSplitContent,
  featuredProducts: { columns: 4, source: 'featured' } satisfies FeaturedProductsContent,
  productScroll:    { source: 'all' } satisfies ProductScrollContent,
  instagramGallery: {} satisfies InstagramGalleryContent,
  newsletter:       { background: 'primary' } satisfies NewsletterSectionContent,
  trustBar:         { layout: 'border' } satisfies TrustBarContent,
}

// ─── Presets (mantener en sync con lib/home-presets.ts) ────────────────────
//
// Los presets viven en lib/home-presets.ts. No los importamos directo porque
// este es un client component y traer el archivo entero es innecesario — solo
// referenciamos por nombre y traemos el JSON cuando el usuario aplica uno.

const PRESETS = ['athletic', 'default', 'minimal'] as const
type PresetName = typeof PRESETS[number]

// ─── Component ──────────────────────────────────────────────────────────────

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function HomeLayoutEditor({ initialLayout, storeUrl }: Props) {
  const [layout, setLayout] = useState<HomeSection[]>(initialLayout ?? [])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const [iframeKey, setIframeKey] = useState(0)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showPresetMenu, setShowPresetMenu] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current) }, [])

  const scheduleSave = useCallback((next: HomeSection[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    setSaveStatus('saving')
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/admin/store-config', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ home_layout: next }),
        })
        if (!res.ok) throw new Error()
        setSaveStatus('saved')
        setIframeKey(k => k + 1)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      }
    }, 900)
  }, [])

  function commit(next: HomeSection[]) {
    setLayout(next)
    scheduleSave(next)
  }

  function toggleActive(id: string) {
    commit(layout.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }

  function moveSection(id: string, dir: -1 | 1) {
    const i = layout.findIndex(s => s.id === id)
    if (i < 0) return
    const j = i + dir
    if (j < 0 || j >= layout.length) return
    const next = [...layout]
    const tmp = next[i]
    next[i] = next[j]
    next[j] = tmp
    commit(next)
  }

  function deleteSection(id: string) {
    if (!confirm('¿Borrar esta sección?')) return
    commit(layout.filter(s => s.id !== id))
    if (expanded === id) setExpanded(null)
  }

  function addSection(type: HomeSectionType) {
    const id = `${type}-${Date.now().toString(36)}`
    const newSection = {
      id, type, active: true, content: { ...NEW_SECTION_CONTENT[type] },
    } as HomeSection
    commit([...layout, newSection])
    setExpanded(id)
    setShowAddMenu(false)
  }

  function updateContent(id: string, content: object) {
    commit(layout.map(s => s.id === id ? ({ ...s, content } as HomeSection) : s))
  }

  async function applyPreset(name: PresetName) {
    setShowPresetMenu(false)
    if (layout.length > 0 && !confirm(`Esto reemplaza el layout actual con el preset "${name}". ¿Seguir?`)) return
    try {
      const res = await fetch(`/api/admin/store-config/preset?name=${name}`)
      if (!res.ok) {
        // Endpoint puede no existir todavía — fallback: bajar el preset desde un endpoint stub
        // o simplemente avisar al usuario que use el script CLI.
        alert(`Endpoint /api/admin/store-config/preset no implementado.\nUsá: node scripts/apply-home-preset.mjs <store_id> ${name}`)
        return
      }
      const preset = await res.json() as HomeSection[]
      commit(preset)
    } catch {
      alert('Error al aplicar preset.')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 -m-0 overflow-hidden">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-slate-500 hover:text-white text-sm transition-colors">
            ← Admin
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-300 font-medium">Diseño de la home</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-600 ml-2">Config-driven</span>
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
        <div className="w-[380px] shrink-0 flex flex-col bg-slate-900 border-r border-slate-800 overflow-hidden">

          {/* Header con preset menu */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-800 shrink-0 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Secciones</p>
              <p className="text-xs text-slate-400 mt-0.5">{layout.length} en total</p>
            </div>
            <div className="relative">
              <button onClick={() => setShowPresetMenu(v => !v)}
                className="text-[10px] uppercase tracking-wider text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-md px-3 py-1.5 transition-colors">
                Aplicar preset ▾
              </button>
              {showPresetMenu && (
                <div className="absolute right-0 top-full mt-1 z-10 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1">
                  {PRESETS.map(p => (
                    <button key={p} onClick={() => applyPreset(p)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                      {p === 'athletic' ? '🏃 Athletic (Adidas-style)'
                       : p === 'default' ? '🛍 Default (ecommerce)'
                       : '✨ Minimal (catálogo chico)'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section list */}
          <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
            {layout.length === 0 && (
              <div className="text-center py-12 px-4">
                <p className="text-slate-400 text-sm mb-2">Sin secciones todavía</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Aplicá un preset arriba o agregá secciones una por una abajo.
                </p>
              </div>
            )}
            {layout.map((section, i) => {
              const meta = SECTION_META[section.type]
              const isExpanded = expanded === section.id
              return (
                <div key={section.id}
                  className={`rounded-xl border overflow-hidden transition-colors ${
                    section.active ? 'border-slate-700' : 'border-slate-800 opacity-60'
                  }`}>
                  {/* Header */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="text-base font-mono text-slate-500 shrink-0 w-6 text-center">{meta.icon}</span>
                    <button onClick={() => setExpanded(isExpanded ? null : section.id)}
                      className="flex-1 text-left min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {meta.label}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{section.id}</p>
                    </button>

                    {/* Reorder buttons */}
                    <div className="flex items-center text-slate-600 text-[10px] gap-0.5">
                      <button onClick={() => moveSection(section.id, -1)} disabled={i === 0}
                        className="px-1 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Subir">▲</button>
                      <button onClick={() => moveSection(section.id, 1)} disabled={i === layout.length - 1}
                        className="px-1 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" title="Bajar">▼</button>
                    </div>

                    {/* Toggle active */}
                    <button onClick={() => toggleActive(section.id)}
                      className={`relative h-4 w-7 rounded-full transition-colors shrink-0 ${section.active ? 'bg-white' : 'bg-slate-700'}`}
                      title={section.active ? 'Visible' : 'Oculta'}>
                      <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-slate-900 transition-transform ${section.active ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
                    </button>

                    {/* Delete */}
                    <button onClick={() => deleteSection(section.id)}
                      className="px-1 text-slate-700 hover:text-red-400 transition-colors text-sm shrink-0" title="Borrar">✕</button>
                  </div>

                  {/* Content editor */}
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-1 border-t border-slate-800 bg-slate-900/60">
                      <p className="text-[10px] text-slate-600 mb-3">{meta.description}</p>
                      <SectionContentEditor section={section}
                        onChange={c => updateContent(section.id, c)} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Add section */}
          <div className="px-3 pb-4 pt-1 border-t border-slate-800 shrink-0 relative">
            <button onClick={() => setShowAddMenu(v => !v)}
              className="w-full rounded-lg border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-sm py-2.5 transition-colors">
              + Agregar sección
            </button>
            {showAddMenu && (
              <div className="absolute bottom-full left-3 right-3 mb-1 z-10 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 max-h-80 overflow-y-auto">
                {ALL_TYPES.map(t => {
                  const meta = SECTION_META[t]
                  return (
                    <button key={t} onClick={() => addSection(t)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-5 text-center">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{meta.label}</p>
                        <p className="text-[10px] text-slate-500 truncate">{meta.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: live preview ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-slate-950">
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

          <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
            <div className={`relative h-full transition-all duration-300 ${previewWidth === 'mobile' ? 'w-[390px]' : 'w-full'}`}>
              {saveStatus === 'saving' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/30 rounded-xl pointer-events-none">
                  <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700">
                    Actualizando...
                  </span>
                </div>
              )}
              <iframe key={iframeKey} src={storeUrl}
                className="w-full h-full rounded-xl border border-slate-700 bg-white"
                style={{ minHeight: '600px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Save indicator ────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  const map = {
    saving: { color: 'text-slate-400', text: 'Guardando...' },
    saved:  { color: 'text-emerald-400', text: '✓ Guardado' },
    error:  { color: 'text-red-400', text: '✕ Error al guardar' },
  } as const
  const { color, text } = map[status]
  return <span className={`text-xs ${color}`}>{text}</span>
}

// ─── Per-type content editors ──────────────────────────────────────────────

function SectionContentEditor({ section, onChange }: {
  section: HomeSection
  onChange: (content: object) => void
}) {
  switch (section.type) {
    case 'hero':             return <HeroEditor c={section.content} onChange={onChange} />
    case 'marquee':          return <MarqueeEditor c={section.content} onChange={onChange} />
    case 'categoryGrid':     return <CategoryGridEditor c={section.content} onChange={onChange} />
    case 'editorialSplit':   return <EditorialSplitEditor c={section.content} onChange={onChange} />
    case 'featuredProducts': return <FeaturedProductsEditor c={section.content} onChange={onChange} />
    case 'productScroll':    return <ProductScrollEditor c={section.content} onChange={onChange} />
    case 'instagramGallery': return <InstagramGalleryEditor c={section.content} onChange={onChange} />
    case 'newsletter':       return <NewsletterEditor c={section.content} onChange={onChange} />
    case 'trustBar':         return <TrustBarEditor c={section.content} onChange={onChange} />
  }
}

// ─── Input primitives ─────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600 resize-none"

function TextField({ label, value, onChange, placeholder, multiline }: {
  label: string; value?: string; onChange: (v: string | undefined) => void
  placeholder?: string; multiline?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      {multiline
        ? <textarea value={value ?? ''} onChange={e => onChange(e.target.value || undefined)} placeholder={placeholder} rows={2} className={inputCls} />
        : <input value={value ?? ''} onChange={e => onChange(e.target.value || undefined)} placeholder={placeholder} className={inputCls} />}
    </div>
  )
}

function SelectField<T extends string>({ label, value, options, onChange }: {
  label: string; value?: T; options: { value: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      <select value={value ?? options[0].value} onChange={e => onChange(e.target.value as T)} className={inputCls}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function NumberField({ label, value, onChange, min, max }: {
  label: string; value?: number; onChange: (v: number | undefined) => void; min?: number; max?: number
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
      <input type="number" value={value ?? ''} min={min} max={max}
        onChange={e => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        className={inputCls} />
    </div>
  )
}

// ─── Editors per section type ─────────────────────────────────────────────

function HeroEditor({ c, onChange }: { c: HeroSectionContent; onChange: (c: HeroSectionContent) => void }) {
  const set = <K extends keyof HeroSectionContent>(k: K, v: HeroSectionContent[K]) => onChange({ ...c, [k]: v })
  return (
    <div className="space-y-2.5">
      <TextField label="Imagen URL (override del store)" value={c.imageUrl} onChange={v => set('imageUrl', v)} placeholder="https://..." />
      <TextField label="Eyebrow" value={c.eyebrow} onChange={v => set('eyebrow', v)} placeholder="NUEVA COLECCIÓN" />
      <TextField label="Título (override)" value={c.title} onChange={v => set('title', v)} placeholder="Default: hero_title del store" />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="CTA texto" value={c.primaryCta?.label}
          onChange={v => set('primaryCta', v ? { label: v, url: c.primaryCta?.url ?? '/productos' } : undefined)} />
        <TextField label="CTA link" value={c.primaryCta?.url}
          onChange={v => set('primaryCta', v ? { label: c.primaryCta?.label ?? 'Ver más', url: v } : undefined)} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SelectField label="Alto" value={c.height} onChange={v => set('height', v)}
          options={[{value: 'screen', label: 'Pantalla'}, {value: 'tall', label: 'Alto'}, {value: 'medium', label: 'Medio'}]} />
        <SelectField label="Align" value={c.align} onChange={v => set('align', v)}
          options={[{value: 'left', label: 'Izq'}, {value: 'center', label: 'Centro'}]} />
        <SelectField label="Overlay" value={c.overlay} onChange={v => set('overlay', v)}
          options={[
            {value: 'gradient-bottom', label: 'Grad ↓'},
            {value: 'gradient-left', label: 'Grad ←'},
            {value: 'dark', label: 'Dark'},
            {value: 'none', label: 'Sin'},
          ]} />
      </div>
    </div>
  )
}

function MarqueeEditor({ c, onChange }: { c: MarqueeSectionContent; onChange: (c: MarqueeSectionContent) => void }) {
  const itemsText = (c.items ?? []).join('\n')
  return (
    <div className="space-y-2.5">
      <TextField label="Items (uno por línea — vacío usa store.home_marquee_items)"
        value={itemsText}
        onChange={v => onChange({ ...c, items: v ? v.split('\n').map(s => s.trim()).filter(Boolean) : undefined })}
        multiline />
      <div className="grid grid-cols-2 gap-2">
        <SelectField label="Fondo" value={c.background} onChange={v => onChange({ ...c, background: v })}
          options={[
            {value: 'accent', label: 'Accent'},
            {value: 'primary', label: 'Primary'},
            {value: 'secondary', label: 'Secondary'},
            {value: 'text', label: 'Text'},
          ]} />
        <SelectField label="Velocidad" value={c.speed} onChange={v => onChange({ ...c, speed: v })}
          options={[{value: 'slow', label: 'Lento'}, {value: 'medium', label: 'Medio'}, {value: 'fast', label: 'Rápido'}]} />
      </div>
    </div>
  )
}

function CategoryGridEditor({ c, onChange }: { c: CategoryGridContent; onChange: (c: CategoryGridContent) => void }) {
  return (
    <div className="space-y-2.5">
      <TextField label="Título" value={c.title} onChange={v => onChange({ ...c, title: v })} placeholder="Categorías" />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="CTA texto" value={c.ctaLabel} onChange={v => onChange({ ...c, ctaLabel: v })} placeholder="Ver todo" />
        <TextField label="CTA link" value={c.ctaUrl} onChange={v => onChange({ ...c, ctaUrl: v })} placeholder="/productos" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <SelectField label="Layout" value={c.layout} onChange={v => onChange({ ...c, layout: v })}
          options={[{value: 'bento', label: 'Bento (1 grande)'}, {value: 'uniform', label: 'Uniforme'}]} />
        <NumberField label="Máx items" value={c.maxItems} onChange={v => onChange({ ...c, maxItems: v })} min={1} max={20} />
      </div>
    </div>
  )
}

function EditorialSplitEditor({ c, onChange }: { c: EditorialSplitContent; onChange: (c: EditorialSplitContent) => void }) {
  return (
    <div className="space-y-2.5">
      <TextField label="Imagen URL (override)" value={c.imageUrl} onChange={v => onChange({ ...c, imageUrl: v })} placeholder="https://..." />
      <SelectField label="Posición imagen" value={c.imagePosition} onChange={v => onChange({ ...c, imagePosition: v })}
        options={[{value: 'left', label: 'Izquierda'}, {value: 'right', label: 'Derecha'}]} />
      <TextField label="Eyebrow (override)" value={c.eyebrow} onChange={v => onChange({ ...c, eyebrow: v })} />
      <TextField label="Título (override)" value={c.title} onChange={v => onChange({ ...c, title: v })} />
      <TextField label="Cuerpo (override)" value={c.body} onChange={v => onChange({ ...c, body: v })} multiline />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="CTA texto" value={c.ctaLabel} onChange={v => onChange({ ...c, ctaLabel: v })} placeholder="Explorar colección" />
        <TextField label="CTA link" value={c.ctaUrl} onChange={v => onChange({ ...c, ctaUrl: v })} placeholder="/productos" />
      </div>
    </div>
  )
}

function FeaturedProductsEditor({ c, onChange }: { c: FeaturedProductsContent; onChange: (c: FeaturedProductsContent) => void }) {
  return (
    <div className="space-y-2.5">
      <TextField label="Título" value={c.title} onChange={v => onChange({ ...c, title: v })} placeholder="Destacados" />
      <TextField label="Eyebrow" value={c.eyebrow} onChange={v => onChange({ ...c, eyebrow: v })} placeholder="Selección" />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="CTA texto" value={c.ctaLabel} onChange={v => onChange({ ...c, ctaLabel: v })} placeholder="Ver todos" />
        <TextField label="CTA link" value={c.ctaUrl} onChange={v => onChange({ ...c, ctaUrl: v })} placeholder="/productos" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SelectField label="Columnas" value={String(c.columns ?? 4) as '2'|'3'|'4'}
          onChange={v => onChange({ ...c, columns: Number(v) as 2|3|4 })}
          options={[{value: '2', label: '2'}, {value: '3', label: '3'}, {value: '4', label: '4'}]} />
        <NumberField label="Máx items" value={c.maxItems} onChange={v => onChange({ ...c, maxItems: v })} min={1} max={20} />
        <SelectField label="Fuente" value={c.source} onChange={v => onChange({ ...c, source: v })}
          options={[{value: 'featured', label: 'Destacados'}, {value: 'all', label: 'Todos'}]} />
      </div>
    </div>
  )
}

function ProductScrollEditor({ c, onChange }: { c: ProductScrollContent; onChange: (c: ProductScrollContent) => void }) {
  return (
    <div className="space-y-2.5">
      <TextField label="Título" value={c.title} onChange={v => onChange({ ...c, title: v })} placeholder="Más vendidos" />
      <div className="grid grid-cols-2 gap-2">
        <TextField label="CTA texto" value={c.ctaLabel} onChange={v => onChange({ ...c, ctaLabel: v })} />
        <TextField label="CTA link" value={c.ctaUrl} onChange={v => onChange({ ...c, ctaUrl: v })} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SelectField label="Cols desktop" value={String(c.desktopColumns ?? 4) as '3'|'4'}
          onChange={v => onChange({ ...c, desktopColumns: Number(v) as 3|4 })}
          options={[{value: '3', label: '3'}, {value: '4', label: '4'}]} />
        <NumberField label="Máx items" value={c.maxItems} onChange={v => onChange({ ...c, maxItems: v })} min={1} max={20} />
        <SelectField label="Fondo" value={c.background} onChange={v => onChange({ ...c, background: v })}
          options={[{value: 'subtle', label: 'Sutil'}, {value: 'transparent', label: 'Transp.'}]} />
      </div>
      <SelectField label="Fuente" value={c.source} onChange={v => onChange({ ...c, source: v })}
        options={[{value: 'all', label: 'Todos'}, {value: 'featured', label: 'Destacados'}]} />
    </div>
  )
}

function InstagramGalleryEditor({ c, onChange }: { c: InstagramGalleryContent; onChange: (c: InstagramGalleryContent) => void }) {
  return (
    <div className="space-y-2.5">
      <TextField label="Título (override — default usa @handle del store)" value={c.title} onChange={v => onChange({ ...c, title: v })} />
      <TextField label="Eyebrow" value={c.eyebrow} onChange={v => onChange({ ...c, eyebrow: v })} placeholder="Galería" />
      <NumberField label="Máx items" value={c.maxItems} onChange={v => onChange({ ...c, maxItems: v })} min={3} max={12} />
    </div>
  )
}

function NewsletterEditor({ c, onChange }: { c: NewsletterSectionContent; onChange: (c: NewsletterSectionContent) => void }) {
  return (
    <div className="space-y-2.5">
      <TextField label="Eyebrow" value={c.eyebrow} onChange={v => onChange({ ...c, eyebrow: v })} placeholder="Comunidad {store.name}" />
      <TextField label="Título" value={c.title} onChange={v => onChange({ ...c, title: v })} placeholder="Primero te enterás vos" />
      <TextField label="Cuerpo" value={c.body} onChange={v => onChange({ ...c, body: v })} multiline placeholder="Lanzamientos exclusivos..." />
      <SelectField label="Fondo" value={c.background} onChange={v => onChange({ ...c, background: v })}
        options={[
          {value: 'primary', label: 'Primary (oscuro)'},
          {value: 'accent', label: 'Accent'},
          {value: 'subtle', label: 'Sutil (claro)'},
        ]} />
    </div>
  )
}

function TrustBarEditor({ c, onChange }: { c: TrustBarContent; onChange: (c: TrustBarContent) => void }) {
  const items = c.items ?? []
  function updateItem(i: number, patch: Partial<TrustBarItem>) {
    const next = items.map((it, idx) => idx === i ? { ...it, ...patch } : it)
    onChange({ ...c, items: next })
  }
  function deleteItem(i: number) {
    onChange({ ...c, items: items.filter((_, idx) => idx !== i) })
  }
  function addItem() {
    onChange({ ...c, items: [...items, { icon: 'truck', title: 'Nuevo', desc: 'Descripción' }] })
  }

  return (
    <div className="space-y-2.5">
      <SelectField label="Layout" value={c.layout} onChange={v => onChange({ ...c, layout: v })}
        options={[{value: 'border', label: 'Línea (sin fondo)'}, {value: 'cards', label: 'Cards'}]} />
      <div className="space-y-2">
        <p className="text-[10px] text-slate-500 uppercase tracking-wide">Items (vacío = defaults envío/cambios/pago)</p>
        {items.map((it, i) => (
          <div key={i} className="rounded-lg border border-slate-700 p-2 space-y-1.5">
            <div className="flex items-center gap-2">
              <SelectField label="" value={it.icon} onChange={v => updateItem(i, { icon: v })}
                options={[
                  {value: 'truck', label: '🚚 Truck'}, {value: 'return', label: '↺ Return'},
                  {value: 'lock', label: '🔒 Lock'}, {value: 'ship', label: '🚢 Ship'},
                  {value: 'star', label: '★ Star'}, {value: 'support', label: '? Support'},
                  {value: 'gift', label: '🎁 Gift'},
                ]} />
              <button onClick={() => deleteItem(i)}
                className="text-slate-600 hover:text-red-400 text-sm shrink-0">✕</button>
            </div>
            <TextField label="" value={it.title} onChange={v => updateItem(i, { title: v ?? '' })} placeholder="Título" />
            <TextField label="" value={it.desc} onChange={v => updateItem(i, { desc: v ?? '' })} placeholder="Descripción" />
          </div>
        ))}
        <button onClick={addItem}
          className="w-full text-xs text-slate-400 hover:text-white border border-dashed border-slate-700 rounded-lg py-2 transition-colors">
          + Item
        </button>
      </div>
    </div>
  )
}
