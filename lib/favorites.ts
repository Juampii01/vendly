/**
 * Zustand store para propiedades favoritas (inmobiliaria).
 * Persistencia en localStorage. Hidratación segura en SSR con `skipHydration`.
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Product } from '@/types'

// ─── State & Actions ──────────────────────────────────────────────────────────

interface FavoritesState {
  items: Product[]
}

interface FavoritesActions {
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  hasItem: (productId: string) => boolean
  clearAll: () => void
  getCount: () => number
}

export type FavoritesStore = FavoritesState & FavoritesActions

// ─── Store ────────────────────────────────────────────────────────────────────

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(product) {
        set((state) => {
          if (state.items.some((p) => p.id === product.id)) return state
          return { items: [...state.items, product] }
        })
      },

      removeItem(productId) {
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        }))
      },

      toggleItem(product) {
        if (get().hasItem(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      hasItem(productId) {
        return get().items.some((p) => p.id === productId)
      },

      clearAll() {
        set({ items: [] })
      },

      getCount() {
        return get().items.length
      },
    }),
    {
      name: 'vendly-favorites',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
)

// ─── Hydration ────────────────────────────────────────────────────────────────

export function hydrateFavorites() {
  useFavoritesStore.persist.rehydrate()
}
