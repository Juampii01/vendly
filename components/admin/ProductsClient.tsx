'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ProductForm, type VariantRow } from './ProductForm'
import { formatPrice } from '@/lib/format'
import type { Product, Category, StoreConfig } from '@/types'

interface ProductsClientProps {
  initialProducts: Product[]
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
  store: StoreConfig
  storeId: string
}

export function ProductsClient({ initialProducts, categories, store, storeId }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  // storeId still used as prop — kept for potential future use
  void storeId

  async function toggleActive(product: Product) {
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)),
    )
    await fetch(`/api/admin/products/${product.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !product.is_active }),
    })
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    }
  }

  function handleNew() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  async function handleSave(data: Partial<Product> & { variants_data: VariantRow[] }) {
    setSaving(true)
    try {
      if (editingProduct) {
        // ── Actualizar producto existente ────────────────────────────────────
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Error al actualizar')
        const { data: updated } = await res.json()
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? (updated ?? { ...p, ...data }) : p)),
        )
      } else {
        // ── Crear producto nuevo ─────────────────────────────────────────────
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Error al crear')
        const { data: newProduct } = await res.json()
        if (newProduct) {
          setProducts((prev) => [newProduct as Product, ...prev])
        }
      }

      setFormOpen(false)
      setEditingProduct(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-end">
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: store.color_primary, color: store.color_background }}
        >
          <PlusIcon />
          Nuevo producto
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {products.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            No se encontraron productos
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Categoría</th>
                <th className="px-4 py-3 text-right hidden md:table-cell">Precio</th>
                <th className="px-4 py-3 text-center">Activo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {product.images[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 max-w-[200px] truncate">{product.name}</p>
                        <p className="text-xs text-slate-400">{product.variants?.length ?? 0} variante{(product.variants?.length ?? 0) !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-500">
                    {product.category?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell font-semibold text-slate-800">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleActive(product)}
                      className={`inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        product.is_active ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                      aria-label={product.is_active ? 'Desactivar' : 'Activar'}
                    >
                      <span
                        className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                          product.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {formOpen && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          store={store}
          storeId={storeId}
          saving={saving}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditingProduct(null) }}
        />
      )}
    </div>
  )
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
