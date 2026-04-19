'use client'

import type { ProductVariant, StoreConfig } from '@/types'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: string | null
  onSelect: (variant: ProductVariant) => void
  store: StoreConfig
}

/**
 * Agrupa las variantes por cada atributo (talle, color, etc.)
 * y renderiza selectores independientes.
 */
export function VariantSelector({ variants, selectedVariantId, onSelect, store }: VariantSelectorProps) {
  const activeVariants = variants.filter((v) => v.is_active)
  if (activeVariants.length === 0) return null

  // Recopilar todos los atributos únicos
  const attributeKeys = Array.from(
    new Set(activeVariants.flatMap((v) => Object.keys(v.attributes))),
  )

  const selectedVariant = activeVariants.find((v) => v.id === selectedVariantId) ?? null

  function handleAttributeSelect(key: string, value: string) {
    // Mantener los otros atributos del variant actual y cambiar el key seleccionado
    const currentAttrs = selectedVariant?.attributes ?? {}
    const newAttrs = { ...currentAttrs, [key]: value }

    // Buscar un variant que coincida con los nuevos atributos
    const match = activeVariants.find((v) =>
      Object.entries(newAttrs).every(([k, val]) => v.attributes[k] === val),
    )
    if (match) onSelect(match)
  }

  return (
    <div className="space-y-4">
      {attributeKeys.map((key) => {
        const values = Array.from(
          new Set(activeVariants.map((v) => v.attributes[key]).filter(Boolean)),
        )
        const selectedValue = selectedVariant?.attributes[key]

        return (
          <div key={key}>
            <p className="mb-2 text-sm font-medium capitalize">
              {key}
              {selectedValue && (
                <span className="ml-1 font-normal opacity-60">— {selectedValue}</span>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              {values.map((val) => {
                // Verificar si esta combinación tiene stock
                const matchingVariant = activeVariants.find((v) => {
                  const currentSelected = selectedVariant?.attributes ?? {}
                  const testAttrs = { ...currentSelected, [key]: val }
                  return Object.entries(testAttrs).every(([k, tVal]) => v.attributes[k] === tVal)
                })
                const hasStock = (matchingVariant?.stock ?? 0) > 0
                const isSelected = selectedValue === val

                // Color swatch si el key es "color"
                if (key.toLowerCase() === 'color') {
                  return (
                    <button
                      key={val}
                      onClick={() => handleAttributeSelect(key, val)}
                      disabled={!hasStock}
                      title={val}
                      className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                        isSelected ? 'scale-110' : 'hover:scale-105'
                      } ${!hasStock ? 'opacity-30 cursor-not-allowed' : ''}`}
                      style={{
                        backgroundColor: colorNameToHex(val),
                        borderColor: isSelected ? store.color_primary : 'transparent',
                        outline: isSelected ? `2px solid ${store.color_primary}` : 'none',
                        outlineOffset: '2px',
                      }}
                      aria-label={val}
                      aria-pressed={isSelected}
                    >
                      {!hasStock && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="block h-0.5 w-full rotate-45 bg-gray-400" />
                        </span>
                      )}
                    </button>
                  )
                }

                return (
                  <button
                    key={val}
                    onClick={() => handleAttributeSelect(key, val)}
                    disabled={!hasStock}
                    className={`min-w-[2.5rem] rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-transparent font-semibold'
                        : 'border-black/20 hover:border-black/40'
                    } ${!hasStock ? 'opacity-30 cursor-not-allowed line-through' : ''}`}
                    style={isSelected ? { backgroundColor: store.color_primary, color: store.color_background, borderColor: store.color_primary } : {}}
                    aria-pressed={isSelected}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Intenta interpretar nombres de colores comunes en español */
function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    negro: '#111111', blanco: '#ffffff', rojo: '#ef4444', azul: '#3b82f6',
    verde: '#22c55e', amarillo: '#eab308', naranja: '#f97316', rosa: '#ec4899',
    violeta: '#8b5cf6', gris: '#6b7280', marron: '#92400e', beige: '#d4b896',
    celeste: '#7dd3fc', bordo: '#881337', nude: '#d4a896', camel: '#c19a6b',
  }
  return map[name.toLowerCase()] ?? '#cccccc'
}
