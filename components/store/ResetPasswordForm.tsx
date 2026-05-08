'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { StoreConfig } from '@/types'

interface Props {
  store: StoreConfig
  token: string | null
}

/**
 * Pantalla de reset de password. El token viene del email que mandó
 * `/api/auth/store-password-reset` (modo request).
 */
export function ResetPasswordForm({ store, token }: Props) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()

  const BG = store.color_primary
  const FG = store.color_background

  if (!token) {
    return (
      <div className="text-center py-6">
        <h2 className="text-lg font-bold mb-2" style={{ color: store.color_text }}>
          Link inválido
        </h2>
        <p className="text-sm opacity-60 mb-6" style={{ color: store.color_text }}>
          Falta el token de recuperación. Volvé al login y pedí uno nuevo.
        </p>
        <Link
          href="/cuenta/login"
          className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl"
          style={{ backgroundColor: BG, color: FG }}
        >
          Ir al login
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-lg font-bold mb-2" style={{ color: store.color_text }}>
          Contraseña actualizada
        </h2>
        <p className="text-sm opacity-60 mb-6" style={{ color: store.color_text }}>
          Ya podés iniciar sesión con tu nueva contraseña.
        </p>
        <Link
          href="/cuenta/login"
          className="inline-block px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-xl"
          style={{ backgroundColor: BG, color: FG }}
        >
          Iniciar sesión
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/auth/store-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password: password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'No se pudo cambiar la contraseña.')
      return
    }

    setDone(true)
    setTimeout(() => router.push('/cuenta/login'), 2000)
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2" style={{ color: store.color_text }}>
        Nueva contraseña
      </h2>
      <p className="text-sm opacity-60 mb-6" style={{ color: store.color_text }}>
        Ingresá tu nueva contraseña dos veces para confirmar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
            style={{ color: store.color_text }}
          >
            Nueva contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
            autoFocus
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
            style={{ color: store.color_text }}
          >
            Repetir contraseña
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repetí la contraseña"
            required
            minLength={6}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] disabled:opacity-40 rounded-xl"
          style={{ backgroundColor: BG, color: FG }}
        >
          {loading ? '...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  )
}
