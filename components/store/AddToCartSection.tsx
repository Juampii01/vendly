'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart'
import { VariantSelector } from './VariantSelector'
import type { Product, ProductVariant, StoreConfig } from '@/types'

interface AddToCartSectionProps {
  product: Product
  store: StoreConfig
}

export function AddToCartSection({ product, store }: AddToCartSectionProps) {
  const variants = product.variants ?? []
  const hasVariants = variants.length > 0
  const firstAvailable = variants.find((v) => v.is_active && v.stock > 0) ?? null
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(firstAvailable)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const stock = hasVariants ? (selectedVariant?.stock ?? 0) : Infinity
  const canAdd = hasVariants ? selectedVariant !== null && stock > 0 : true
  const maxQty = stock === Infinity ? 99 : stock
  const outOfStock = hasVariants && selectedVariant !== null && selectedVariant.stock === 0
  const lowStock = hasVariants && selectedVariant !== null && selectedVariant.stock > 0 && selectedVariant.stock <= 5

  function handleAdd() {
    if (!canAdd) return
    addItem(product, hasVariants ? selectedVariant : null, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const bg = store.color_primary
  const fg = store.color_background

  return (
    <div className="flex flex-col gap-6">

      {/* Variantes */}
      {hasVariants && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariant?.id ?? null}
          onSelect={setSelectedVariant}
          store={store}
        />
      )}

      {/* Stock status */}
      {hasVariants && selectedVariant && (
        <p className="text-xs font-semibold uppercase tracking-wider">
          {outOfStock
            ? <span className="text-red-500">Sin stock</span>
            : lowStock
            ? <span style={{ color: store.color_accent }}>⚡ Últimas {selectedVariant.stock} unidades</span>
            : <span className="opacity-40">En stock</span>}
        </p>
      )}

      {/* Cantidad + CTA */}
      <div className="flex gap-2">
        {/* Stepper */}
        <div className="flex items-center border" style={{ borderColor: `${bg}20` }}>
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-10 items-center justify-center text-lg transition-opacity hover:opacity-50"
            aria-label="Quitar uno">
            −
          </button>
          <span className="w-8 text-center text-sm font-bold">{quantity}</span>
          <button onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
            className="flex h-12 w-10 items-center justify-center text-lg transition-opacity hover:opacity-50"
            aria-label="Agregar uno">
            +
          </button>
        </div>

        {/* Botón principal */}
        <button onClick={handleAdd} disabled={!canAdd}
          className={`flex-1 h-12 text-xs font-black uppercase tracking-[0.15em] transition-opacity ${
            !canAdd ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80 active:scale-[0.99]'
          }`}
          style={{ backgroundColor: bg, color: fg }}>
          {added
            ? '¡Agregado! ✓'
            : !canAdd && hasVariants && !selectedVariant
            ? 'Seleccioná una variante'
            : outOfStock
            ? 'Sin stock'
            : 'Agregar al carrito'}
        </button>
      </div>

    </div>
  )
}
