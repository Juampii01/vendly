'use client'

import { useEffect } from 'react'
import { hydrateFavorites } from '@/lib/favorites'

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateFavorites()
  }, [])
  return <>{children}</>
}
