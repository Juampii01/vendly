'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category, StoreConfig } from '@/types'

// ─── AI generate helper ───────────────────────────────────────────────────────

async function generateWithAI(payload: {
  target: string
  productName: string
  productCategory?: string
}): Promise<string> {
  const res = await fetch('/api/admin/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'Error al generar.')
  return json.result as string
}

// Fila de variante para el formulario
export interface VariantRow {
  id?: string
  talle: string
  color: string
  stock: string
  price_override: string
}

interface ProductFormProps {
  product: Product | null
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
  store: StoreConfig
  storeId: string
  saving: boolean
  saveError?: string | null
  onSave: (data: Partial<Product> & { variants_data: VariantRow[] }) => Promise<void>
  onClose: () => void
}

export function ProductForm({ product, categories, store, storeId, saving, saveError, onSave, onClose }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(String(product?.price ?? ''))
  const [comparePrice, setComparePrice] = useState(String(product?.compare_at_price ?? ''))
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false)
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [images, setImages] = useState<string[]>(product?.images ?? [])
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.length
      ? product.variants.map((v) => ({
          id: v.id,
          talle: v.attributes['talle'] ?? '',
          color: v.attributes['color'] ?? '',
          stock: String(v.stock),
          price_override: String(v.price_override ?? ''),
        }))
      : [],
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleNameChange(val: string) {
    setName(val)
    if (!product) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e')
          .replace(/[íìï]/g, 'i').replace(/[óòö]/g, 'o')
          .replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      )
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    const supabase = createClient()
    const newUrls: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${storeId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(path, file, { upsert: true })
      if (!error) {
        const { data } = supabase.storage.from('products').getPublicUrl(path)
        newUrls.push(data.publicUrl)
      }
    }

    setImages((prev) => [...prev, ...newUrls])
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  function addVariant() {
    setVariants((prev) => [...prev, { talle: '', color: '', stock: '0', price_override: '' }])
  }

  function updateVariant(idx: number, key: keyof VariantRow, val: string) {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [key]: val } : v)))
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !slug || !price) return

    // El form es un colector de datos puro — toda la persistencia
    // (producto + variantes) ocurre en ProductsClient.handleSave,
    // que tiene acceso al ID del producto recién creado.
    await onSave({
      name,
      slug,
      description: description || null,
      price: parseFloat(price),
      compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
      category_id: categoryId || null,
      is_featured: isFeatured,
      is_active: isActive,
      images,
      variants_data: variants,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            {product ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-slate-100 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Info básica */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField label="Nombre *">
                <input
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="Remera básica manga corta"
                />
              </FormField>
            </div>
            <FormField label="Slug (URL)">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className={`${inputCls} ${saveError?.includes('slug') ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder="remera-basica-manga-corta"
              />
              {saveError?.includes('slug') && (
                <p className="mt-1 text-xs text-red-500 font-medium">{saveError}</p>
              )}
            </FormField>
            <FormField label="Categoría">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputCls}>
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Precio *">
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={inputCls}
                placeholder="9990"
              />
            </FormField>
            <FormField label="Precio tachado (opcional)">
              <input
                type="number"
                min="0"
                step="0.01"
                value={comparePrice}
                onChange={(e) => setComparePrice(e.target.value)}
                className={inputCls}
                placeholder="12990"
              />
            </FormField>
            <div className="sm:col-span-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-500">Descripción</label>
                  <button
                    type="button"
                    disabled={aiLoading || !name.trim()}
                    onClick={async () => {
                      if (!name.trim()) return
                      setAiLoading(true)
                      setAiError(null)
                      try {
                        const catName = categories.find(c => c.id === categoryId)?.name
                        const result = await generateWithAI({
                          target: 'product_description',
                          productName: name,
                          productCategory: catName,
                        })
                        setDescription(result)
                      } catch (e) {
                        setAiError(e instanceof Error ? e.message : 'Error de IA.')
                      } finally {
                        setAiLoading(false)
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={!name.trim() ? 'Ingresá el nombre del producto primero' : 'Generar descripción con IA'}
                  >
                    <SparklesIcon />
                    {aiLoading ? 'Generando...' : 'Generar con IA'}
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Descripción del producto..."
                />
                {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-6">
            <Toggle label="Activo" value={isActive} onChange={setIsActive} />
            <Toggle label="Destacado" value={isFeatured} onChange={setIsFeatured} />
          </div>

          {/* Imágenes */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Imágenes</p>
            <div className="flex flex-wrap gap-3">
              {images.map((src, idx) => (
                <div key={idx} className="relative h-20 w-16 overflow-hidden rounded-xl bg-slate-100">
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    aria-label="Eliminar imagen"
                  >
                    <span className="text-[10px] leading-none">×</span>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-20 w-16 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40"
              >
                {uploading ? (
                  <span className="text-xs">...</span>
                ) : (
                  <>
                    <PlusIcon />
                    <span className="text-[10px]">Subir</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Variantes */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Variantes (talle / color)</p>
              <button
                type="button"
                onClick={addVariant}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2"
              >
                + Agregar variante
              </button>
            </div>
            {variants.length === 0 ? (
              <p className="text-xs text-slate-400">Sin variantes — el producto se vende sin selección de talle/color.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                  <span>Talle</span><span>Color</span><span>Stock</span><span>Precio override</span><span></span>
                </div>
                {variants.map((v, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <input value={v.talle} onChange={(e) => updateVariant(idx, 'talle', e.target.value)} placeholder="M" className={`${inputCls} text-xs py-1.5`} />
                    <input value={v.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} placeholder="Negro" className={`${inputCls} text-xs py-1.5`} />
                    <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(idx, 'stock', e.target.value)} className={`${inputCls} text-xs py-1.5`} />
                    <input type="number" min="0" step="0.01" value={v.price_override} onChange={(e) => updateVariant(idx, 'price_override', e.target.value)} placeholder="—" className={`${inputCls} text-xs py-1.5`} />
                    <button type="button" onClick={() => removeVariant(idx)} className="text-slate-300 hover:text-red-400 transition-colors justify-self-center">
                      <CloseIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {saveError && !saveError.includes('slug') && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-medium">
              ⚠ {saveError}
            </div>
          )}
          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ backgroundColor: store.color_primary, color: store.color_background }}
            >
              {saving ? 'Guardando...' : product ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400'

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-green-500' : 'bg-slate-200'}`}
        role="switch"
        aria-checked={value}
      >
        <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      {label}
    </label>
  )
}

function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
function SparklesIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.88 5.76L20 10l-6.12 1.24L12 17l-1.88-5.76L4 10l6.12-1.24z"/><path d="M19 3l.8 2.4L22 6l-2.2.6L19 9l-.8-2.4L16 6l2.2-.6z"/><path d="M5 17l.6 1.8L7 19l-1.4.2L5 21l-.6-1.8L3 19l1.4-.2z"/></svg>
}
