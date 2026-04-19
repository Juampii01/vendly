'use client'

import { useState } from 'react'
import type { StoreConfig } from '@/types'

export function NewsletterForm({ store, dark = false }: { store: StoreConfig; dark?: boolean }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || state === 'loading') return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setState('success')
        setEmail('')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  const fg = dark ? store.color_background : store.color_text
  const accent = store.color_accent

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="text-2xl">✓</span>
        <p className="text-sm font-bold" style={{ color: fg }}>
          ¡Listo! Te avisamos antes que nadie.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
        className="flex-1 bg-transparent border px-4 py-3.5 text-sm outline-none placeholder:opacity-40 focus:border-current"
        style={{ borderColor: `${fg}40`, color: fg }}
      />
      <button
        type="submit"
        disabled={state === 'loading'}
        className="shrink-0 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ backgroundColor: accent, color: store.color_primary }}
      >
        {state === 'loading' ? '...' : 'Suscribirme'}
      </button>
      {state === 'error' && (
        <p className="w-full text-xs opacity-60" style={{ color: fg }}>
          Algo salió mal. Intentá de nuevo.
        </p>
      )}
    </form>
  )
}
