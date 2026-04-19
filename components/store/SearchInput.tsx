'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface SearchInputProps {
  placeholder?: string
  defaultValue?: string
}

export function SearchInput({ placeholder = 'Buscar productos...', defaultValue = '' }: SearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('busqueda', value)
    } else {
      params.delete('busqueda')
    }
    params.delete('pagina')
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }, 300)

  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <SearchIcon />
      </div>
      <input
        type="search"
        defaultValue={defaultValue}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-black/20 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-black/40 focus:ring-2 focus:ring-black/10"
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
