'use client'

import { useFavoritesStore } from '@/lib/favorites'
import type { Product } from '@/types'

interface Props {
  product: Product
  accent: string
  className?: string
  size?: 'sm' | 'md'
}

export function FavoritesButton({ product, accent, className = '', size = 'md' }: Props) {
  const toggleItem = useFavoritesStore((s) => s.toggleItem)
  const hasItem = useFavoritesStore((s) => s.hasItem)
  const isFav = hasItem(product.id)

  const dim = size === 'sm' ? 'w-7 h-7' : 'w-9 h-9'
  const iconSize = size === 'sm' ? 14 : 18

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    toggleItem(product)
  }

  return (
    <button
      onClick={handleClick}
      aria-label={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`flex items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${dim} ${
        isFav
          ? 'bg-red-50 hover:bg-red-100'
          : 'bg-white/90 hover:bg-white shadow-sm'
      } ${className}`}
    >
      <HeartIcon
        filled={isFav}
        size={iconSize}
        color={isFav ? accent : '#9ca3af'}
      />
    </button>
  )
}

function HeartIcon({ filled, size, color }: { filled: boolean; size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
      strokeWidth={filled ? 0 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'all 0.2s' }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}
