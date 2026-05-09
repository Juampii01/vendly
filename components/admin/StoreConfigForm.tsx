'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FocalPointPicker } from './FocalPointPicker'
import type { StoreConfig } from '@/types'

interface Props { store: StoreConfig }

type Section = 'general' | 'colors' | 'hero' | 'inicio' | 'shipping' | 'contact' | 'seo' | 'avanzado' | 'integraciones'

interface IntegStatus {
  has_custom_config: boolean
  mp_access_token_configured: boolean
  mp_public_key: string | null
  mp_webhook_secret_configured: boolean
  resend_api_key_configured: boolean
  resend_from_domain: string | null
  wa_api_key_configured: boolean
  wa_from_number: string | null
}

// ─── Section definitions ──────────────────────────────────────────────────────

const SECTIONS: { id: Section; label: string; description: string; icon: string }[] = [
  { id: 'general',       label: 'General',       description: 'Nombre y logo',          icon: '🏪' },
  { id: 'colors',        label: 'Colores',        description: 'Paleta de la marca',     icon: '🎨' },
  { id: 'hero',          label: 'Hero',           description: 'Portada principal',      icon: '🖼' },
  { id: 'inicio',        label: 'Inicio',         description: 'Secciones del home',     icon: '🏠' },
  { id: 'shipping',      label: 'Envío',          description: 'Costos y umbrales',      icon: '🚚' },
  { id: 'contact',       label: 'Contacto',       description: 'WhatsApp, email, RRSS',  icon: '💬' },
  { id: 'seo',           label: 'SEO',            description: 'Google y buscadores',    icon: '🔍' },
  { id: 'avanzado',      label: 'Avanzado',       description: 'Tipo, moneda, locale',   icon: '⚙️' },
  { id: 'integraciones', label: 'Integraciones',  description: 'MP, email, WhatsApp API',icon: '🔌' },
]

// ─── Main component ────────────────────────────────────────────────────────────

