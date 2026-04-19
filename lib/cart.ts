/**
 * Zustand store para el carrito.
 * Persistencia en localStorage. Hidratación segura en SSR con `skipHydration`.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartState, Coupon, Product, ProductVariant } from '@/types'

// ─── Actions ──────────────────────────────────────────────────────────────────

interface CartActions {
  addItem: (product: Product, variant: ProductVariant | null, quantity?: number) => void
  removeItem: (productId: string, variantId: string | null) => void
  updateQuantity: (productId: string, variantId: string | null, quantity: number) => void
  clearCart: () => void
  restoreCart: (items: CartItem[]) => void
  applyCoupon: (coupon: Coupon) => void
  removeCoupon: () => void
  // Calculados
  getSubtotal: () => number
  getDiscount: () => number
  getShipping: (freeThreshold: number | null, baseShipping: number) => number
  getTotal: (freeThreshold: number | null, baseShipping: number) => number
  getItemCount: () => number
}

export type CartStore = CartState & CartActions

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildCartKey(productId: string, variantId: string | null): string {
  return variantId ? `${productId}__${variantId}` : productId
}

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      session_id: generateSessionId(),

      addItem(product, variant, quantity = 1) {
        set((state) => {
          const key = buildCartKey(product.id, variant?.id ?? null)
          const existingIndex = state.items.findIndex(
            (i) => buildCartKey(i.product_id, i.variant_id) === key,
          )

          const unitPrice = variant?.price_override ?? product.price
          const stock = variant?.stock ?? Infinity

          if (existingIndex >= 0) {
            const updated = [...state.items]
            const current = updated[existingIndex]
            const newQty = Math.min(current.quantity + quantity, stock)
            updated[existingIndex] = { ...current, quantity: newQty }
            return { items: updated }
          }

          const newItem: CartItem = {
            product_id: product.id,
            variant_id: variant?.id ?? null,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              price: product.price,
            },
            variant: variant,
            quantity: Math.min(quantity, stock),
            unit_price: unitPrice,
          }

          return { items: [...state.items, newItem] }
        })
      },

      removeItem(productId, variantId) {
        const key = buildCartKey(productId, variantId)
        set((state) => ({
          items: state.items.filter(
            (i) => buildCartKey(i.product_id, i.variant_id) !== key,
          ),
        }))
      },

      updateQuantity(productId, variantId, quantity) {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }
        const key = buildCartKey(productId, variantId)
        set((state) => ({
          items: state.items.map((i) =>
            buildCartKey(i.product_id, i.variant_id) === key
              ? { ...i, quantity }
              : i,
          ),
        }))
      },

      clearCart() {
        set({ items: [], coupon: null, session_id: generateSessionId() })
      },

      restoreCart(items) {
        set({ items, coupon: null, session_id: generateSessionId() })
      },

      applyCoupon(coupon) {
        set({ coupon })
      },

      removeCoupon() {
        set({ coupon: null })
      },

      getSubtotal() {
        return get().items.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0,
        )
      },

      getDiscount() {
        const { coupon } = get()
        if (!coupon) return 0
        const subtotal = get().getSubtotal()
        if (coupon.min_order_amount && subtotal < coupon.min_order_amount) return 0
        if (coupon.type === 'percentage') {
          return Math.round((subtotal * coupon.value) / 100)
        }
        return Math.min(coupon.value, subtotal)
      },

      getShipping(freeThreshold, baseShipping) {
        const subtotal = get().getSubtotal()
        if (freeThreshold !== null && subtotal >= freeThreshold) return 0
        return baseShipping
      },

      getTotal(freeThreshold, baseShipping) {
        return (
          get().getSubtotal() -
          get().getDiscount() +
          get().getShipping(freeThreshold, baseShipping)
        )
      },

      getItemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'vendly-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)

// ─── Hydration hook (use in layout) ──────────────────────────────────────────

/**
 * Llamar una vez en el layout del cliente para hidratar el store.
 * Evita hydration mismatch en SSR.
 */
export function hydrateCart() {
  useCartStore.persist.rehydrate()
}
