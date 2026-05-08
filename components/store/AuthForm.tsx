'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { StoreConfig } from '@/types'

interface AuthFormProps {
  store: StoreConfig
  redirectTo?: string
  /** Si 'register', arranca en modo registro */
  defaultMode?: 'login' | 'register'
}

type Mode = 'login' | 'register' | 'forgot' | 'forgot-sent'

/**
 * Formulario de autenticación tenant-aislada.
 *
 * El registro y login están aislados por (store_id, email): el mismo email puede
 * tener cuentas independientes en distintas tiendas, con passwords distintas.
 *
 * Toda la lógica de Auth pasa por endpoints server-side (`/api/auth/store-*`).
 * El cliente NO llama directamente a `supabase.auth` para evitar exponer el
 * email "interno" opaco que está en `auth.users`.
 */
export function AuthForm({ store, redirectTo = '/cuenta', defaultMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const ACCENT = store.color_accent ?? store.color_primary
  const BG = store.color_primary
  const FG = store.color_background

  function clearError() {
    setError('')
  }

  // ── LOGIN ────────────────────────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/store-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  // ── REGISTER ─────────────────────────────────────────────────────────────────

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/auth/store-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        full_name: name,
        phone: phone || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      if (data.code === 'email_taken') {
        setError(`Ya tenés una cuenta en ${store.name} con ese email. Probá iniciando sesión.`)
      } else {
        setError(data.error ?? 'Error al crear la cuenta.')
      }
      setLoading(false)
      return
    }

    if (data.must_login) {
      // Registro OK pero el sign-in tras crear falló — pasamos a login
      setMode('login')
      setError('Cuenta creada. Iniciá sesión para continuar.')
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  // ── FORGOT PASSWORD ─────────────────────────────────────────────────────────

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    await fetch('/api/auth/store-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    // Endpoint siempre responde OK (anti-enumeration)
    setMode('forgot-sent')
    setLoading(false)
  }

  // ── UI: forgot-sent ─────────────────────────────────────────────────────────

  if (mode === 'forgot-sent') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: store.color_text }}>
          Revisá tu email
        </h2>
        <p className="text-sm opacity-60" style={{ color: store.color_text }}>
          Si <strong>{email}</strong> tiene cuenta en {store.name}, te llegó un link para
          restablecer la contraseña. El link vence en 1 hora.
        </p>
        <button
          onClick={() => {
            clearError()
            setMode('login')
          }}
          className="mt-6 text-sm underline opacity-50 hover:opacity-80"
          style={{ color: store.color_text }}
        >
          Volver al login
        </button>
      </div>
    )
  }

  // ── UI: forgot ─────────────────────────────────────────────────────────────

  if (mode === 'forgot') {
    return (
      <div>
        <h2 className="text-base font-bold mb-2" style={{ color: store.color_text }}>
          Olvidaste tu contraseña
        </h2>
        <p className="text-sm opacity-60 mb-6" style={{ color: store.color_text }}>
          Te mandamos un link para restablecerla.
        </p>
        <form onSubmit={handleForgot} className="space-y-4">
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
              style={{ color: store.color_text }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoFocus
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
              style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-40 rounded-xl"
            style={{ backgroundColor: BG, color: FG }}
          >
            {loading ? '...' : 'Enviar link'}
          </button>
        </form>
        <button
          onClick={() => {
            clearError()
            setMode('login')
          }}
          className="mt-4 text-xs opacity-50 hover:opacity-80 transition-opacity"
          style={{ color: store.color_text }}
        >
          ← Volver al login
        </button>
      </div>
    )
  }

  // ── UI: Login / Register ──────────────────────────────────────────────────────

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: `${store.color_text}15` }}>
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m)
              clearError()
            }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-opacity border-b-2 -mb-px ${
              mode === m ? 'opacity-100' : 'opacity-30 border-transparent hover:opacity-50'
            }`}
            style={{
              color: store.color_text,
              borderColor: mode === m ? ACCENT : 'transparent',
            }}
          >
            {m === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        ))}
      </div>

      <form
        onSubmit={mode === 'register' ? handleRegister : handleLogin}
        className="space-y-4"
      >
        {mode === 'register' && (
          <>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
                style={{ color: store.color_text }}
              >
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan García"
                required
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
                style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
                style={{ color: store.color_text }}
              >
                Teléfono <span className="opacity-50 normal-case">(opcional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="11 1234 5678"
                className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
                style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
              />
            </div>
          </>
        )}

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
            style={{ color: store.color_text }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
            autoFocus
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <label
              className="block text-xs font-semibold uppercase tracking-wider opacity-60"
              style={{ color: store.color_text }}
            >
              Contraseña
            </label>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  clearError()
                  setMode('forgot')
                }}
                className="text-xs opacity-50 hover:opacity-80 transition-opacity"
                style={{ color: store.color_text }}
              >
                Olvidé mi contraseña
              </button>
            )}
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
            required
            minLength={6}
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-40 rounded-xl"
          style={{ backgroundColor: BG, color: FG }}
        >
          {loading ? '...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>

        {mode === 'register' && (
          <p className="text-[11px] opacity-50 text-center" style={{ color: store.color_text }}>
            Al crear una cuenta, aceptás nuestros términos y política de privacidad.
            Tu cuenta queda vinculada solo a {store.name}.
          </p>
        )}
      </form>
    </div>
  )
}
