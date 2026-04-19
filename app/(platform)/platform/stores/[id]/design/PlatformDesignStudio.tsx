'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { StoreConfig, LandingSection, SectionType, Product, Category } from '@/types'
import type { DesignMessage, ProductAction, CategoryAction } from '@/app/api/admin/ai/design/types'

interface Props {
  store: StoreConfig
  initialProducts: Product[]
  initialCategories: Category[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  changes?: Record<string, unknown> | null
  product_actions?: ProductAction[] | null
  category_actions?: CategoryAction[] | null
  error?: boolean
}

const IS_DEV = process.env.NODE_ENV === 'development'
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'

function storePreviewUrl(store: StoreConfig): string {
  if (IS_DEV) return `http://${store.slug}.localhost:3000`
  return store.base_url ?? `https://${store.slug}.${ROOT_DOMAIN}`
}

// ─── Section meta ─────────────────────────────────────────────────────────────

const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'Hero', about: 'Sobre nosotros', services: 'Servicios',
  testimonials: 'Testimonios', pricing: 'Precios', gallery: 'Galería',
  faq: 'Preguntas frecuentes', contact: 'Contacto',
}
const SECTION_ICONS: Record<SectionType, string> = {
  hero: '🏠', about: '👥', services: '⚡', testimonials: '💬',
  pricing: '💰', gallery: '🖼️', faq: '❓', contact: '📩',
}

// ─── Suggestions ──────────────────────────────────────────────────────────────

function buildSuggestions(store: StoreConfig, hasProducts: boolean): string[] {
  const isLanding = store.site_type !== 'ecommerce'
  if (isLanding) {
    return [
      'Hacé el sitio más premium',
      'Agregá sección de testimonios',
      'Cambiá los colores a oscuros',
      'Creá una categoría de servicios',
    ]
  }
  return [
    hasProducts ? 'Marcá todos los productos como destacados' : 'Creá una categoría Remeras y agregá 3 productos',
    'Cambiá los colores a tonos oscuros',
    'Creá la categoría Buzos con 2 productos de ejemplo',
    'Actualizá el título del hero',
  ]
}

