'use client'

import { useState, useRef } from 'react'
import type { StoreConfig } from '@/types'

interface Props {
  store: StoreConfig
}

const TASKS = [
  {
    id: 'hero',
    icon: '🎯',
    label: 'Hero de la home',
    description: 'Título, subtítulo y CTA impactantes',
    prompt: (s: StoreConfig) =>
      `Reescribí el hero de la tienda "${s.name}" (${s.hero_title}). Generá un título potente (máx 8 palabras), un subtítulo que explique el valor (máx 15 palabras) y 2 opciones de CTA. Tono actual: ${s.color_primary ? 'brand color ' + s.color_primary : 'neutro'}.`,
  },
  {
    id: 'about',
    icon: '✍️',
    label: 'Sección "Quiénes somos"',
    description: 'Texto de presentación de la marca',
    prompt: (s: StoreConfig) =>
      `Escribí un texto de "Quiénes somos" para "${s.name}". Debe ser auténtico, cercano y no genérico. Máximo 3 párrafos cortos. Enfocado en el valor que le da al cliente, no en la empresa.`,
  },
  {
    id: 'marquee',
    icon: '📢',
    label: 'Textos del ticker',
    description: '8-10 mensajes para el banner animado',
    prompt: (s: StoreConfig) =>
      `Generá 10 textos cortos (máx 6 palabras cada uno) para el ticker/marquee de "${s.name}". Mezcla propuestas de valor, urgencia, beneficios y diferenciadores. Sin emojis.`,
  },
  {
    id: 'instagram',
    icon: '📱',
    label: 'Captions para Instagram',
    description: '5 posts para redes sociales',
    prompt: (s: StoreConfig) =>
      `Escribí 5 captions para Instagram de "${s.name}". Variá el formato: storytelling, producto, comunidad, urgencia y aspiracional. Incluí hashtags relevantes al final de cada uno. Tono: auténtico y directo.`,
  },
  {
    id: 'email',
    icon: '✉️',
    label: 'Email de bienvenida',
    description: 'Para nuevos suscriptores o clientes',
    prompt: (s: StoreConfig) =>
      `Escribí un email de bienvenida para nuevos clientes de "${s.name}". Asunto + cuerpo del email. Debe generar confianza, presentar la propuesta de valor y terminar con un CTA claro. Máximo 200 palabras en el cuerpo.`,
  },
  {
    id: 'faq',
    icon: '❓',
    label: 'FAQs de la tienda',
    description: '6-8 preguntas y respuestas frecuentes',
    prompt: (s: StoreConfig) =>
      `Generá 8 preguntas frecuentes (FAQ) para la tienda "${s.name}". Cubrí: envíos, devoluciones, pagos, tallas/medidas, atención al cliente, autenticidad del producto. Respuestas directas y confiables.`,
  },
  {
    id: 'seo',
    icon: '🔍',
    label: 'Meta tags SEO',
    description: 'Title y description optimizados',
    prompt: (s: StoreConfig) =>
      `Escribí 3 opciones de meta title (máx 60 chars) y meta description (máx 155 chars) para la tienda "${s.name}". Optimizadas para SEO y conversión. Incluí la marca y la propuesta de valor principal.`,
  },
  {
    id: 'custom',
    icon: '💬',
    label: 'Solicitud libre',
    description: 'Escribí exactamente lo que necesitás',
    prompt: () => '',
  },
]

export default function ContentAssistant({ store }: Props) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLDivElement>(null)

  const task = TASKS.find(t => t.id === selectedTask)

  async function handleGenerate() {
    if (!task) return
    const prompt = task.id === 'custom' ? customPrompt : task.prompt(store)
    if (!prompt.trim()) return

    setError(null)
    setOutput('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, storeName: store.name }),
      })

      if (!res.ok) {
        const json = await res.json()
        setError(json.error ?? 'Error al generar.')
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setOutput(prev => {
          const next = prev + text
          setTimeout(() => outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' }), 10)
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

  return (
    <div className="space-y-6">
      {/* ── Selector de tarea ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TASKS.map(t => (
          <button
            key={t.id}
            onClick={() => { setSelectedTask(t.id); setOutput(''); setError(null) }}
            className={`rounded-2xl border p-4 text-left transition-all ${
              selectedTask === t.id
                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-400 text-slate-700'
            }`}
          >
            <span className="text-xl block mb-2">{t.icon}</span>
            <p className="text-xs font-semibold leading-tight">{t.label}</p>
            <p className={`text-[10px] mt-0.5 leading-tight ${selectedTask === t.id ? 'text-slate-300' : 'text-slate-400'}`}>
              {t.description}
            </p>
          </button>
        ))}
      </div>

      {/* ── Panel de generación ── */}
      {selectedTask && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">{task?.icon} {task?.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">Para: <span className="font-medium">{store.name}</span></p>
            </div>
          </div>

          {/* Prompt libre */}
          {selectedTask === 'custom' && (
            <textarea
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Ej: Escribí una descripción de colección de verano para ropa de mujer, tono sofisticado, 3 párrafos..."
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 resize-none"
            />
          )}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || (selectedTask === 'custom' && !customPrompt.trim())}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-900 text-white hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (<><Spinner /> Generando...</>) : (<>✦ Generar</>)}
          </button>
        </div>
      )}

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
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            )}
          </div>
          <div ref={outputRef} className="p-6 max-h-[500px] overflow-y-auto">
            <pre className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
          </div>
        </div>
      )}
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
