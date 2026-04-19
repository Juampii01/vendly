'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { StoreConfig } from '@/types'
import type { DesignMessage } from '@/app/api/admin/ai/design/route'

interface Props {
  store: StoreConfig
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  changes?: Record<string, unknown> | null
  error?: boolean
}

export default function DesignStudio({ store: initialStore }: Props) {
  const [store, setStore] = useState(initialStore)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hola! Soy tu asistente de diseño. Puedo modificar colores, textos, hero, contenido del home y más de **${initialStore.name}**.\n\nContame: ¿cómo querés que sea tu tienda?`,
      changes: null,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const applyChanges = useCallback(async (changes: Record<string, unknown>) => {
    setApplying(true)
    try {
      const res = await fetch('/api/admin/store-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      })
      if (res.ok) {
        setStore(prev => ({ ...prev, ...changes }))
        setIframeKey(k => k + 1)
      }
    } finally {
      setApplying(false)
    }
  }, [])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Historial para contexto (últimos 10 mensajes, sin el de bienvenida)
    const history: DesignMessage[] = messages
      .slice(1)
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/admin/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history, store }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error ?? 'Error al procesar el mensaje.',
          error: true,
          changes: null,
        }])
        return
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.explanation,
        changes: data.changes,
      }
      setMessages(prev => [...prev, assistantMsg])

      // Aplicar cambios automáticamente
      if (data.changes && Object.keys(data.changes).length > 0) {
        await applyChanges(data.changes)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión.',
        error: true,
        changes: null,
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const SUGGESTIONS = [
    'Hacé la tienda más premium y elegante',
    'Cambiá los colores a tonos oscuros',
    'Reescribí el título del hero',
    'Hacé el estilo más juvenil y colorido',
  ]

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">

      {/* ── Preview ── */}
      <div className="hidden md:flex flex-col flex-1 bg-slate-100 border-r border-slate-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-200 shrink-0">
          <span className="text-xs font-medium text-slate-500">Vista previa</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPreviewWidth('desktop')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewWidth === 'desktop' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              Escritorio
            </button>
            <button
              onClick={() => setPreviewWidth('mobile')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewWidth === 'mobile' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700'}`}
            >
              Móvil
            </button>
            <button
              onClick={() => setIframeKey(k => k + 1)}
              title="Recargar preview"
              className="ml-2 px-2 py-1 rounded text-xs text-slate-400 hover:text-slate-700 border border-slate-200 hover:border-slate-400 transition-colors"
            >
              ↺
            </button>
          </div>
        </div>

        {/* Iframe */}
        <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
          <div
            className={`relative h-full transition-all duration-300 ${previewWidth === 'mobile' ? 'w-[390px]' : 'w-full'}`}
            style={{ maxHeight: '100%' }}
          >
            {applying && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-xl">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Spinner /> Aplicando cambios...
                </div>
              </div>
            )}
            <iframe
              key={iframeKey}
              src="/"
              className="w-full h-full rounded-xl border border-slate-200 bg-white shadow-sm"
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      </div>

      {/* ── Chat ── */}
      <div className="flex flex-col w-full md:w-[380px] shrink-0 bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0">
            <span className="text-white text-sm">✦</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Asistente de diseño</p>
            <p className="text-xs text-slate-400">Los cambios se aplican en tiempo real</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-white text-[10px]">✦</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-sm'
                    : msg.error
                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm'
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}
              >
                <MarkdownText text={msg.content} />
                {msg.changes && Object.keys(msg.changes).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-400 space-y-0.5">
                    {Object.keys(msg.changes).map(k => (
                      <div key={k} className="flex items-center gap-1.5">
                        <span className="text-green-500">✓</span>
                        <span>{fieldLabel(k)}</span>
                        {isColor(String(msg.changes![k])) && (
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: String(msg.changes![k]) }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-white text-[10px]">✦</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
                <div className="flex gap-1 items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions (solo cuando no hay mensajes del usuario) */}
        {messages.filter(m => m.role === 'user').length === 0 && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus() }}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-slate-400 hover:text-slate-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 pb-4 shrink-0">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describí cómo querés modificar tu tienda..."
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 max-h-32"
              style={{ minHeight: '24px' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="shrink-0 h-7 w-7 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-slate-300">Enter para enviar · Shift+Enter para nueva línea</p>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isColor(v: string) { return /^#[0-9a-fA-F]{3,8}$/.test(v) }

function fieldLabel(key: string): string {
  const map: Record<string, string> = {
    color_primary: 'Color primario',
    color_secondary: 'Color secundario',
    color_accent: 'Color de acento',
    color_background: 'Fondo',
    color_text: 'Texto',
    hero_title: 'Título del hero',
    hero_subtitle: 'Subtítulo del hero',
    hero_cta_label: 'Botón del hero',
    hero_image_url: 'Imagen del hero',
    name: 'Nombre de la tienda',
    meta_title: 'Título SEO',
    meta_description: 'Descripción SEO',
    home_marquee_items: 'Ticker / marquee',
    home_editorial_title: 'Título editorial',
    home_editorial_body: 'Texto editorial',
  }
  return map[key] ?? key.replace(/_/g, ' ')
}

function MarkdownText({ text }: { text: string }) {
  // Renderiza **bold** básico
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**')
          ? <strong key={i}>{p.slice(2, -2)}</strong>
          : <span key={i}>{p}</span>
      )}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-slate-500" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