type ActivePanel = 'chat' | 'sections' | 'products' | 'code'

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlatformDesignStudio({ store: initialStore, initialProducts, initialCategories }: Props) {
  const [store, setStore] = useState(initialStore)
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hola! Estás editando **${initialStore.name}**. Puedo modificar diseño, colores, secciones y también gestionar el catálogo: crear categorías, agregar productos, cambiar precios y más.\n\n¿Qué querés hacer?`,
      changes: null,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [applying, setApplying] = useState(false)
  const [iframeKey, setIframeKey] = useState(0)
  const [previewWidth, setPreviewWidth] = useState<'desktop' | 'mobile'>('desktop')
  const [activePanel, setActivePanel] = useState<ActivePanel>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const previewUrl = storePreviewUrl(store)
  const isLanding = store.site_type !== 'ecommerce'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Apply store config changes ─────────────────────────────────────────────
  const applyStoreChanges = useCallback(async (changes: Record<string, unknown>) => {
    const res = await fetch('/api/platform/stores/design', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: store.id, changes }),
    })
    if (res.ok) {
      setStore(prev => ({ ...prev, ...changes } as StoreConfig))
      return true
    }
    return false
  }, [store.id])

  // ── Apply product actions ──────────────────────────────────────────────────
  const applyProductActions = useCallback(async (actions: ProductAction[]) => {
    const newProducts = [...products]
    for (const action of actions) {
      const res = await fetch(`/api/platform/stores/${store.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (!res.ok) continue
      const result = await res.json()
      if (action.action === 'create' && result.product) {
        newProducts.push(result.product)
      } else if (action.action === 'update' && result.product) {
        const idx = newProducts.findIndex(p => p.id === action.product_id)
        if (idx >= 0) newProducts[idx] = result.product
      } else if (action.action === 'delete' && action.product_id) {
        const idx = newProducts.findIndex(p => p.id === action.product_id)
        if (idx >= 0) newProducts.splice(idx, 1)
      }
    }
    setProducts([...newProducts])
  }, [store.id, products])

  // ── Apply category actions ─────────────────────────────────────────────────
  const applyCategoryActions = useCallback(async (actions: CategoryAction[]) => {
    const newCats = [...categories]
    for (const action of actions) {
      const res = await fetch(`/api/platform/stores/${store.id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      })
      if (!res.ok) continue
      const result = await res.json()
      if (action.action === 'create' && result.category) {
        newCats.push(result.category)
      } else if (action.action === 'update' && result.category) {
        const idx = newCats.findIndex(c => c.id === action.category_id)
        if (idx >= 0) newCats[idx] = result.category
      } else if (action.action === 'delete' && action.category_id) {
        const idx = newCats.findIndex(c => c.id === action.category_id)
        if (idx >= 0) newCats.splice(idx, 1)
      }
    }
    setCategories([...newCats])
  }, [store.id, categories])

  // ── Toggle section active ──────────────────────────────────────────────────
  const toggleSection = useCallback(async (sectionId: string) => {
    if (!store.sections) return
    const updated = store.sections.map(s => s.id === sectionId ? { ...s, active: !s.active } : s)
    await applyStoreChanges({ sections: updated })
  }, [store.sections, applyStoreChanges])

  // ── Send message ───────────────────────────────────────────────────────────
  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    const history: DesignMessage[] = messages.slice(1).slice(-8).map(m => ({ role: m.role, content: m.content }))

    // Summarized products for the AI (keep tokens reasonable)
    const productsSummary = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      compare_at_price: p.compare_at_price,
      is_active: p.is_active,
      is_featured: p.is_featured,
      tags: p.tags,
      description: p.description ? p.description.slice(0, 100) : null,
    }))

    const categoriesSummary = categories.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      is_active: c.is_active,
    }))

    try {
      const res = await fetch('/api/admin/ai/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          store,
          products: productsSummary,
          categories: categoriesSummary,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.error ?? 'Error.', error: true, changes: null }])
        return
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.explanation,
        changes: data.changes,
        product_actions: data.product_actions,
        category_actions: data.category_actions,
      }])

      setApplying(true)
      try {
        const promises: Promise<unknown>[] = []
        let shouldRefresh = false

        if (data.changes && Object.keys(data.changes).length > 0) {
          promises.push(applyStoreChanges(data.changes))
          shouldRefresh = true
          if ('sections' in data.changes) setActivePanel('sections')
        }
        if (data.product_actions?.length) {
          promises.push(applyProductActions(data.product_actions))
          shouldRefresh = true
          setActivePanel('products')
        }
        if (data.category_actions?.length) {
          promises.push(applyCategoryActions(data.category_actions))
          shouldRefresh = true
          setActivePanel('products')
        }

        await Promise.all(promises)
        if (shouldRefresh) setIframeKey(k => k + 1)
      } finally {
        setApplying(false)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión.', error: true, changes: null }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  function useSuggestion(s: string) {
    setInput(s); setActivePanel('chat'); inputRef.current?.focus()
  }

  const SUGGESTIONS = buildSuggestions(store, products.length > 0)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-slate-950">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <Link href={`/platform/stores/${store.id}`} className="text-slate-500 hover:text-white text-sm transition-colors">
            ← {store.name}
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-sm text-slate-300 font-medium">Editor IA</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-500 border border-slate-700">
            {store.site_type}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600">{products.length} productos · {categories.length} categorías</span>
          <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white transition-colors">
            {store.slug} ↗
          </a>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Preview */}
        <div className="hidden md:flex flex-col flex-1 bg-slate-900 border-r border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 shrink-0">
            <span className="text-xs text-slate-500">Vista previa</span>
            <div className="flex items-center gap-1">
              {(['desktop', 'mobile'] as const).map(w => (
                <button key={w} onClick={() => setPreviewWidth(w)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${previewWidth === w ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  {w === 'desktop' ? 'Escritorio' : 'Móvil'}
                </button>
              ))}
              <button onClick={() => setIframeKey(k => k + 1)} className="ml-1 px-2 py-1 rounded text-xs text-slate-500 hover:text-slate-300 border border-slate-700 transition-colors">↺</button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden flex items-start justify-center p-4">
            <div className={`relative h-full transition-all duration-300 ${previewWidth === 'mobile' ? 'w-[390px]' : 'w-full'}`}>
              {applying && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 rounded-xl">
                  <div className="flex items-center gap-2 text-sm text-slate-300"><Spinner /> Aplicando...</div>
                </div>
              )}
              <iframe key={iframeKey} src={previewUrl}
                className="w-full h-full rounded-xl border border-slate-700 bg-white shadow-lg"
                style={{ minHeight: '600px' }} />
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col w-full md:w-[420px] shrink-0 bg-slate-900">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 shrink-0">
            <TabButton active={activePanel === 'chat'} onClick={() => setActivePanel('chat')}>
              ✦ Chat IA
            </TabButton>
            {isLanding && (
              <TabButton active={activePanel === 'sections'} onClick={() => setActivePanel('sections')}>
                ⊞ Secciones {store.sections ? `(${store.sections.filter(s => s.active).length}/${store.sections.length})` : '(0)'}
              </TabButton>
            )}
            <TabButton active={activePanel === 'products'} onClick={() => setActivePanel('products')}>
              📦 Catálogo {products.length > 0 ? `(${products.length})` : ''}
            </TabButton>
            <TabButton active={activePanel === 'code'} onClick={() => setActivePanel('code')}>
              {'</'} Código
            </TabButton>
          </div>

          {/* ── CHAT PANEL ─────────────────────────────────────────────────── */}
          {activePanel === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-slate-900 text-[10px]">✦</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-3.5 py-2.5 max-w-[88%] text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-white text-slate-900 rounded-tr-sm'
                        : msg.error
                        ? 'bg-red-950/60 text-red-300 border border-red-800 rounded-tl-sm'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-sm'
                    }`}>
                      <MarkdownText text={msg.content} />
                      <ChangeSummary
                        changes={msg.changes}
                        productActions={msg.product_actions}
                        categoryActions={msg.category_actions}
                      />
                    </div>
                  </div>
                ))}
                {loading && <LoadingBubble />}
                <div ref={messagesEndRef} />
              </div>

              {messages.filter(m => m.role === 'user').length === 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => useSuggestion(s)}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors text-left">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div className="px-4 pb-4 shrink-0">
                <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-3 py-2.5 focus-within:border-slate-500">
                  <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Diseño, secciones, productos, categorías..."
                    rows={1}
                    className="flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-slate-500 max-h-32"
                    style={{ minHeight: '24px' }} />
                  <button onClick={handleSend} disabled={!input.trim() || loading}
                    className="shrink-0 h-7 w-7 rounded-xl bg-white text-slate-900 flex items-center justify-center hover:bg-slate-100 transition-colors disabled:opacity-30">
                    <SendIcon />
                  </button>
                </div>
                <p className="mt-1.5 text-center text-[10px] text-slate-600">Enter para enviar · Shift+Enter nueva línea</p>
              </div>
            </>
          )}

          {/* ── SECTIONS PANEL ─────────────────────────────────────────────── */}
          {activePanel === 'sections' && isLanding && (
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-xs text-slate-400">Activá/desactivá secciones directamente, o usá el chat para modificar su contenido.</p>
              </div>
              <div className="divide-y divide-slate-800">
                {(store.sections ?? []).map(section => (
                  <SectionRow key={section.id} section={section}
                    onToggle={() => toggleSection(section.id)}
                    onChat={prompt => { setInput(prompt); setActivePanel('chat'); inputRef.current?.focus() }} />
                ))}
                {(store.sections ?? []).length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">No hay secciones.</p>
                    <button onClick={() => { setInput('Creá una página con hero, servicios y contacto'); setActivePanel('chat') }}
                      className="mt-3 text-xs text-white underline">Generar con IA →</button>
                  </div>
                )}
              </div>
              <div className="px-4 py-4 border-t border-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Agregar sección</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(SECTION_LABELS) as SectionType[])
                    .filter(t => !(store.sections ?? []).some(s => s.type === t))
                    .map(type => (
                      <button key={type}
                        onClick={() => { setInput(`Agregá una sección de ${SECTION_LABELS[type].toLowerCase()}`); setActivePanel('chat'); inputRef.current?.focus() }}
                        className="rounded-full border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-white transition-colors">
                        {SECTION_ICONS[type]} {SECTION_LABELS[type]}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CODE PANEL ─────────────────────────────────────────────────── */}
          {activePanel === 'code' && (
            <CodePanel
              store={store}
              storeId={store.id}
              onProductsImported={(count) => {
                setIframeKey(k => k + 1)
                // Re-fetch products after bulk import
                fetch(`/api/platform/stores/${store.id}/products`)
                  .then(r => r.json())
                  .then(d => { if (d.products) setProducts(d.products) })
                alert(`✓ ${count} producto${count !== 1 ? 's' : ''} importado${count !== 1 ? 's' : ''}`)
              }}
              onConfigSaved={(changes) => {
                setStore(prev => ({ ...prev, ...changes } as StoreConfig))
                setIframeKey(k => k + 1)
              }}
            />
          )}

          {/* ── PRODUCTS PANEL ─────────────────────────────────────────────── */}
          {activePanel === 'products' && (
            <div className="flex-1 overflow-y-auto">
              {/* Categories */}
              {categories.length > 0 && (
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 mb-2">Categorías</p>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <span key={cat.id}
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${cat.is_active ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-900 text-slate-600 border-slate-800 line-through'}`}>
                        {cat.name}
                      </span>
                    ))}
                    <button
                      onClick={() => { setInput('Creá una nueva categoría'); setActivePanel('chat'); inputRef.current?.focus() }}
                      className="px-2 py-0.5 rounded text-xs border border-dashed border-slate-700 text-slate-600 hover:text-slate-400 hover:border-slate-600 transition-colors">
                      + Categoría
                    </button>
                  </div>
                </div>
              )}

              {/* Products list */}
              {products.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-2xl mb-2">📦</p>
                  <p className="text-sm text-slate-400 font-medium">Sin productos todavía</p>
                  <p className="text-xs text-slate-600 mt-1 mb-4">El chat IA puede crearlos por vos.</p>
                  <button
                    onClick={() => { setInput('Creá la categoría Remeras y agregá 3 productos de ejemplo con precios'); setActivePanel('chat') }}
                    className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors">
                    Generar con IA
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {products.map(product => (
                    <ProductRow key={product.id} product={product}
                      onChat={prompt => { setInput(prompt); setActivePanel('chat'); inputRef.current?.focus() }} />
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div className="px-4 py-4 border-t border-slate-800">
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => { setInput('Agregá un producto nuevo'); setActivePanel('chat'); inputRef.current?.focus() }}
                    className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-white transition-colors">
                    + Agregar producto
                  </button>
                  {products.length > 0 && (
                    <button onClick={() => { setInput('Marcá todos los productos como destacados'); setActivePanel('chat'); inputRef.current?.focus() }}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-white transition-colors">
                      ⭐ Destacar todos
                    </button>
                  )}
                  {categories.length === 0 && (
                    <button onClick={() => { setInput('Creá las categorías principales para esta tienda'); setActivePanel('chat'); inputRef.current?.focus() }}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-white transition-colors">
                      Crear categorías
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`flex-1 py-3 text-xs font-semibold transition-colors whitespace-nowrap px-2 ${
        active ? 'text-white border-b-2 border-white' : 'text-slate-500 hover:text-slate-300'
      }`}>
      {children}
    </button>
  )
}

function SectionRow({ section, onToggle, onChat }: {
  section: LandingSection
  onToggle: () => void
  onChat: (prompt: string) => void
}) {
  const label = SECTION_LABELS[section.type] ?? section.type
  const icon = SECTION_ICONS[section.type] ?? '📄'
  return (
    <div className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors ${!section.active ? 'opacity-50' : ''}`}>
      <span className="text-base shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-[10px] text-slate-500 font-mono">{section.type}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={() => onChat(`Editá el contenido de la sección de ${label.toLowerCase()}`)}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded border border-slate-700 hover:border-slate-600">
          Editar IA
        </button>
        <button onClick={onToggle}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${section.active ? 'bg-white' : 'bg-slate-700'}`}>
          <span className={`inline-block h-3.5 w-3.5 rounded-full bg-slate-900 transition-transform ${section.active ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  )
}

function ProductRow({ product, onChat }: {
  product: Product
  onChat: (prompt: string) => void
}) {
  const cat = (product as Product & { category?: { name: string } | null }).category
  return (
    <div className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors ${!product.is_active ? 'opacity-50' : ''}`}>
      <div className="h-10 w-10 rounded-lg bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center overflow-hidden">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
          : <span className="text-slate-600 text-lg">📦</span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-white truncate">{product.name}</p>
          {product.is_featured && <span className="text-[10px]">⭐</span>}
          {!product.is_active && <span className="text-[10px] text-slate-500 uppercase tracking-wide">inactivo</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-semibold text-white">${product.price.toLocaleString('es-AR')}</span>
          {product.compare_at_price && (
            <span className="text-xs text-slate-500 line-through">${product.compare_at_price.toLocaleString('es-AR')}</span>
          )}
          {cat && <span className="text-[10px] text-slate-500">{cat.name}</span>}
        </div>
      </div>
      <button
        onClick={() => onChat(`Editá el producto "${product.name}"`)}
        className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors shrink-0 mt-0.5">
        Editar
      </button>
    </div>
  )
}

function ChangeSummary({ changes, productActions, categoryActions }: {
  changes?: Record<string, unknown> | null
  productActions?: ProductAction[] | null
  categoryActions?: CategoryAction[] | null
}) {
  const hasDesign = changes && Object.keys(changes).filter(k => k !== 'sections').length > 0
  const hasSections = changes && 'sections' in changes
  const hasProducts = productActions && productActions.length > 0
  const hasCategories = categoryActions && categoryActions.length > 0

  if (!hasDesign && !hasSections && !hasProducts && !hasCategories) return null

  const sectionCount = hasSections ? (changes.sections as LandingSection[]).filter((s: LandingSection) => s.active).length : 0
  const sectionTotal = hasSections ? (changes.sections as LandingSection[]).length : 0

  return (
    <div className="mt-2 pt-2 border-t border-slate-600 text-xs text-slate-500 space-y-0.5">
      {hasDesign && Object.keys(changes).filter(k => k !== 'sections').map(k => (
        <div key={k} className="flex items-center gap-1.5">
          <span className="text-green-500">✓</span>
          <span>{fieldLabel(k)}</span>
          {isColor(String(changes[k])) && (
            <span className="inline-block h-3 w-3 rounded-full border border-slate-600 shrink-0" style={{ backgroundColor: String(changes[k]) }} />
          )}
        </div>
      ))}
      {hasSections && (
        <div className="flex items-center gap-1.5">
          <span className="text-green-500">✓</span>
          <span>Secciones ({sectionCount} activas de {sectionTotal})</span>
        </div>
      )}
      {hasCategories && categoryActions.map((a, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-blue-400">✓</span>
          <span>Categoría {a.action === 'create' ? 'creada' : a.action === 'update' ? 'actualizada' : 'eliminada'}{a.data?.name ? `: ${a.data.name}` : ''}</span>
        </div>
      ))}
      {hasProducts && productActions.map((a, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-purple-400">✓</span>
          <span>Producto {a.action === 'create' ? 'creado' : a.action === 'update' ? 'actualizado' : 'eliminado'}{a.data?.name ? `: ${a.data.name}` : ''}</span>
        </div>
      ))}
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex gap-2.5">
      <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-slate-900 text-[10px]">✦</span>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5">
        <div className="flex gap-1 items-center">
          {[0, 150, 300].map(d => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Code Panel ───────────────────────────────────────────────────────────────

const BULK_EXAMPLE = `[
  {
    "name": "Remera Básica Blanca",
    "price": 5000,
    "compare_at_price": 7000,
    "description": "Remera de algodón 100%, corte recto.",
    "category_slug": "remeras",
    "tags": ["remera", "basica", "blanca"],
    "is_featured": true,
    "is_active": true
  },
  {
    "name": "Buzo Oversize Negro",
    "price": 12000,
    "description": "Buzo oversize premium, interior rizado.",
    "category_slug": "buzos",
    "tags": ["buzo", "oversize"],
    "is_featured": false,
    "is_active": true
  }
]`

type CodeMode = 'bulk' | 'config'

function CodePanel({
  store,
  storeId,
  onProductsImported,
  onConfigSaved,
}: {
  store: StoreConfig
  storeId: string
  onProductsImported: (count: number) => void
  onConfigSaved: (changes: Partial<StoreConfig>) => void
}) {
  const [mode, setMode] = useState<CodeMode>('bulk')
  const [bulkJson, setBulkJson] = useState(BULK_EXAMPLE)
  const [configJson, setConfigJson] = useState(() =>
    JSON.stringify({
      name: store.name,
      color_primary: store.color_primary,
      color_secondary: store.color_secondary,
      color_accent: store.color_accent,
      color_background: store.color_background,
      color_text: store.color_text,
      hero_title: store.hero_title,
      hero_subtitle: store.hero_subtitle,
      hero_cta_label: store.hero_cta_label,
      meta_title: store.meta_title,
      meta_description: store.meta_description,
      home_marquee_items: store.home_marquee_items,
      home_editorial_label: store.home_editorial_label,
      home_editorial_title: store.home_editorial_title,
      home_editorial_body: store.home_editorial_body,
      whatsapp_number: store.whatsapp_number,
      email: store.email,
      instagram_url: store.instagram_url,
    }, null, 2)
  )
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function handleBulkImport() {
    setRunning(true)
    setResult(null)
    try {
      let parsed: unknown
      try { parsed = JSON.parse(bulkJson) } catch {
        setResult({ ok: false, message: 'JSON inválido. Revisá la sintaxis.' })
        return
      }
      if (!Array.isArray(parsed)) {
        setResult({ ok: false, message: 'El JSON debe ser un array [ ... ]' })
        return
      }
      const res = await fetch(`/api/platform/stores/${storeId}/products/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: parsed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? 'Error al importar' })
        return
      }
      const msg = `✓ ${data.created} creado${data.created !== 1 ? 's' : ''}${data.skipped ? ` · ${data.skipped} omitido${data.skipped !== 1 ? 's' : ''}` : ''}${data.errors?.length ? ` · ${data.errors.length} error${data.errors.length !== 1 ? 'es' : ''}` : ''}`
      setResult({ ok: true, message: msg })
      onProductsImported(data.created)
    } finally {
      setRunning(false)
    }
  }

  async function handleConfigSave() {
    setRunning(true)
    setResult(null)
    try {
      let parsed: unknown
      try { parsed = JSON.parse(configJson) } catch {
        setResult({ ok: false, message: 'JSON inválido. Revisá la sintaxis.' })
        return
      }
      const res = await fetch('/api/platform/stores/design', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, changes: parsed }),
      })
      if (!res.ok) {
        const data = await res.json()
        setResult({ ok: false, message: data.error ?? 'Error al guardar' })
        return
      }
      setResult({ ok: true, message: '✓ Configuración guardada' })
      onConfigSaved(parsed as Partial<StoreConfig>)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sub-tabs */}
      <div className="flex border-b border-slate-800 shrink-0">
        <button
          onClick={() => { setMode('bulk'); setResult(null) }}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mode === 'bulk' ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`}
        >
          📥 Importar productos
        </button>
        <button
          onClick={() => { setMode('config'); setResult(null) }}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${mode === 'config' ? 'text-white bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`}
        >
          ⚙️ Config JSON
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
        {mode === 'bulk' && (
          <>
            <div className="text-xs text-slate-400 leading-relaxed">
              Pegá un array JSON de productos. Las categorías se crean automáticamente si no existen. Máximo 500 por operación.
            </div>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
              <textarea
                value={bulkJson}
                onChange={e => setBulkJson(e.target.value)}
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-xs text-green-300 font-mono p-3 outline-none leading-relaxed"
              />
            </div>
          </>
        )}

        {mode === 'config' && (
          <>
            <div className="text-xs text-slate-400 leading-relaxed">
              Editor directo de la configuración del store. Solo los campos permitidos se guardan; el resto se ignora.
            </div>
            <div className="flex-1 relative overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
              <textarea
                value={configJson}
                onChange={e => setConfigJson(e.target.value)}
                spellCheck={false}
                className="absolute inset-0 w-full h-full resize-none bg-transparent text-xs text-blue-300 font-mono p-3 outline-none leading-relaxed"
              />
            </div>
          </>
        )}

        {/* Result */}
        {result && (
          <div className={`rounded-xl px-3 py-2.5 text-xs font-medium ${result.ok ? 'bg-green-950/60 text-green-300 border border-green-800' : 'bg-red-950/60 text-red-300 border border-red-800'}`}>
            {result.message}
          </div>
        )}

        {/* Action button */}
        <button
          onClick={mode === 'bulk' ? handleBulkImport : handleConfigSave}
          disabled={running}
          className="w-full rounded-xl py-3 bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors disabled:opacity-40"
        >
          {running
            ? 'Procesando...'
            : mode === 'bulk'
            ? `Importar productos`
            : 'Guardar configuración'}
        </button>

        {/* Format hint */}
        {mode === 'bulk' && (
          <div className="text-[10px] text-slate-600 leading-relaxed">
            Campos: <span className="text-slate-500 font-mono">name</span> (requerido), <span className="text-slate-500 font-mono">price</span> (requerido), <span className="text-slate-500 font-mono">description</span>, <span className="text-slate-500 font-mono">category_slug</span>, <span className="text-slate-500 font-mono">compare_at_price</span>, <span className="text-slate-500 font-mono">tags[]</span>, <span className="text-slate-500 font-mono">images[]</span>, <span className="text-slate-500 font-mono">is_featured</span>, <span className="text-slate-500 font-mono">is_active</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isColor(v: string) { return /^#[0-9a-fA-F]{3,8}$/.test(v) }

function fieldLabel(key: string): string {
  const map: Record<string, string> = {
    color_primary: 'Color primario', color_secondary: 'Color secundario',
    color_accent: 'Acento', color_background: 'Fondo', color_text: 'Texto',
    hero_title: 'Título hero', hero_subtitle: 'Subtítulo hero',
    hero_cta_label: 'Botón hero', hero_image_url: 'Imagen hero',
    name: 'Nombre tienda', meta_title: 'Título SEO', meta_description: 'Descripción SEO',
    home_marquee_items: 'Ticker del home', home_split_image_url: 'Imagen editorial',
    home_editorial_label: 'Label editorial', home_editorial_title: 'Título editorial',
    home_editorial_body: 'Texto editorial', whatsapp_number: 'WhatsApp',
    email: 'Email', instagram_url: 'Instagram',
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
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}
