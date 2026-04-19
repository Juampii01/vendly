'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StoreConfig } from '@/types'

interface AuthFormProps {
  store: StoreConfig
  redirectTo?: string
}

type Mode = 'login' | 'register' | 'sent'

export function AuthForm({ store, redirectTo = '/cuenta' }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const bg = store.color_primary
  const fg = store.color_background

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError('Email o contraseña incorrectos.')
      } else {
        router.push(redirectTo)
        router.refresh()
      }
    } else {
      // register
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        setLoading(false)
        return
      }
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      })
      if (err) {
        setError(err.message)
      } else {
        setMode('sent')
      }
    }
    setLoading(false)
  }

  if (mode === 'sent') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: store.color_text }}>
          Confirmá tu email
        </h2>
        <p className="text-sm opacity-60" style={{ color: store.color_text }}>
          Enviamos un link de confirmación a <strong>{email}</strong>.
          Hacé click en el link y ya podés ingresar.
        </p>
        <button
          onClick={() => setMode('login')}
          className="mt-6 text-sm underline opacity-50 hover:opacity-80"
          style={{ color: store.color_text }}
        >
          Ya confirmé, quiero ingresar
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: `${store.color_text}15` }}>
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-opacity border-b-2 -mb-px ${
              mode === m ? 'opacity-100 border-current' : 'opacity-30 border-transparent hover:opacity-50'
            }`}
            style={{ color: store.color_text, borderColor: mode === m ? store.color_primary : 'transparent' }}
          >
            {m === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
              style={{ color: store.color_text }}>
              Nombre completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan García"
              required
              className="w-full border px-4 py-3 text-sm outline-none focus:border-current bg-transparent"
              style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
            style={{ color: store.color_text }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoFocus
            className="w-full border px-4 py-3 text-sm outline-none focus:border-current bg-transparent"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
            style={{ color: store.color_text }}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
            required
            className="w-full border px-4 py-3 text-sm outline-none focus:border-current bg-transparent"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: bg, color: fg }}
        >
          {loading ? '...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
