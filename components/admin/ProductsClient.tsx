'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
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
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  )

  async function toggleActive(product: Product) {
    const supabase = createClient()
    await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)),
    )
  }

  async function handleDelete(product: Product) {
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
    const supabase = createClient()
    await supabase.from('products').delete().eq('id', product.id)
    setProducts((prev) => prev.filter((p) => p.id !== product.id))
  }

  function handleNew() {
    setEditingProduct(null)
    setFormOpen(true)
  }

  function handleEdit(product: Product) {
    setEditingProduct(product)
    setFormOpen(true)
  }

  // Convierte las filas del formulario al formato que espera Supabase
  function buildVariantRows(productId: string, variantsData: VariantRow[]) {
    return variantsData
      .filter((v) => v.talle || v.color)
      .map((v) => ({
        product_id: productId,
        attributes: {
          ...(v.talle ? { talle: v.talle } : {}),
          ...(v.color ? { color: v.color } : {}),
        },
        stock: parseInt(v.stock) || 0,
        price_override: v.price_override ? parseFloat(v.price_override) : null,
        is_active: true,
      }))
  }

  async function handleSave(data: Partial<Product> & { variants_data: VariantRow[] }) {
    setSaving(true)
    const supabase = createClient()
    const { variants_data, ...productData } = data

    try {
      if (editingProduct) {
        // ── Actualizar producto existente ────────────────────────────────────
        await supabase
          .from('products')
          .update({ ...productData, updated_at: new Date().toISOString() })
          .eq('id', editingProduct.id)

        // Reemplazar variantes: eliminar las viejas e insertar las nuevas
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProduct.id)

        if (variants_data.length > 0) {
          const variantRows = buildVariantRows(editingProduct.id, variants_data)
          if (variantRows.length > 0) {
            await supabase.from('product_variants').insert(variantRows)
          }
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...p, ...productData } : p,
          ),
        )
      } else {
        // ── Crear producto nuevo ─────────────────────────────────────────────
        // Primero insertar el producto para obtener su ID.
        // Luego insertar las variantes con ese ID.
        const { data: newProduct } = await supabase
          .from('products')
          .insert({ ...productData, store_id: storeId })
          .select('*, category:categories(id, name, slug), variants:product_variants(*)')
          .single()

        if (newProduct) {
          // Ahora tenemos el ID real — insertar variantes con seguridad
          if (variants_data.length > 0) {
            const variantRows = buildVariantRows(newProduct.id, variants_data)
            if (variantRows.length > 0) {
              await supabase.from('product_variants').insert(variantRows)
            }
          }
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
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80"
          style={{ backgroundColor: store.color_primary, color: store.color_background }}
        >
          <PlusIcon />
          Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center opacity-40">
          <SearchIcon />
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">
            {search ? 'No se encontraron productos' : 'Todavía no hay productos'}
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
              {filtered.map((product) => (
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
