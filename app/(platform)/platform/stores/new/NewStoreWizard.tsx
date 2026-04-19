'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  name: string
  description: string | null
  color_primary: string
  color_accent: string
  color_background: string
  color_text: string
  hero_title: string
}

interface Props {
  templates: Template[]
}

const PLANS = ['free', 'starter', 'pro', 'enterprise'] as const
const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'MXN', 'COP', 'PEN']
const LOCALES = [
  { value: 'es-AR', label: 'Español (Argentina)' },
  { value: 'es-MX', label: 'Español (México)' },
  { value: 'es-CL', label: 'Español (Chile)' },
  { value: 'es-CO', label: 'Español (Colombia)' },
  { value: 'es-PE', label: 'Español (Perú)' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
]

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

export default function NewStoreWizard({ templates }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [plan, setPlan] = useState<typeof PLANS[number]>('free')
  const [currency, setCurrency] = useState('ARS')
  const [locale, setLocale] = useState('es-AR')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!slugManual) {
      setSlug(slugify(val))
    }
  }

  function handleSlugChange(val: string) {
    setSlugManual(true)
    setSlug(val.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/platform/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          plan,
          currency,
          locale,
          ownerEmail: ownerEmail || undefined,
          templateId: selectedTemplate || undefined,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al crear el store.')
        return
      }

      router.push(`/platform/stores/${json.store.id}`)
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <StepDot n={1} active={step === 1} done={step > 1} label="Datos del store" onClick={() => setStep(1)} />
        <div className="flex-1 h-px bg-slate-800" />
        <StepDot n={2} active={step === 2} done={false} label="Plantilla" onClick={() => step > 1 && setStep(2)} />
      </div>

      {/* ── Step 1: datos básicos ── */}
      {step === 1 && (
        <div className="space-y-5">
          <Field label="Nombre del store *">
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Ej: Mi Tienda"
              required
              className="input"
            />
          </Field>

          <Field label="Slug (URL)" hint="Solo minúsculas, números y guiones. Mín. 3 caracteres.">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm font-mono shrink-0">{'{slug}'}.vendly.com/</span>
              <input
                type="text"
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                placeholder="mi-tienda"
                required
                className="input flex-1 font-mono"
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Plan">
              <select value={plan} onChange={e => setPlan(e.target.value as typeof PLANS[number])} className="input">
                {PLANS.map(p => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                ))}
              </select>
            </Field>

            <Field label="Moneda">
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="input">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Idioma / Locale">
            <select value={locale} onChange={e => setLocale(e.target.value)} className="input">
              {LOCALES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </Field>

          <Field label="Email del primer admin" hint="Opcional. Se creará como owner del store.">
            <input
              type="email"
              value={ownerEmail}
              onChange={e => setOwnerEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
              className="input"
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                if (!name.trim() || slug.length < 3) {
                  setError('Completá el nombre y el slug (mín. 3 caracteres).')
                  return
                }
                setError(null)
                setStep(2)
              }}
              className="px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: template picker ── */}
      {step === 2 && (
        <div className="space-y-5">
          <p className="text-sm text-slate-400">
            Elegí una plantilla de diseño para el store. Podés cambiarla después desde el admin.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sin template (defaults) */}
            <TemplateCard
              id={null}
              name="Default"
              description="Colores por defecto del sistema."
              colorPrimary="#1a1a2e"
              colorAccent="#e94560"
              colorBg="#ffffff"
              colorText="#1a1a2e"
              heroTitle="Bienvenidos"
              selected={selectedTemplate === null}
              onSelect={() => setSelectedTemplate(null)}
            />
            {templates.map(t => (
              <TemplateCard
                key={t.id}
                id={t.id}
                name={t.name}
                description={t.description}
                colorPrimary={t.color_primary}
                colorAccent={t.color_accent}
                colorBg={t.color_background}
                colorText={t.color_text}
                heroTitle={t.hero_title}
                selected={selectedTemplate === t.id}
                onSelect={() => setSelectedTemplate(t.id)}
              />
            ))}
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Volver
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear store'}
            </button>
          </div>
        </div>
      )}

      {/* Error step 1 */}
      {step === 1 && error && (
        <div className="px-4 py-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
          {error}
        </div>
      )}
    </form>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

function StepDot({
  n, active, done, label, onClick,
}: {
  n: number; active: boolean; done: boolean; label: string; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 group"
    >
      <span className={`
        w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-colors
        ${active ? 'bg-white text-slate-900 border-white' : done ? 'bg-slate-700 text-white border-slate-600' : 'bg-transparent text-slate-500 border-slate-700'}
      `}>
        {done ? '✓' : n}
      </span>
      <span className={`text-sm font-medium transition-colors ${active ? 'text-white' : 'text-slate-500'}`}>
        {label}
      </span>
    </button>
  )
}

function TemplateCard({
  id, name, description, colorPrimary, colorAccent, colorBg, colorText, heroTitle, selected, onSelect,
}: {
  id: string | null
  name: string
  description: string | null
  colorPrimary: string
  colorAccent: string
  colorBg: string
  colorText: string
  heroTitle: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        text-left rounded-xl border-2 overflow-hidden transition-all
        ${selected ? 'border-white ring-2 ring-white/20' : 'border-slate-800 hover:border-slate-600'}
      `}
    >
      {/* Mini preview */}
      <div
        className="h-24 relative flex items-center justify-center"
        style={{ backgroundColor: colorBg }}
      >
        <div
          className="absolute inset-x-0 top-0 h-8"
          style={{ backgroundColor: colorPrimary }}
        />
        <div className="relative z-10 px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: colorAccent, color: '#fff' }}>
          {heroTitle}
        </div>
        <div
          className="absolute bottom-0 inset-x-0 h-6 flex items-center px-3 gap-1"
          style={{ backgroundColor: colorBg }}
        >
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 h-3 rounded-sm" style={{ backgroundColor: colorPrimary, opacity: 0.15 }} />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5 bg-slate-900 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">{name}</span>
          {selected && <span className="text-xs text-green-400 font-bold">✓ Seleccionada</span>}
        </div>
        {description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{description}</p>}
      </div>
    </button>
  )
}
