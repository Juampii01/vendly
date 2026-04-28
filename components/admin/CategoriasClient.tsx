'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

interface CategoryWithCount extends Category {
  products: { images: string[] | null }[]
}

interface Props {
  initialCategories: CategoryWithCount[]
  storeId: string
}

export function CategoriasClient({ initialCategories, storeId }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function productCount(cat: CategoryWithCount) {
    return cat.products?.length ?? 0
  }

  function productFallbackImage(cat: CategoryWithCount): string | null {
    // Pick the first image from any product in this category
    for (const p of cat.products ?? []) {
      if (p.images?.[0]) return p.images[0]
    }
    return null
  }

  function openNew() {
    setEditingId(null)
    setName('')
    setDescription('')
    setImageUrl('')
    setError(null)
    setShowForm(true)
  }

  function openEdit(cat: CategoryWithCount) {
    setEditingId(cat.id)
    setName(cat.name)
    setDescription(cat.description ?? '')
    setImageUrl(cat.image_url ?? '')
    setError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setError(null)
  }

  async function handleSave() {
    if (!name.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = { name, description, image_url: imageUrl }

      if (editingId) {
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCategories(cats => cats.map(c => c.id === editingId ? { ...c, ...json.data } : c))
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)
        setCategories(cats => [...cats, { ...json.data, products: [{ count: 0 }] }])
      }
      closeForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `${storeId}/categories/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: upErr } = await supabase.storage.from('products').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleToggleActive(cat: CategoryWithCount) {
    const newVal = !cat.is_active
    setCategories(cats => cats.map(c => c.id === cat.id ? { ...c, is_active: newVal } : c))
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: newVal }),
    })
    if (!res.ok) {
      // revert
      setCategories(cats => cats.map(c => c.id === cat.id ? { ...c, is_active: cat.is_active } : c))
    }
  }

  async function handleDelete(cat: CategoryWithCount) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (!res.ok) {
      alert(json.error)
      return
    }
    setCategories(cats => cats.filter(c => c.id !== cat.id))
  }

  async function handleMove(cat: CategoryWithCount, dir: 'up' | 'down') {
    const sorted = [...categories].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(c => c.id === cat.id)
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return

    const a = sorted[idx]
    const b = sorted[swapIdx]
    const newPos = b.position
    const oldPos = a.position

    // Optimistic update
    setCategories(cats => cats.map(c => {
      if (c.id === a.id) return { ...c, position: newPos }
      if (c.id === b.id) return { ...c, position: oldPos }
      return c
    }))

    await Promise.all([
      fetch(`/api/admin/categories/${a.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: newPos }),
      }),
      fetch(`/api/admin/categories/${b.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: oldPos }),
      }),
    ])
  }

  const sorted = [...categories].sort((a, b) => a.position - b.position)

  return (
    <div className="p-6 md:p-8 max-w-3xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
          <p className="text-sm text-slate-500 mt-0.5">{categories.length} categoría{categories.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          <span className="text-base leading-none">+</span> Nueva categoría
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              {editingId ? 'Editar categoría' : 'Nueva categoría'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ej: Remeras, Buzos, Accesorios"
                  autoFocus
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Descripción <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descripción corta de la categoría"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Imagen <span className="text-slate-400 font-normal normal-case">(opcional)</span>
                </label>

                {/* Preview */}
                {imageUrl && (
                  <div className="relative inline-block mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="" className="h-24 w-32 rounded-xl object-cover border border-slate-200 bg-slate-50" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-white text-[10px] hover:bg-red-500 transition-colors"
                    >✕</button>
                  </div>
                )}

                {/* Upload + URL row */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={e => { setImageUrl(e.target.value); setUploadError(null) }}
                    placeholder="https://... o subí un archivo →"
                    className="flex-1 min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    {uploading
                      ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    }
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
                {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-40"
              >
                {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
              </button>
              <button
                onClick={closeForm}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <p className="text-sm font-medium text-slate-400">No hay categorías todavía</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Creá la primera para organizar tu catálogo</p>
          <button
            onClick={openNew}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            + Nueva categoría
          </button>
        </div>
      )}

      {/* List */}
      {sorted.length > 0 && (
        <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
          {sorted.map((cat, idx) => {
            const count = productCount(cat)
            return (
              <div key={cat.id} className="flex items-center gap-4 px-4 py-3.5 bg-white hover:bg-slate-50 transition-colors">

                {/* Orden */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(cat, 'up')}
                    disabled={idx === 0}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-0 transition-colors"
                    title="Subir"
                  >
                    <ChevronUp />
                  </button>
                  <button
                    onClick={() => handleMove(cat, 'down')}
                    disabled={idx === sorted.length - 1}
                    className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-0 transition-colors"
                    title="Bajar"
                  >
                    <ChevronDown />
                  </button>
                </div>

                {/* Imagen */}
                {(() => {
                  const src = cat.image_url || productFallbackImage(cat)
                  return (
                    <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      {src
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={src} alt={cat.name} className="h-full w-full object-cover" />
                        : <div className="h-full w-full flex items-center justify-center text-slate-300 text-xs font-bold">
                            {cat.name.charAt(0).toUpperCase()}
                          </div>
                      }
                    </div>
                  )
                })()}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold truncate ${cat.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
                      {cat.name}
                    </p>
                    {!cat.is_active && (
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        Inactiva
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {count} producto{count !== 1 ? 's' : ''}{cat.description ? ` · ${cat.description}` : ''}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle activo */}
                  <button
                    onClick={() => handleToggleActive(cat)}
                    title={cat.is_active ? 'Desactivar' : 'Activar'}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      cat.is_active ? 'bg-green-500' : 'bg-slate-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      cat.is_active ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <PencilIcon />
                  </button>

                  {/* Eliminar */}
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        El orden aquí define cómo aparecen las categorías en el filtro de la tienda.
        No se pueden eliminar categorías con productos activos.
      </p>
    </div>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function ChevronUp() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
}
function ChevronDown() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function PencilIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
}
