'use client'

import { useState } from 'react'
import { useCartStore } from '@/lib/cart'
import { VariantSelector } from './VariantSelector'
import type { Product, ProductVariant, StoreConfig } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: true, hasWhatsappCTA: false, hasProductCatalog: true, hasUserAccount: true,
}

interface AddToCartSectionProps {
  product: Product
  store: StoreConfig
  features?: SiteFeatures
}

export function AddToCartSection({ product, store, features = DEFAULT_FEATURES }: AddToCartSectionProps) {
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

      {/* CTA — WhatsApp (dealership / services) */}
      {features.hasWhatsappCTA && store.whatsapp_number && (
        <a
          href={`https://wa.me/${store.whatsapp_number}?text=Hola! Me interesa el producto: ${encodeURIComponent(product.name)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
          style={{ backgroundColor: '#25D366', color: '#fff' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultar por WhatsApp
        </a>
      )}

      {/* CTA — Agregar al carrito */}
      {features.hasCart && (
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
      )}

    </div>
  )
}
