'use client'

import { useEffect } from 'react'
import { hydrateCart } from '@/lib/cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    hydrateCart()
  }, [])
  return <>{children}</>
}
