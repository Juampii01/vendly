'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { StoreConfig } from '@/types'
import type { DesignMessage, ProductAction, CategoryAction } from '@/app/api/admin/ai/design/types'

interface ProductRow {
  id: string
  name: string
  price: number
  compare_at_price: number | null
  is_active: boolean
  is_featured: boolean
  tags: string[]
  description: string | null
  slug: string
  category_id: string | null
}

interface CategoryRow {
  id: string
  name: string
  slug: string
  is_active: boolean
}

interface Props {
  store: StoreConfig
  storeId: string
  initialProducts: ProductRow[]
  initialCategories: CategoryRow[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  changes?: Record<string, unknown> | null
  product_actions?: ProductAction[] | null
  category_actions?: CategoryAction[] | null
  error?: boolean
}

export default function DesignStudio({ store: initialStore, storeId, initialProducts, initialCategories }: Props) {
  const [store, setStore] = useState(initialStore)
  const [products, setProducts] = useState<ProductRow[]>(initialProducts)
  const [categories, setCategories] = useState<CategoryRow[]>(initialCategories)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hola! Soy tu asistente de diseño y catálogo. Puedo modificar colores, textos, hero, crear o editar **productos y categorías** de **${initialStore.name}**.\n\nContame: ¿qué querés cambiar?`,
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

  // ─── Aplicar cambios de store config ────────────────────────────────────────
  const applyStoreChanges = useCallback(async (changes: Record<string, unknown>) => {
    const res = await fetch('/api/admin/store-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    })
    if (res.ok) {
      setStore(prev => ({ ...prev, ...changes }))
      setIframeKey(k => k + 1)
    }
  }, [])

  // ─── Aplicar acciones de productos ──────────────────────────────────────────
  const applyProductActions = useCallback(async (actions: ProductAction[]) => {
    const supabase = createClient()

    for (const action of actions) {
      if (action.action === 'create' && action.data) {
        const { category_slug, images, ...rest } = action.data as Record<string, unknown>

        // Resolver category_slug → category_id
        let category_id: string | null = null
        if (category_slug) {
          const cat = categories.find(c => c.slug === category_slug)
          if (cat) category_id = cat.id
        }

        // Generar slug único
        const baseSlug = String(rest.name ?? 'producto').toLowerCase()
          .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
        const slug = `${baseSlug}-${Date.now().toString(36)}`

        const { data } = await supabase
          .from('products')
          .insert({ ...rest, store_id: storeId, slug, category_id, images: images ?? [] })
          .select('id, name, price, compare_at_price, is_active, is_featured, tags, description, slug, category_id')
          .single()

        if (data) {
          setProducts(prev => [data as ProductRow, ...prev])
        }
      }

      if (action.action === 'update' && action.product_id && action.data) {
        const { category_slug, images, ...rest } = action.data as Record<string, unknown>

        let updateData: Record<string, unknown> = { ...rest }
        if (category_slug !== undefined) {
          const cat = categories.find(c => c.slug === category_slug)
          updateData.category_id = cat?.id ?? null
        }
        if (images !== undefined) updateData.images = images

        await supabase.from('products').update(updateData).eq('id', action.product_id)
        setProducts(prev => prev.map(p =>
          p.id === action.product_id ? { ...p, ...updateData } : p
        ))
      }

      if (action.action === 'delete' && action.product_id) {
        await supabase.from('products').delete().eq('id', action.product_id)
        setProducts(prev => prev.filter(p => p.id !== action.product_id))
      }
    }
  }, [storeId, categories])

  // ─── Aplicar acciones de categorías ─────────────────────────────────────────
  const applyCategoryActions = useCallback(async (actions: CategoryAction[]) => {
    const supabase = createClient()

    for (const action of actions) {
      if (action.action === 'create' && action.data) {
        const name = String(action.data.name ?? '')
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        const position = categories.length + 1

        const { data } = await supabase
          .from('categories')
          .insert({ ...action.data, store_id: storeId, slug, position, is_active: true })
          .select('id, name, slug, is_active')
          .single()

        if (data) {
          setCategories(prev => [...prev, data as CategoryRow])
        }
      }

      if (action.action === 'update' && action.category_id && action.data) {
        await supabase.from('categories').update(action.data).eq('id', action.category_id)
        setCategories(prev => prev.map(c =>
          c.id === action.category_id ? { ...c, ...action.data } : c
        ))
      }

      if (action.action === 'delete' && action.category_id) {
        await supabase.from('categories').delete().eq('id', action.category_id)
        setCategories(prev => prev.filter(c => c.id !== action.category_id))
      }
    }
  }, [storeId, categories])

  // ─── Enviar mensaje ──────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    const history: DesignMessage[] = messages
      .slice(1).slice(-10)
      .map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/admin/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          store,
          products: products.map(p => ({
            id: p.id, name: p.name, price: p.price,
            compare_at_price: p.compare_at_price, is_active: p.is_active,
            is_featured: p.is_featured, tags: p.tags, description: p.description,
          })),
          categories: categories.map(c => ({
            id: c.id, name: c.name, slug: c.slug, is_active: c.is_active,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.error ?? 'Error al procesar el mensaje.',
          error: true, changes: null,
        }])
        return
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: data.explanation,
        changes: data.changes,
        product_actions: data.product_actions,
        category_actions: data.category_actions,
      }
      setMessages(prev => [...prev, assistantMsg])

      // Aplicar todo en paralelo
      setApplying(true)
      await Promise.all([
        data.changes && Object.keys(data.changes).length > 0
          ? applyStoreChanges(data.changes) : Promise.resolve(),
        data.product_actions?.length
          ? applyProductActions(data.product_actions) : Promise.resolve(),
        data.category_actions?.length
          ? applyCategoryActions(data.category_actions) : Promise.resolve(),
      ])
      setApplying(false)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Error de conexión.',
        error: true, changes: null,
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
    'Creá 3 categorías: Remeras, Pantalones, Accesorios',
    'Cambiá los colores a tonos oscuros premium',
    'Reescribí el título del hero',
    'Marcá todos los productos como destacados',
  ]

  const hasActions = (msg: ChatMessage) =>
    (msg.product_actions?.length ?? 0) + (msg.category_actions?.length ?? 0) > 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] md:h-screen overflow-hidden">

      {/* ── Preview ── */}
      <div className="hidden md:flex flex-col flex-1 bg-slate-100 border-r border-slate-200">
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
        <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
          <div className={`relative h-full transition-all duration-300 ${previewWidth === 'mobile' ? 'w-[390px]' : 'w-full'}`}>
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
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Editor IA</p>
            <p className="text-xs text-slate-400 truncate">
              {products.length} productos · {categories.length} categorías
            </p>
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
              <div className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-sm'
                  : msg.error
                  ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-sm'
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
              }`}>
                <MarkdownText text={msg.content} />

