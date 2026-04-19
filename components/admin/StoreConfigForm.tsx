'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { StoreConfig } from '@/types'

interface Props {
  store: StoreConfig
}

type Section = 'general' | 'colors' | 'hero' | 'inicio' | 'shipping' | 'contact' | 'seo' | 'avanzado' | 'integraciones'

// ─── Integraciones — estado de configuración ──────────────────────────────────

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
    free_shipping_threshold: store.free_shipping_threshold?.toString() ?? '',
    shipping_base_price: store.shipping_base_price.toString(),
    whatsapp_number: store.whatsapp_number ?? '',
    email: store.email ?? '',
    instagram_url: store.instagram_url ?? '',
    meta_title: store.meta_title ?? '',
    meta_description: store.meta_description ?? '',
    // Home page
    home_marquee_items: (store.home_marquee_items ?? []).join('\n'),
    home_split_image_url: store.home_split_image_url ?? '',
    home_editorial_label: store.home_editorial_label ?? '',
    home_editorial_title: store.home_editorial_title ?? '',
    home_editorial_body: store.home_editorial_body ?? '',
    // Hero extras
    hero_cta_color: store.hero_cta_color ?? '',
    // Avanzado
    site_type: store.site_type ?? 'ecommerce',
    base_url: store.base_url ?? '',
    currency: store.currency ?? 'ARS',
    locale: store.locale ?? 'es-AR',
  })

  // Estado del formulario de integraciones (credenciales sensibles)
  const [integForm, setIntegForm] = useState({
    mp_access_token: '',
    mp_public_key: '',
    mp_webhook_secret: '',
    resend_api_key: '',
    resend_from_domain: '',
    wa_api_key: '',
    wa_from_number: '',
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

  // Cargar estado de integraciones al entrar en esa sección
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
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = { ...form }
      // Coerce numeric fields
      payload.free_shipping_threshold = form.free_shipping_threshold === ''
        ? null
        : Number(form.free_shipping_threshold)
      payload.shipping_base_price = Number(form.shipping_base_price)
      // Empty strings → null for nullable fields
      for (const k of [
        'logo_url', 'hero_subtitle', 'hero_image_url', 'hero_cta_color',
        'whatsapp_number', 'email', 'instagram_url',
        'meta_title', 'meta_description',
        'home_split_image_url', 'home_editorial_label',
        'home_editorial_title', 'home_editorial_body',
        'base_url',
      ]) {
        if (payload[k] === '') payload[k] = null
      }
      // Marquee items: textarea separada por líneas → array de strings
      payload.home_marquee_items = form.home_marquee_items
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const res = await fetch('/api/admin/store-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      router.refresh() // Refresca Server Components para mostrar datos actualizados
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveInteg() {
    setIntegSaving(true)
    setIntegError(null)
    try {
      // Solo enviamos los campos que el usuario escribió (no vacíos)
      const payload: Record<string, string | null> = {}
      for (const [k, v] of Object.entries(integForm)) {
        if (v !== '') payload[k] = v
      }
      if (Object.keys(payload).length === 0) {
        setIntegError('No hay cambios para guardar.')
        return
      }
      const res = await fetch('/api/admin/tenant-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al guardar')
      }
      // Refrescar estado
      const status = await fetch('/api/admin/tenant-config').then((r) => r.json())
      setIntegStatus(status.data)
      setIntegForm({ mp_access_token: '', mp_public_key: '', mp_webhook_secret: '', resend_api_key: '', resend_from_domain: '', wa_api_key: '', wa_from_number: '' })
      setIntegSaved(true)
      setTimeout(() => setIntegSaved(false), 3000)
    } catch (e) {
      setIntegError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIntegSaving(false)
    }
  }

  const SECTIONS: { id: Section; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'colors', label: 'Colores' },
    { id: 'hero', label: 'Hero' },
    { id: 'inicio', label: 'Inicio' },
    { id: 'shipping', label: 'Envío' },
    { id: 'contact', label: 'Contacto' },
    { id: 'seo', label: 'SEO' },
    { id: 'avanzado', label: 'Avanzado' },
    { id: 'integraciones', label: 'Integraciones' },
  ]

  return (
    <div className="max-w-2xl">
      {/* Section tabs */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              section === s.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {section === 'general' && (
        <div className="space-y-5">
          <Field label="Nombre de la tienda" required>
            <Input value={form.name} onChange={(v) => set('name', v)} placeholder="Mi Tienda" />
          </Field>
          <Field label="URL del logo" hint="Dejá vacío para mostrar el nombre en texto">
            <Input value={form.logo_url} onChange={(v) => set('logo_url', v)} placeholder="https://..." />
          </Field>
          {form.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.logo_url} alt="Logo preview" className="h-10 object-contain rounded border border-slate-200 p-1" />
          )}
        </div>
      )}

      {/* ── Colors ── */}
      {section === 'colors' && (
        <div className="space-y-5">
          <p className="text-sm text-slate-500 mb-2">
            Usá valores hexadecimales como <code className="bg-slate-100 px-1 rounded">#1c1c1c</code>.
          </p>
          <ColorRow
            label="Color principal" hint="Fondo de botones, elementos de marca"
            value={form.color_primary} onChange={(v) => set('color_primary', v)}
          />
          <ColorRow
            label="Color secundario" hint="Elementos secundarios"
            value={form.color_secondary} onChange={(v) => set('color_secondary', v)}
          />
          <ColorRow
            label="Color acento" hint="Badges, alertas, highlights"
            value={form.color_accent} onChange={(v) => set('color_accent', v)}
          />
          <ColorRow
            label="Color de fondo" hint="Fondo general de la tienda"
            value={form.color_background} onChange={(v) => set('color_background', v)}
          />
          <ColorRow
            label="Color de texto" hint="Texto principal"
            value={form.color_text} onChange={(v) => set('color_text', v)}
          />

          {/* Preview */}
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
            <div className="p-4 text-sm font-semibold text-slate-500 bg-slate-50 border-b border-slate-200">
              Vista previa
            </div>
            <div className="p-6 flex gap-3 items-center" style={{ backgroundColor: form.color_background }}>
              <span className="text-base font-bold" style={{ color: form.color_text }}>
                Texto de ejemplo
              </span>
              <button className="px-4 py-2 text-xs font-bold uppercase"
                style={{ backgroundColor: form.color_primary, color: form.color_background }}>
                Botón
              </button>
              <span className="px-2 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: form.color_accent }}>
                -20%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      {section === 'hero' && (
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">Título del hero <span className="text-red-400">*</span></label>
              <button
                type="button"
                disabled={aiHeroLoading !== null}
                onClick={() => generateHeroCopy('hero_title')}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-40"
              >
                ✦ {aiHeroLoading === 'title' ? 'Generando...' : 'IA'}
              </button>
            </div>
            <Input value={form.hero_title} onChange={(v) => set('hero_title', v)} placeholder="Nueva colección" />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500">Subtítulo <span className="text-slate-400 font-normal">— texto debajo del título</span></label>
              <button
                type="button"
                disabled={aiHeroLoading !== null}
                onClick={() => generateHeroCopy('hero_subtitle')}
                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs border border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-400 transition-colors disabled:opacity-40"
              >
                ✦ {aiHeroLoading === 'subtitle' ? 'Generando...' : 'IA'}
              </button>
            </div>
            <Input value={form.hero_subtitle} onChange={(v) => set('hero_subtitle', v)} placeholder="Disponible ahora" />
            {aiHeroError && <p className="mt-1 text-xs text-red-500">{aiHeroError}</p>}
          </div>
          <Field label="Texto del botón CTA" required>
            <Input value={form.hero_cta_label} onChange={(v) => set('hero_cta_label', v)} placeholder="Ver colección" />
          </Field>
          <Field label="URL del botón CTA" required>
            <Input value={form.hero_cta_url} onChange={(v) => set('hero_cta_url', v)} placeholder="/productos" />
          </Field>
          <ColorRow
            label="Color del botón CTA"
            hint="Dejá vacío para usar el color acento. Solo si querés un color diferente."
            value={form.hero_cta_color}
            onChange={(v) => set('hero_cta_color', v)}
            optional
          />
          <Field label="Imagen de fondo del hero" hint="URL de imagen de alta resolución (1440×900 mínimo)">
            <Input value={form.hero_image_url} onChange={(v) => set('hero_image_url', v)} placeholder="https://..." />
          </Field>
          {form.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.hero_image_url}
              alt="Hero preview"
              className="w-full aspect-[16/7] object-cover rounded-xl border border-slate-200"
            />
          )}
        </div>
      )}

      {/* ── Inicio ── */}
      {section === 'inicio' && (
        <div className="space-y-5">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-500">
            Configurá el contenido de las secciones del home: ticker, editorial y más.
            Los campos vacíos usan valores por defecto.
          </div>

          <Field label="Textos del ticker / marquee" hint="Uno por línea. Si está vacío se generan automáticamente desde los datos de la tienda.">
            <textarea
              value={form.home_marquee_items}
              onChange={(e) => set('home_marquee_items', e.target.value)}
              rows={5}
              placeholder={'NUEVA COLECCIÓN\nENVÍO GRATIS\nPIEZAS ÚNICAS'}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-mono outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
            />
          </Field>

          <Field label="Imagen de la sección editorial" hint="URL de imagen. Reemplaza la imagen por defecto del split editorial.">
            <Input
              value={form.home_split_image_url}
              onChange={(v) => set('home_split_image_url', v)}
              placeholder="https://..."
            />
          </Field>
          {form.home_split_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.home_split_image_url}
              alt="Editorial preview"
              className="w-full aspect-[4/3] object-cover rounded-xl border border-slate-200"
            />
          )}

          <Field label="Etiqueta de temporada" hint='Texto pequeño sobre el titular (ej: "Colección Otoño 2025")'>
            <Input
              value={form.home_editorial_label}
              onChange={(v) => set('home_editorial_label', v)}
              placeholder="Colección Otoño 2025"
            />
          </Field>

          <Field label="Titular del editorial" hint="Headline principal de la sección editorial.">
            <Input
              value={form.home_editorial_title}
              onChange={(v) => set('home_editorial_title', v)}
              placeholder="Menos ruido. Más estilo."
            />
          </Field>

          <Field label="Texto del editorial" hint="Párrafo descriptivo de la sección editorial.">
            <textarea
              value={form.home_editorial_body}
              onChange={(e) => set('home_editorial_body', e.target.value)}
              rows={3}
              placeholder="Piezas pensadas para durar..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
            />
          </Field>
        </div>
      )}

      {/* ── Shipping ── */}
      {section === 'shipping' && (
        <div className="space-y-5">
          <Field label={`Precio base de envío (${form.currency})`} hint="Costo de envío estándar">
            <Input
              type="number"
              value={form.shipping_base_price}
              onChange={(v) => set('shipping_base_price', v)}
              placeholder="2500"
            />
          </Field>
          <Field
            label={`Umbral de envío gratis (${form.currency})`}
            hint="Monto mínimo para envío gratis. Dejá vacío para desactivar."
          >
            <Input
              type="number"
              value={form.free_shipping_threshold}
              onChange={(v) => set('free_shipping_threshold', v)}
              placeholder="Sin umbral"
            />
          </Field>
        </div>
      )}

      {/* ── Contact ── */}
      {section === 'contact' && (
        <div className="space-y-5">
          <Field label="Número de WhatsApp" hint="Solo números, con código de país. Ej: 5491112345678">
            <Input value={form.whatsapp_number} onChange={(v) => set('whatsapp_number', v)} placeholder="5491112345678" />
          </Field>
          <Field label="Email de contacto">
            <Input type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="hola@mitienda.com" />
          </Field>
          <Field label="URL de Instagram" hint="URL completa de tu perfil">
            <Input value={form.instagram_url} onChange={(v) => set('instagram_url', v)} placeholder="https://instagram.com/mitienda" />
          </Field>
        </div>
      )}

      {/* ── SEO ── */}
      {section === 'seo' && (
        <div className="space-y-5">
          <Field label="Meta título" hint="Título que aparece en Google (50–60 caracteres ideal)">
            <Input
              value={form.meta_title}
              onChange={(v) => set('meta_title', v)}
              placeholder="Mi Tienda — Ropa y accesorios"
              maxLength={70}
            />
            <p className="mt-1 text-xs text-slate-400">{form.meta_title.length}/70 caracteres</p>
          </Field>
          <Field label="Meta descripción" hint="Descripción para buscadores (150–160 caracteres ideal)">
            <textarea
              value={form.meta_description}
              onChange={(e) => set('meta_description', e.target.value)}
              placeholder="Descubrí nuestra colección de ropa y accesorios..."
              rows={3}
              maxLength={200}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">{form.meta_description.length}/200 caracteres</p>
          </Field>
        </div>
      )}

      {/* ── Avanzado ── */}
      {section === 'avanzado' && (
        <div className="space-y-5">
          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
            Configuración técnica para multi-tenant y monitoreo.
          </div>

          {/* Tipo de sitio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tipo de sitio <span className="ml-1 text-red-500">*</span>
            </label>
            <select
              value={form.site_type}
              onChange={(e) => set('site_type', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
            >
              <optgroup label="Tiendas con carrito">
                <option value="ecommerce">Ecommerce — tienda online estándar</option>
                <option value="modo">Modo — moda premium con carrito</option>
                <option value="athletic">Athletic — deportes y lifestyle con carrito</option>
                <option value="restaurant">Restaurant — menú con carrito de pedidos</option>
                <option value="libreria">Librería — venta de libros</option>
              </optgroup>
              <optgroup label="Sin carrito / contacto por WhatsApp">
                <option value="dealership">Concesionaria — catálogo de vehículos</option>
                <option value="services">Servicios — contacto por WhatsApp</option>
              </optgroup>
              <optgroup label="Sin ecommerce">
                <option value="landing">Landing page — sin tienda</option>
                <option value="portfolio">Portfolio — sin tienda</option>
              </optgroup>
              <optgroup label="Interno">
                <option value="vendly-marketing">Vendly Marketing (solo uso interno)</option>
              </optgroup>
            </select>
            <p className="mt-1.5 text-xs text-amber-600">
              ⚠ Cambiar el tipo de sitio altera qué template y funcionalidades se usan (carrito, checkout, catálogo). Guardá y recargá la tienda para ver el efecto.
            </p>
          </div>

          <Field
            label="URL base pública"
            hint="URL completa de esta tienda. Necesaria para el monitor de uptime. Ej: https://ona.vendly.com"
          >
            <Input
              value={form.base_url}
              onChange={(v) => set('base_url', v)}
              placeholder="https://tu-tienda.com"
            />
          </Field>

          <Field
            label="Moneda"
            hint="Código ISO 4217. Ej: ARS, USD, EUR, CLP, MXN"
          >
            <Input
              value={form.currency}
              onChange={(v) => set('currency', v.toUpperCase())}
              placeholder="ARS"
              maxLength={3}
            />
          </Field>

          <Field
            label="Locale"
            hint="Formato BCP 47 para números y fechas. Ej: es-AR, es-MX, en-US, pt-BR"
          >
            <Input
              value={form.locale}
              onChange={(v) => set('locale', v)}
              placeholder="es-AR"
              maxLength={10}
            />
          </Field>

          {/* Preview del formato de precio */}
          {form.currency && form.locale && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <p className="text-xs text-slate-500 mb-1">Vista previa del precio:</p>
              <p className="text-lg font-bold text-slate-800">
                {(() => {
                  try {
                    return new Intl.NumberFormat(form.locale, {
                      style: 'currency',
                      currency: form.currency,
                      maximumFractionDigits: 0,
                    }).format(12500)
                  } catch {
                    return '⚠ Locale o moneda inválidos'
                  }
                })()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Integraciones ── */}
      {section === 'integraciones' && (
        <div className="space-y-6">
          <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
            <strong>Credenciales por store.</strong> Dejá en blanco para usar las variables de entorno globales del servidor.
            Los campos con ✓ ya tienen una clave configurada. Los campos sensibles nunca se muestran en texto plano.
          </div>

          {/* MercadoPago */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="text-base">💳</span> MercadoPago
            </h3>
            <div className="space-y-3">
              <IntegField
                label="Access Token"
                hint="Clave privada de tu cuenta MP"
                fieldKey="mp_access_token"
                configured={integStatus?.mp_access_token_configured}
                value={integForm.mp_access_token}
                onChange={(v) => setInteg('mp_access_token', v)}
              />
              <IntegField
                label="Public Key"
                hint="Clave pública (se expone en el frontend)"
                fieldKey="mp_public_key"
                configured={!!(integStatus?.mp_public_key)}
                currentValue={integStatus?.mp_public_key ?? undefined}
                value={integForm.mp_public_key}
                onChange={(v) => setInteg('mp_public_key', v)}
              />
              <IntegField
                label="Webhook Secret"
                hint="Para validar firma de notificaciones"
                fieldKey="mp_webhook_secret"
                configured={integStatus?.mp_webhook_secret_configured}
                value={integForm.mp_webhook_secret}
                onChange={(v) => setInteg('mp_webhook_secret', v)}
              />
            </div>
          </div>

          {/* Resend */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="text-base">✉️</span> Resend (email)
            </h3>
            <div className="space-y-3">
              <IntegField
                label="API Key"
                hint="Clave de API de Resend"
                fieldKey="resend_api_key"
                configured={integStatus?.resend_api_key_configured}
                value={integForm.resend_api_key}
                onChange={(v) => setInteg('resend_api_key', v)}
              />
              <IntegField
                label="From Domain"
                hint='Remitente de los emails. Ej: "Mi Tienda <hola@tienda.com>"'
                fieldKey="resend_from_domain"
                configured={!!(integStatus?.resend_from_domain)}
                currentValue={integStatus?.resend_from_domain ?? undefined}
                value={integForm.resend_from_domain}
                onChange={(v) => setInteg('resend_from_domain', v)}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="text-base">💬</span> WhatsApp 360dialog
            </h3>
            <div className="space-y-3">
              <IntegField
                label="API Key"
                hint="Clave de API de 360dialog"
                fieldKey="wa_api_key"
                configured={integStatus?.wa_api_key_configured}
                value={integForm.wa_api_key}
                onChange={(v) => setInteg('wa_api_key', v)}
              />
              <IntegField
                label="From Number"
                hint="Número de WhatsApp Business con código de país"
                fieldKey="wa_from_number"
                configured={!!(integStatus?.wa_from_number)}
                currentValue={integStatus?.wa_from_number ?? undefined}
                value={integForm.wa_from_number}
                onChange={(v) => setInteg('wa_from_number', v)}
              />
            </div>
          </div>

          {/* Save bar integraciones */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSaveInteg}
              disabled={integSaving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {integSaving ? 'Guardando...' : 'Guardar credenciales'}
            </button>
            {integSaved && <span className="text-sm text-green-600 font-medium">✓ Credenciales guardadas</span>}
            {integError && <span className="text-sm text-red-600">{integError}</span>}
          </div>
          <p className="text-xs text-slate-400">
            Las credenciales se almacenan cifradas y nunca se exponen en el frontend.
          </p>
        </div>
      )}

      {/* Save bar (no se muestra en integraciones que tiene el suyo) */}
      {section !== 'integraciones' && (
        <>
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Cambios guardados</span>
            )}
            {error && (
              <span className="text-sm text-red-600">{error}</span>
            )}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Los cambios se reflejan en la tienda al recargar la página.
          </p>
        </>
      )}
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label, hint, required, children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  maxLength?: number
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
    />
  )
}

function ColorRow({
  label, hint, value, onChange, optional,
}: {
  label: string
  hint?: string
  value: string
  onChange: (v: string) => void
  optional?: boolean
}) {
  // For optional color fields: show a "clear" button when a color is set
  const hasValue = value && value.startsWith('#')
  const displayValue = hasValue ? value : '#ffffff'

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-slate-200 p-0.5"
        />
        {optional && hasValue && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-white text-[9px] hover:bg-slate-600"
            title="Restaurar valor por defecto"
          >
            ✕
          </button>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono outline-none focus:border-slate-400"
        placeholder={optional ? 'Vacío = acento' : '#000000'}
        maxLength={7}
      />
    </div>
  )
}

function IntegField({
  label,
  hint,
  configured,
  currentValue,
  value,
  onChange,
}: {
  label: string
  hint?: string
  fieldKey: string
  configured?: boolean
  currentValue?: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {configured
          ? <span className="text-xs text-green-600 font-medium">✓ configurada</span>
          : <span className="text-xs text-slate-400">usando env var global</span>}
      </div>
      {currentValue && (
        <p className="mb-1 text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 truncate">
          {currentValue}
        </p>
      )}
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={configured ? '••••••••• (dejar vacío para mantener)' : 'Nueva clave...'}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-400"
        autoComplete="new-password"
      />
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
