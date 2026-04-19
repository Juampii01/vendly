'use client'

import { useState, useRef } from 'react'
import type { SiteGenInput } from '@/app/api/admin/ai/generate-site/route'

// ─── Opciones de selects ──────────────────────────────────────────────────────

const TIPO_PROYECTO = [
  'Tienda de ropa y moda',
  'Tienda de accesorios',
  'Tienda de calzado',
  'Tienda de productos para el hogar',
  'Tienda de belleza y cosmética',
  'Tienda de deportes y fitness',
  'Tienda de electrónica',
  'Tienda de alimentos y bebidas',
  'Tienda de joyería',
  'Tienda de juguetes',
  'Tienda de libros y papelería',
  'Tienda de mascotas',
  'Otro (especificar en descripción)',
]

const TONO = [
  { value: 'profesional y confiable', label: 'Profesional y confiable' },
  { value: 'cercano y casual', label: 'Cercano y casual' },
  { value: 'premium y exclusivo', label: 'Premium y exclusivo' },
  { value: 'juvenil y dinámico', label: 'Juvenil y dinámico' },
  { value: 'minimalista y elegante', label: 'Minimalista y elegante' },
  { value: 'divertido y creativo', label: 'Divertido y creativo' },
  { value: 'directo y sin rodeos', label: 'Directo y sin rodeos' },
]

const PRECIO = [
  { value: 'económico / accesible', label: 'Económico / accesible' },
  { value: 'precio medio', label: 'Precio medio' },
  { value: 'premium / alto', label: 'Premium / alto' },
  { value: 'lujo / exclusivo', label: 'Lujo / exclusivo' },
]

const OBJETIVO = [
  'Generar ventas directas online',
  'Conseguir consultas y contactos',
  'Construir marca y comunidad',
  'Captación de leads / registros',
  'Venta de suscripciones',
]

const PAIS = [
  'Argentina', 'México', 'Colombia', 'Chile', 'Perú', 'Uruguay',
  'Brasil', 'España', 'LATAM (toda la región)', 'Global',
]

// ─── Componente principal ─────────────────────────────────────────────────────

const EMPTY: SiteGenInput = {
  tipo_proyecto: '',
  nombre: '',
  descripcion: '',
  producto: '',
  cliente_ideal: '',
  objetivo: '',
  tono: '',
  nivel_precio: '',
  pais: '',
}

export default function SiteGenerator() {
  const [form, setForm] = useState<SiteGenInput>(EMPTY)
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof SiteGenInput>(key: K, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  const isComplete = Object.values(form).every(v => v.trim().length > 0)

  async function handleGenerate() {
    setError(null)
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/ai/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Error al generar.')
        return
      }

      // Leer el stream y actualizar el output en tiempo real
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setOutput(prev => {
          const next = prev + text
          // Auto-scroll al final
          setTimeout(() => {
            outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' })
          }, 10)
          return next
        })
      }
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleReset() {
    setForm(EMPTY)
    setOutput('')
    setError(null)
  }

  return (
    <div className="space-y-8">
      {/* ── Formulario ── */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-5">
          Datos del negocio
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Tipo */}
          <Field label="Tipo de tienda *">
            <select value={form.tipo_proyecto} onChange={e => set('tipo_proyecto', e.target.value)} className={inputCls}>
              <option value="">Seleccioná...</option>
              {TIPO_PROYECTO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>

          {/* Nombre */}
          <Field label="Nombre del negocio *">
            <input
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              placeholder="Ej: Ona Studio, Casa Flores, etc."
              className={inputCls}
            />
          </Field>

          {/* Descripción */}
          <Field label="Descripción del negocio *" className="sm:col-span-2">
            <textarea
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={2}
              placeholder="Qué hace tu negocio, cómo es diferente, qué lo hace especial..."
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Producto */}
          <Field label="Producto / servicio principal *" className="sm:col-span-2">
            <input
              value={form.producto}
              onChange={e => set('producto', e.target.value)}
              placeholder="Ej: Ropa de mujer de diseño independiente, Accesorios de cuero artesanales..."
              className={inputCls}
            />
          </Field>

          {/* Cliente ideal */}
          <Field label="Cliente ideal *">
            <input
              value={form.cliente_ideal}
              onChange={e => set('cliente_ideal', e.target.value)}
              placeholder="Ej: Mujeres 25-40 años que buscan estilo propio"
              className={inputCls}
            />
          </Field>

          {/* Objetivo */}
          <Field label="Objetivo del sitio *">
            <select value={form.objetivo} onChange={e => set('objetivo', e.target.value)} className={inputCls}>
              <option value="">Seleccioná...</option>
              {OBJETIVO.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </Field>

          {/* Tono */}
          <Field label="Tono de marca *">
            <select value={form.tono} onChange={e => set('tono', e.target.value)} className={inputCls}>
              <option value="">Seleccioná...</option>
              {TONO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>

          {/* Precio */}
          <Field label="Nivel de precio *">
            <select value={form.nivel_precio} onChange={e => set('nivel_precio', e.target.value)} className={inputCls}>
              <option value="">Seleccioná...</option>
              {PRECIO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </Field>

          {/* País */}
          <Field label="País / mercado *">
            <select value={form.pais} onChange={e => set('pais', e.target.value)} className={inputCls}>
              <option value="">Seleccioná...</option>
              {PAIS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!isComplete || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#0f172a', color: '#fff' }}
          >
            {loading ? (
              <>
                <Spinner />
                Generando sitio...
              </>
            ) : (
              <>
                <SparkleIcon />
                Generar sitio completo
              </>
            )}
          </button>

          {output && (
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-400 transition-colors"
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* ── Output ── */}
      {(output || loading) && (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-800">Resultado</span>
              {loading && (
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                  generando...
                </span>
              )}
            </div>
            {output && !loading && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 transition-colors"
              >
                {copied ? '✓ Copiado' : 'Copiar todo'}
              </button>
            )}
          </div>

          <div
            ref={outputRef}
            className="p-6 max-h-[600px] overflow-y-auto"
          >
            <MarkdownOutput content={output} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Markdown renderer simple ─────────────────────────────────────────────────
// Sin dependencias externas — renderiza lo suficiente para este caso de uso.

function MarkdownOutput({ content }: { content: string }) {
  const lines = content.split('\n')

  return (
    <div className="space-y-1 text-sm text-slate-700 leading-relaxed font-mono whitespace-pre-wrap">
      {lines.map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-xl font-black text-slate-900 mt-6 mb-2 font-sans">{line.slice(2)}</h1>
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-base font-bold text-slate-800 mt-5 mb-2 border-b border-slate-100 pb-1 font-sans">{line.slice(3)}</h2>
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-sm font-bold text-slate-700 mt-4 mb-1 font-sans">{line.slice(4)}</h3>
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <p key={i} className="pl-3 text-slate-600">• {line.slice(2)}</p>
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-slate-800 font-sans">{line.slice(2, -2)}</p>
        }
        if (line.startsWith('---')) {
          return <hr key={i} className="border-slate-100 my-3" />
        }
        if (line.trim() === '') {
          return <div key={i} className="h-1" />
        }
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.88 5.76L20 10l-6.12 1.24L12 17l-1.88-5.76L4 10l6.12-1.24z"/>
      <path d="M19 3l.8 2.4L22 6l-2.2.6L19 9l-.8-2.4L16 6l2.2-.6z"/>
    </svg>
  )
}

const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400'