                {/* Store config changes */}
                {msg.changes && Object.keys(msg.changes).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-400 space-y-0.5">
                    {Object.keys(msg.changes).map(k => (
                      <div key={k} className="flex items-center gap-1.5">
                        <span className="text-green-500">✓</span>
                        <span>{fieldLabel(k)}</span>
                        {isColor(String(msg.changes![k])) && (
                          <span className="inline-block h-3 w-3 rounded-full border border-slate-300 shrink-0"
                            style={{ backgroundColor: String(msg.changes![k]) }} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Catalog actions summary */}
                {hasActions(msg) && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-400 space-y-0.5">
                    {msg.product_actions?.map((a, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span className="text-blue-500">✓</span>
                        <span>
                          {a.action === 'create' ? 'Producto creado' : a.action === 'update' ? 'Producto actualizado' : 'Producto eliminado'}
                          {a.data?.name ? `: ${String(a.data.name)}` : ''}
                        </span>
                      </div>
                    ))}
                    {msg.category_actions?.map((a, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        <span className="text-purple-500">✓</span>
                        <span>
                          {a.action === 'create' ? 'Categoría creada' : a.action === 'update' ? 'Categoría actualizada' : 'Categoría eliminada'}
                          {a.data?.name ? `: ${String(a.data.name)}` : ''}
                        </span>
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

        {/* Suggestions */}
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
              placeholder="Modificá diseño, creá productos, cambiá categorías..."
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
    color_primary: 'Color primario', color_secondary: 'Color secundario',
    color_accent: 'Color de acento', color_background: 'Fondo', color_text: 'Texto',
    hero_title: 'Título del hero', hero_subtitle: 'Subtítulo del hero',
    hero_cta_label: 'Botón del hero', hero_cta_color: 'Color del botón',
    hero_image_url: 'Imagen del hero', name: 'Nombre de la tienda',
    meta_title: 'Título SEO', meta_description: 'Descripción SEO',
    home_marquee_items: 'Ticker / marquee', home_editorial_title: 'Título editorial',
    home_editorial_body: 'Texto editorial', home_editorial_label: 'Etiqueta editorial',
    whatsapp_number: 'WhatsApp', email: 'Email', instagram_url: 'Instagram',
  }
  return map[key] ?? key.replace(/_/g, ' ')
}

function MarkdownText({ text }: { text: string }) {
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
