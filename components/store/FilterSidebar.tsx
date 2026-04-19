'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import type { Category, StoreConfig } from '@/types'

interface FilterSidebarProps {
  categories: Category[]
  store: StoreConfig
  activeCategory?: string
}

export function FilterSidebar({ categories, store, activeCategory }: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('categoria', slug)
    } else {
      params.delete('categoria')
    }
    params.delete('pagina') // reset page on filter change
    router.push(`${pathname}?${params.toString()}`)
    setMobileOpen(false)
  }

  const FilterContent = () => (
    <div className="space-y-1">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-50">
        Categorías
      </p>
      <button
        onClick={() => setCategory(null)}
        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
          !activeCategory ? 'font-semibold' : 'hover:opacity-70'
        }`}
        style={!activeCategory ? { backgroundColor: store.color_primary, color: store.color_background } : {}}
      >
        Todos los productos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCategory(cat.slug)}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
            activeCategory === cat.slug ? 'font-semibold' : 'hover:opacity-70'
          }`}
          style={activeCategory === cat.slug ? { backgroundColor: store.color_primary, color: store.color_background } : {}}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-full border border-black/20 px-4 py-2 text-sm font-medium"
        >
          <FilterIcon />
          Filtrar
          {activeCategory && (
            <span
              className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold"
              style={{ backgroundColor: store.color_primary, color: store.color_background }}
            >
              1
            </span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl p-6 shadow-xl"
            style={{ backgroundColor: store.color_background }}
          >
            <FilterContent />
            <button
              onClick={() => setMobileOpen(false)}
              className="mt-6 w-full rounded-full py-3 text-sm font-semibold"
              style={{ backgroundColor: store.color_primary, color: store.color_background }}
            >
              Aplicar
            </button>
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-52 shrink-0">
        <FilterContent />
      </aside>
    </>
  )
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}