export function StoreConfigForm({ store }: Props) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: store.name,
    logo_url: store.logo_url ?? '',
    color_primary: store.color_primary,
    color_secondary: store.color_secondary,
    color_accent: store.color_accent,
    color_background: store.color_background,
    color_text: store.color_text,
    hero_title: store.hero_title,
    hero_subtitle: store.hero_subtitle ?? '',
    hero_cta_label: store.hero_cta_label,
    hero_cta_url: store.hero_cta_url,
    hero_image_url: store.hero_image_url ?? '',
    hero_image_position: store.hero_image_position ?? 'center',
    free_shipping_threshold: store.free_shipping_threshold?.toString() ?? '',
    shipping_base_price: store.shipping_base_price.toString(),
    whatsapp_number: store.whatsapp_number ?? '',
    email: store.email ?? '',
    instagram_url: store.instagram_url ?? '',
    meta_title: store.meta_title ?? '',
    meta_description: store.meta_description ?? '',
    home_marquee_items: (store.home_marquee_items ?? []).join('\n'),
    home_split_image_url: store.home_split_image_url ?? '',
    home_split_image_position: store.home_split_image_position ?? 'center',
    home_editorial_label: store.home_editorial_label ?? '',
    home_editorial_title: store.home_editorial_title ?? '',
    home_editorial_body: store.home_editorial_body ?? '',
    hero_cta_color: store.hero_cta_color ?? '',
    site_type: store.site_type ?? 'ecommerce',
    base_url: store.base_url ?? '',
    currency: store.currency ?? 'ARS',
    locale: store.locale ?? 'es-AR',
  })

  const [integForm, setIntegForm] = useState({
    mp_access_token: '', mp_public_key: '', mp_webhook_secret: '',
    resend_api_key: '', resend_from_domain: '',
    wa_api_key: '', wa_from_number: '',
  })
  const [integStatus, setIntegStatus] = useState<IntegStatus | null>(null)
  const [integSaving, setIntegSaving] = useState(false)
  const [integSaved, setIntegSaved] = useState(false)
  const [integError, setIntegError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('general')
  const [aiHeroLoading, setAiHeroLoading] = useState<'title' | 'subtitle' | null>(null)
  const [aiHeroError, setAiHeroError] = useState<string | null>(null)

  async function generateHeroCopy(target: 'hero_title' | 'hero_subtitle') {
    setAiHeroLoading(target === 'hero_title' ? 'title' : 'subtitle')
    setAiHeroError(null)
    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, storeName: form.name }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error de IA.')
      set(target, json.result)
    } catch (e) {
      setAiHeroError(e instanceof Error ? e.message : 'Error de IA.')
    } finally {
      setAiHeroLoading(null)
    }
  }

  useEffect(() => {
    if (section === 'integraciones' && !integStatus) {
      fetch('/api/admin/tenant-config')
        .then((r) => r.json())
        .then((d) => setIntegStatus(d.data ?? null))
        .catch(() => null)
    }
  }, [section, integStatus])

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
    setError(null)
  }
  function setInteg(key: string, value: string) {
    setIntegForm((f) => ({ ...f, [key]: value }))
    setIntegSaved(false)
    setIntegError(null)
  }

  async function handleSave() {
    setSaving(true); setError(null)
    try {
      const payload: Record<string, unknown> = { ...form }
      payload.free_shipping_threshold = form.free_shipping_threshold === '' ? null : Number(form.free_shipping_threshold)
      payload.shipping_base_price = Number(form.shipping_base_price)
      for (const k of ['logo_url','hero_subtitle','hero_image_url','hero_cta_color','whatsapp_number','email','instagram_url','meta_title','meta_description','home_split_image_url','home_editorial_label','home_editorial_title','home_editorial_body','base_url']) {
        if (payload[k] === '') payload[k] = null
      }
      payload.home_marquee_items = form.home_marquee_items.split('\n').map((s) => s.trim()).filter(Boolean)
      const res = await fetch('/api/admin/store-config', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error ?? 'Error al guardar') }
      setSaved(true); setTimeout(() => setSaved(false), 3000)
      router.refresh()
    } catch (e) { setError(e instanceof Error ? e.message : 'Error desconocido') }
    finally { setSaving(false) }
  }

  async function handleSaveInteg() {
    setIntegSaving(true); setIntegError(null)
    try {
      const payload: Record<string, string | null> = {}
      for (const [k, v] of Object.entries(integForm)) { if (v !== '') payload[k] = v }
      if (Object.keys(payload).length === 0) { setIntegError('No hay cambios para guardar.'); return }
      const res = await fetch('/api/admin/tenant-config', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) { const data = await res.json(); throw new Error(data.error ?? 'Error al guardar') }
      const status = await fetch('/api/admin/tenant-config').then((r) => r.json())
      setIntegStatus(status.data)
      setIntegForm({ mp_access_token: '', mp_public_key: '', mp_webhook_secret: '', resend_api_key: '', resend_from_domain: '', wa_api_key: '', wa_from_number: '' })
      setIntegSaved(true); setTimeout(() => setIntegSaved(false), 3000)
    } catch (e) { setIntegError(e instanceof Error ? e.message : 'Error desconocido') }
    finally { setIntegSaving(false) }
  }

  const activeSec = SECTIONS.find(s => s.id === section)!

  return (
    <div className="flex gap-0 min-h-full">

      {/* ── Left nav ───────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-52 shrink-0 flex-col gap-0.5 border-r border-slate-100 pr-4 pt-1">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-start gap-3 rounded-xl px-3 py-3 text-left transition-all ${
              section === s.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className="text-lg leading-none mt-0.5">{s.icon}</span>
            <div className="min-w-0">
              <p className={`text-xs font-bold leading-tight ${section === s.id ? 'text-white' : 'text-slate-700'}`}>
                {s.label}
              </p>
              <p className={`text-[10px] mt-0.5 leading-tight ${section === s.id ? 'text-white/60' : 'text-slate-400'}`}>
                {s.description}
              </p>
            </div>
          </button>
        ))}
      </aside>

      {/* ── Mobile section tabs ────────────────────────────────────────────── */}
      <div className="flex lg:hidden w-full mb-5 overflow-x-auto border-b border-slate-100 pb-0 gap-0">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`shrink-0 flex flex-col items-center gap-1 px-4 py-3 text-xs border-b-2 transition-colors -mb-px ${
              section === s.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span className="text-base">{s.icon}</span>
            <span className="font-medium whitespace-nowrap">{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 lg:pl-8">

        {/* Section header */}
        <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-100">
          <span className="text-2xl">{activeSec.icon}</span>
          <div>
            <h2 className="text-base font-black text-slate-900">{activeSec.label}</h2>
            <p className="text-xs text-slate-400">{activeSec.description}</p>
          </div>
        </div>

        {/* ── GENERAL ──────────────────────────────────────────────────────── */}
        {section === 'general' && (
          <div className="space-y-6">
            <Field label="Nombre de la tienda" required hint="Aparece en el header, footer y título de la pestaña">
              <Input value={form.name} onChange={(v) => set('name', v)} placeholder="Acosta Bienes Raíces" />
            </Field>
            <ImageUploadField
              label="Logo"
              hint="Subí un archivo o pegá una URL. Dejá vacío para mostrar el nombre en texto."
              value={form.logo_url}
              onChange={(v) => set('logo_url', v)}
              storeId={store.id}
            />

            {/* Logo preview card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                Vista previa — Header
              </p>
              <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logo_url}
                      alt="Logo"
                      className="h-8 w-auto object-contain"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  ) : (
                    <span className="text-sm font-black" style={{ color: form.color_accent || form.color_primary }}>
                      {form.name || 'Nombre de la tienda'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">Menú</span>
                  <div className="h-7 w-20 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: form.color_accent || form.color_primary }}>
                    Contactar
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COLORS ───────────────────────────────────────────────────────── */}
        {section === 'colors' && (
          <div className="space-y-6">
            <div className="grid gap-3">
              {[
                { key: 'color_primary',    label: 'Principal',   desc: 'Botones, elementos de marca' },
                { key: 'color_secondary',  label: 'Secundario',  desc: 'Elementos de soporte' },
                { key: 'color_accent',     label: 'Acento',      desc: 'Badges, highlights, activos' },
                { key: 'color_background', label: 'Fondo',       desc: 'Fondo general de la tienda' },
                { key: 'color_text',       label: 'Texto',       desc: 'Color del texto principal' },
              ].map(({ key, label, desc }) => (
                <ColorRow
                  key={key}
                  label={label}
                  hint={desc}
                  value={form[key as keyof typeof form]}
                  onChange={(v) => set(key, v)}
                />
              ))}
            </div>

            {/* Live palette preview */}
            <div className="rounded-2xl border border-slate-100 overflow-hidden">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                Vista previa en vivo
              </p>
              {/* Mini site */}
              <div style={{ backgroundColor: form.color_background }}>
                {/* Mini nav */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-black/5" style={{ backgroundColor: form.color_background }}>
                  <span className="text-xs font-black" style={{ color: form.color_primary }}>{form.name}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px]" style={{ color: form.color_text, opacity: 0.5 }}>Inicio</span>
                    <span className="text-[10px]" style={{ color: form.color_text, opacity: 0.5 }}>Catálogo</span>
                    <span className="px-3 py-1 text-[9px] font-bold text-white rounded-full" style={{ backgroundColor: form.color_accent }}>
                      Contactar
                    </span>
                  </div>
                </div>
                {/* Mini hero */}
                <div className="px-4 py-6 text-center" style={{ backgroundColor: form.color_primary }}>
                  <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Bienvenidos</p>
                  <p className="text-base font-black text-white leading-tight mb-3">{form.hero_title || form.name}</p>
                  <div className="inline-flex gap-2">
                    <span className="px-3 py-1.5 text-[10px] font-black text-white" style={{ backgroundColor: form.color_accent }}>
                      {form.hero_cta_label || 'Ver más'}
                    </span>
                    <span className="px-3 py-1.5 text-[10px] font-bold border border-white/30 text-white/80">
                      Contactar
                    </span>
                  </div>
                </div>
                {/* Mini content */}
                <div className="px-4 py-4 flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 rounded-lg border border-black/5 p-3 bg-white/40">
                      <div className="aspect-square rounded mb-2" style={{ backgroundColor: form.color_secondary, opacity: 0.4 }} />
                      <div className="h-2 rounded mb-1" style={{ backgroundColor: form.color_text, opacity: 0.15 }} />
                      <div className="h-2 rounded w-2/3" style={{ backgroundColor: form.color_text, opacity: 0.1 }} />
                      <div className="mt-2 h-6 rounded text-[9px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: form.color_primary }}>
                        Comprar
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Color swatches row */}
              <div className="flex border-t border-slate-100">
                {[
                  { color: form.color_primary, label: 'Principal' },
                  { color: form.color_secondary, label: 'Secundario' },
                  { color: form.color_accent, label: 'Acento' },
                  { color: form.color_background, label: 'Fondo' },
                  { color: form.color_text, label: 'Texto' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex-1 text-center">
                    <div className="h-8 w-full" style={{ backgroundColor: color }} />
                    <p className="py-1 text-[9px] text-slate-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        {section === 'hero' && (
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-5">
                {/* Título */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600">Título <span className="text-red-400">*</span></label>
                    <button type="button" disabled={aiHeroLoading !== null} onClick={() => generateHeroCopy('hero_title')}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-40">
                      ✦ {aiHeroLoading === 'title' ? 'Generando...' : 'Generar con IA'}
                    </button>
                  </div>
                  <Input value={form.hero_title} onChange={(v) => set('hero_title', v)} placeholder="Tu propiedad ideal" />
                </div>
                {/* Subtítulo */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-600">Subtítulo</label>
                    <button type="button" disabled={aiHeroLoading !== null} onClick={() => generateHeroCopy('hero_subtitle')}
                      className="flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-40">
                      ✦ {aiHeroLoading === 'subtitle' ? 'Generando...' : 'Generar con IA'}
                    </button>
                  </div>
                  <Input value={form.hero_subtitle} onChange={(v) => set('hero_subtitle', v)} placeholder="Más de 20 años de experiencia" />
                  {aiHeroError && <p className="mt-1 text-xs text-red-500">{aiHeroError}</p>}
                </div>
                <Field label="Texto del botón" required>
                  <Input value={form.hero_cta_label} onChange={(v) => set('hero_cta_label', v)} placeholder="Ver inmuebles" />
                </Field>
                <Field label="URL del botón" required>
                  <Input value={form.hero_cta_url} onChange={(v) => set('hero_cta_url', v)} placeholder="/productos" />
                </Field>
                <ImageUploadField
                  label="Imagen de fondo"
                  hint="1440×900px mínimo. Subí un archivo o pegá una URL."
                  value={form.hero_image_url}
                  onChange={(v) => set('hero_image_url', v)}
                  storeId={store.id}
                  aspect="16/9"
                />
                {form.hero_image_url && (
                  <FocalPointPicker
                    imageUrl={form.hero_image_url}
                    value={form.hero_image_position}
                    onChange={(v) => set('hero_image_position', v)}
                    aspect="16/9"
                    hint="Click sobre la imagen para elegir qué punto debe quedar visible cuando la imagen se recorta. Útil para retratos, modelos o productos altos."
                  />
                )}
              </div>

              {/* Live hero preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-100 self-start sticky top-4">
                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">
                  Vista previa del hero
                </p>
                <div className="relative aspect-[16/9] overflow-hidden">
                  {form.hero_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.hero_image_url} alt="Hero" className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: form.hero_image_position || 'center' }} />
                  ) : (
                    <div className="absolute inset-0" style={{ backgroundColor: form.color_primary }} />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,10,20,0.85) 0%, rgba(10,10,20,0.4) 70%)' }} />
                  <div className="absolute inset-0 flex flex-col justify-center px-5">
                    {form.hero_subtitle && (
                      <p className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: form.color_accent }}>
                        {form.hero_subtitle}
                      </p>
                    )}
                    <p className="text-sm font-black text-white leading-tight mb-3 max-w-[180px]">
                      {form.hero_title || 'Título del hero'}
                    </p>
                    <div>
                      <span className="inline-block px-3 py-1.5 text-[9px] font-black text-white"
                        style={{ backgroundColor: form.hero_cta_color || form.color_accent }}>
                        {form.hero_cta_label || 'Ver más'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ColorRow
              label="Color del botón CTA"
              hint="Opcional — dejá vacío para usar el color acento"
              value={form.hero_cta_color}
              onChange={(v) => set('hero_cta_color', v)}
              optional
            />
          </div>
        )}

        {/* ── INICIO ───────────────────────────────────────────────────────── */}
        {section === 'inicio' && (
          <div className="space-y-5">
            <InfoBox>Configurá el contenido del home. Los campos vacíos usan valores por defecto.</InfoBox>

            <Field label="Carrusel animado" hint="Textos que se animan en loop. Uno por línea.">
              <textarea
                value={form.home_marquee_items}
                onChange={(e) => set('home_marquee_items', e.target.value)}
                rows={4}
                placeholder={'VENTA Y ALQUILER DE INMUEBLES\nMÁS DE 20 AÑOS DE EXPERIENCIA\nASESORÍA GRATUITA'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
              />
            </Field>

            {/* Marquee preview */}
            {form.home_marquee_items.trim() && (
              <div className="rounded-xl overflow-hidden border border-slate-100">
                <p className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100">Vista previa</p>
                <div className="px-4 py-3 overflow-hidden" style={{ backgroundColor: form.color_accent }}>
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white whitespace-nowrap">
                    {form.home_marquee_items.split('\n').filter(Boolean).join(' ◆ ')}
                  </p>
                </div>
              </div>
            )}

            <ImageUploadField
              label="Imagen de la sección editorial"
              hint="Aparece en la sección 'Quiénes somos'. Subí un archivo o pegá una URL."
              value={form.home_split_image_url}
              onChange={(v) => set('home_split_image_url', v)}
              storeId={store.id}
              aspect="16/9"
            />
            {form.home_split_image_url && (
              <FocalPointPicker
                imageUrl={form.home_split_image_url}
                value={form.home_split_image_position}
                onChange={(v) => set('home_split_image_position', v)}
                aspect="4/3"
                hint="Click para elegir el punto focal. Si la imagen es vertical o tiene la cara/producto arriba, click en esa zona para que no quede cortado."
              />
            )}

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Etiqueta editorial" hint='Ej: "Colección 2025"'>
                <Input value={form.home_editorial_label} onChange={(v) => set('home_editorial_label', v)} placeholder="Quiénes somos" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Titular editorial">
                  <Input value={form.home_editorial_title} onChange={(v) => set('home_editorial_title', v)} placeholder="Más de 20 años en el mercado" />
                </Field>
              </div>
            </div>
            <Field label="Texto del editorial">
              <textarea
                value={form.home_editorial_body}
                onChange={(e) => set('home_editorial_body', e.target.value)}
                rows={3}
                placeholder="Somos una inmobiliaria familiar con más de 20 años..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
              />
            </Field>
          </div>
        )}

        {/* ── SHIPPING ─────────────────────────────────────────────────────── */}
        {section === 'shipping' && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={`Precio base de envío (${form.currency})`} hint="Costo estándar de envío">
                <Input type="number" value={form.shipping_base_price} onChange={(v) => set('shipping_base_price', v)} placeholder="2500" />
              </Field>
              <Field label={`Umbral envío gratis (${form.currency})`} hint="Monto mínimo. Vacío = desactivado.">
                <Input type="number" value={form.free_shipping_threshold} onChange={(v) => set('free_shipping_threshold', v)} placeholder="Sin umbral" />
              </Field>
            </div>

            {/* Preview */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">¿Cómo verá el cliente?</p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="text-lg">🚚</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Envío estándar</p>
                    <p className="text-xs text-slate-400">
                      {form.shipping_base_price
                        ? `${form.currency} ${Number(form.shipping_base_price).toLocaleString('es-AR')}`
                        : 'Gratis'}
                    </p>
                  </div>
                </div>
                {form.free_shipping_threshold && (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <span className="text-lg">✅</span>
                    <p className="text-sm font-semibold text-emerald-700">
                      Envío gratis en pedidos mayores a {form.currency} {Number(form.free_shipping_threshold).toLocaleString('es-AR')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CONTACT ──────────────────────────────────────────────────────── */}
        {section === 'contact' && (
          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="WhatsApp" hint="Solo números con código de país. Ej: 5491112345678">
                <Input value={form.whatsapp_number} onChange={(v) => set('whatsapp_number', v)} placeholder="5491112345678" />
              </Field>
              <Field label="Email de contacto">
                <Input type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="hola@mitienda.com" />
              </Field>
            </div>
            <Field label="URL de Instagram" hint="URL completa">
              <Input value={form.instagram_url} onChange={(v) => set('instagram_url', v)} placeholder="https://instagram.com/mitienda" />
            </Field>

            {/* Contact preview */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                Vista previa — Cómo aparece en el footer
              </p>
              <div className="grid grid-cols-2 gap-3 p-4">
                {form.whatsapp_number && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-2xl mb-2 block">💬</span>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">WhatsApp</p>
                    <p className="text-sm font-semibold text-slate-700">+{form.whatsapp_number}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Respondemos en minutos</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest" style={{ color: form.color_accent }}>
                      Contactar →
                    </p>
                  </div>
                )}
                {form.email && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-2xl mb-2 block">✉️</span>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">{form.email}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Respondemos en 24hs</p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest" style={{ color: form.color_accent }}>
                      Escribir →
                    </p>
                  </div>
                )}
                {form.instagram_url && (
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <span className="text-2xl mb-2 block">📸</span>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Instagram</p>
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      @{form.instagram_url.replace(/.*instagram\.com\/?/, '').replace(/\/$/, '') || 'cuenta'}
                    </p>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest" style={{ color: form.color_accent }}>
                      Seguir →
                    </p>
                  </div>
                )}
                {!form.whatsapp_number && !form.email && !form.instagram_url && (
                  <p className="col-span-2 text-sm text-slate-400 text-center py-6">Completá los campos para ver la vista previa</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SEO ──────────────────────────────────────────────────────────── */}
        {section === 'seo' && (
          <div className="space-y-5">
            <Field label="Meta título" hint="Aparece en la pestaña del navegador y en Google (50–60 caracteres)">
              <Input value={form.meta_title} onChange={(v) => set('meta_title', v)} placeholder="Mi Tienda — Ropa y accesorios" maxLength={70} />
              <CharCount value={form.meta_title} max={70} warn={60} />
            </Field>
            <Field label="Meta descripción" hint="Descripción en resultados de búsqueda (150–160 caracteres)">
              <textarea
                value={form.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
                placeholder="Descubrí nuestra colección..."
                rows={3}
                maxLength={200}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
              />
              <CharCount value={form.meta_description} max={200} warn={160} />
            </Field>

            {/* Google snippet preview */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 overflow-hidden">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                Vista previa en Google
              </p>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-5 w-5 rounded-full bg-slate-200" />
                  <p className="text-xs text-slate-500">
                    {form.base_url || 'tu-sitio.com'} › inicio
                  </p>
                </div>
                <p className="text-[17px] font-medium text-blue-700 leading-tight mb-1 hover:underline cursor-pointer">
                  {form.meta_title || form.name || 'Título de tu tienda'}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {form.meta_description || 'Agregá una meta descripción para que Google muestre información sobre tu tienda en los resultados de búsqueda.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── AVANZADO ─────────────────────────────────────────────────────── */}
        {section === 'avanzado' && (
          <div className="space-y-6">
            <InfoBox color="amber">Configuración técnica. Cambiar el tipo de sitio altera el template completo.</InfoBox>

            {/* Site type — visual cards */}
            <div>
              <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">Tipo de sitio</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { value: 'ecommerce',        label: 'Ecommerce',       desc: 'Tienda online estándar con carrito',        icon: '🛍️' },
                  { value: 'modo',             label: 'Modo',            desc: 'Moda premium con carrito',                 icon: '👗' },
                  { value: 'athletic',         label: 'Athletic',        desc: 'Deportes y lifestyle con carrito',          icon: '⚡' },
                  { value: 'libreria',         label: 'Librería',        desc: 'Venta de libros con carrito',              icon: '📚' },
                  { value: 'restaurant',       label: 'Restaurant',      desc: 'Menú con pedidos',                         icon: '🍽️' },
                  { value: 'dealership',       label: 'Concesionaria',   desc: 'Catálogo de vehículos sin carrito',        icon: '🚗' },
                  { value: 'real-estate',      label: 'Inmobiliaria',    desc: 'Propiedades en venta y alquiler',          icon: '🏠' },
                  { value: 'services',         label: 'Servicios',       desc: 'Contacto por WhatsApp, sin carrito',       icon: '🤝' },
                  { value: 'landing',          label: 'Landing page',    desc: 'Sin tienda, solo marketing',               icon: '📣' },
                  { value: 'portfolio',        label: 'Portfolio',       desc: 'Galería de trabajos',                      icon: '🎨' },
                  { value: 'vendly-marketing', label: 'Vendly Marketing', desc: 'Solo uso interno',                        icon: '🔒' },
                ].map(({ value, label, desc, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set('site_type', value)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                      form.site_type === value
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${form.site_type === value ? 'text-white' : 'text-slate-900'}`}>{label}</p>
                      <p className={`text-[10px] leading-tight mt-0.5 ${form.site_type === value ? 'text-white/60' : 'text-slate-400'}`}>{desc}</p>
                    </div>
                    {form.site_type === value && <span className="ml-auto text-white text-sm">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="URL base" hint="Ej: https://tu-tienda.com">
                <Input value={form.base_url} onChange={(v) => set('base_url', v)} placeholder="https://..." />
              </Field>
              <Field label="Moneda" hint="ISO 4217. Ej: ARS, USD">
                <Input value={form.currency} onChange={(v) => set('currency', v.toUpperCase())} placeholder="ARS" maxLength={3} />
              </Field>
              <Field label="Locale" hint="Ej: es-AR, en-US">
                <Input value={form.locale} onChange={(v) => set('locale', v)} placeholder="es-AR" maxLength={10} />
              </Field>
            </div>

            {/* Price preview */}
            {form.currency && form.locale && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Formato de precio</p>
                <p className="text-2xl font-black text-slate-900">
                  {(() => {
                    try {
                      return new Intl.NumberFormat(form.locale, { style: 'currency', currency: form.currency, maximumFractionDigits: 0 }).format(12500)
                    } catch { return '⚠ Locale o moneda inválidos' }
                  })()}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── INTEGRACIONES ────────────────────────────────────────────────── */}
        {section === 'integraciones' && (
          <div className="space-y-6">
            <InfoBox color="amber">
              Las credenciales son por store y se almacenan cifradas. Dejá vacío para usar las variables de entorno globales.
            </InfoBox>

            {[
              {
                icon: '💳', title: 'MercadoPago', subtitle: 'Procesar pagos online',
                fields: [
                  { key: 'mp_access_token', label: 'Access Token', hint: 'Clave privada', configured: integStatus?.mp_access_token_configured },
                  { key: 'mp_public_key', label: 'Public Key', hint: 'Clave pública (visible en frontend)', configured: !!(integStatus?.mp_public_key), currentValue: integStatus?.mp_public_key ?? undefined },
                  { key: 'mp_webhook_secret', label: 'Webhook Secret', hint: 'Valida notificaciones entrantes', configured: integStatus?.mp_webhook_secret_configured },
                ],
              },
              {
                icon: '✉️', title: 'Resend', subtitle: 'Envío de emails transaccionales',
                fields: [
                  { key: 'resend_api_key', label: 'API Key', hint: 'Clave de Resend', configured: integStatus?.resend_api_key_configured },
                  { key: 'resend_from_domain', label: 'From Domain', hint: 'Ej: hola@tienda.com', configured: !!(integStatus?.resend_from_domain), currentValue: integStatus?.resend_from_domain ?? undefined },
                ],
              },
              {
                icon: '💬', title: 'WhatsApp API', subtitle: '360dialog — mensajes automatizados',
                fields: [
                  { key: 'wa_api_key', label: 'API Key', hint: 'Clave de 360dialog', configured: integStatus?.wa_api_key_configured },
                  { key: 'wa_from_number', label: 'From Number', hint: 'Número Business con código de país', configured: !!(integStatus?.wa_from_number), currentValue: integStatus?.wa_from_number ?? undefined },
                ],
              },
            ].map(({ icon, title, subtitle, fields }) => (
              <div key={title} className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{title}</p>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    {fields.every(f => f.configured)
                      ? <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold"><span>✓</span> Configurado</span>
                      : <span className="text-xs text-slate-400">Sin configurar</span>
                    }
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {fields.map(({ key, label, hint, configured, currentValue }) => (
                    <IntegField
                      key={key}
                      label={label}
                      hint={hint}
                      fieldKey={key}
                      configured={configured}
                      currentValue={currentValue}
                      value={integForm[key as keyof typeof integForm]}
                      onChange={(v) => setInteg(key, v)}
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4">
              <button onClick={handleSaveInteg} disabled={integSaving}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-colors disabled:opacity-50">
                {integSaving ? 'Guardando...' : 'Guardar credenciales'}
              </button>
              {integSaved && <span className="text-sm text-emerald-600 font-semibold">✓ Guardado</span>}
              {integError && <span className="text-sm text-red-600">{integError}</span>}
            </div>
          </div>
        )}

        {/* ── Save bar ─────────────────────────────────────────────────────── */}
        {section !== 'integraciones' && (
          <div className="mt-8 flex items-center gap-4 border-t border-slate-100 pt-6">
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-700 transition-colors disabled:opacity-50">
              {saving ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : 'Guardar cambios'}
            </button>
            {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold"><span>✓</span> Cambios guardados</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}{required && <span className="ml-1 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', maxLength }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; maxLength?: number
}) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 placeholder:text-slate-300 transition-colors"
    />
  )
}

function ColorRow({ label, hint, value, onChange, optional }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; optional?: boolean
}) {
  const hasValue = value && value.startsWith('#')
  const displayValue = hasValue ? value : '#ffffff'

  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-3 hover:border-slate-200 transition-colors">
      {/* Color swatch */}
      <div className="relative shrink-0">
        <input type="color" value={displayValue} onChange={(e) => onChange(e.target.value)}
          className="h-12 w-12 cursor-pointer rounded-xl border-2 border-slate-200 p-0.5" />
        {optional && hasValue && (
          <button type="button" onClick={() => onChange('')}
            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white text-[9px] hover:bg-slate-600">
            ✕
          </button>
        )}
      </div>
      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
      </div>
      {/* Hex input */}
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        className="w-28 shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-slate-400 text-center"
        placeholder={optional ? 'vacío' : '#000000'} maxLength={7}
      />
    </div>
  )
}

function CharCount({ value, max, warn }: { value: string; max: number; warn: number }) {
  const len = value.length
  const color = len > warn ? (len > max ? 'text-red-500' : 'text-amber-500') : 'text-slate-400'
  return <p className={`mt-1 text-xs text-right ${color}`}>{len}/{max}</p>
}

function InfoBox({ children, color = 'slate' }: { children: React.ReactNode; color?: 'slate' | 'amber' | 'blue' }) {
  const cls = {
    slate: 'bg-slate-50 border-slate-200 text-slate-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    blue:  'bg-blue-50 border-blue-100 text-blue-700',
  }[color]
  return <div className={`rounded-xl border p-4 text-xs leading-relaxed ${cls}`}>{children}</div>
}

function ImageUploadField({ label, hint, value, onChange, storeId, aspect }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void
  storeId: string; aspect?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${storeId}/config/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {hint && <p className="mb-2 text-xs text-slate-400">{hint}</p>}

      {/* Preview */}
      {value && (
        <div className="mb-3 relative group inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt={label}
            className="rounded-xl border border-slate-200 object-contain bg-slate-50"
            style={{ maxHeight: '120px', maxWidth: '100%', aspectRatio: aspect }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-white text-[10px] hover:bg-red-500 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload + URL row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... o subí un archivo →"
          className="flex-1 min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 placeholder:text-slate-300"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="shrink-0 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          )}
          {uploading ? 'Subiendo...' : 'Subir'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
    </div>
  )
}

function IntegField({ label, hint, configured, currentValue, value, onChange }: {
  label: string; hint?: string; fieldKey: string; configured?: boolean;
  currentValue?: string; value: string; onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        {configured
          ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ configurada</span>
          : <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">env var global</span>}
      </div>
      {currentValue && (
        <p className="mb-1.5 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 truncate">
          {currentValue}
        </p>
      )}
      <input
        type="password" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={configured ? '••••••••• (vacío = mantener actual)' : 'Nueva clave...'}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200 placeholder:text-slate-300"
        autoComplete="new-password"
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
