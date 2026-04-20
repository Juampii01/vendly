'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StoreConfig } from '@/types'

interface AuthFormProps {
  store: StoreConfig
  redirectTo?: string
}

// login | register | sent | join_confirm
type Mode = 'login' | 'register' | 'sent' | 'join_confirm'

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

  async function registerInStore() {
    await fetch('/api/auth/store-register', { method: 'POST' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    // ── INGRESAR ────────────────────────────────────────────────────────────
    if (mode === 'login') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        setError('Email o contraseña incorrectos.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/auth/store-register')
      const { registered } = await res.json()

      if (registered) {
        router.push(redirectTo)
        router.refresh()
      } else {
        // Sesión válida pero sin cuenta en ESTE store.
        // Ofrecemos unirse sin cerrar sesión — el usuario ya está autenticado.
        setLoading(false)
        setMode('join_confirm')
      }
      return
    }

    // ── CONFIRMAR UNIRSE A ESTE STORE (usuario ya autenticado) ───────────────
    if (mode === 'join_confirm') {
      await registerInStore()
      router.push(redirectTo)
      router.refresh()
      return
    }

    // ── REGISTRARSE ──────────────────────────────────────────────────────────
    if (mode === 'register') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.')
        setLoading(false)
        return
      }

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
        },
      })

      // Supabase devuelve identities vacío cuando el email ya existe globalmente
      const emailAlreadyExists =
        !signUpErr &&
        data.user !== null &&
        (data.user.identities?.length === 0 || data.user.identities === null)

      if (emailAlreadyExists) {
        // El email ya existe en Supabase (registrado en otra tienda).
        // Intentamos loguearlo con la contraseña que ingresó.
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })

        if (loginErr) {
          // Contraseña incorrecta → ya tiene cuenta con otra contraseña
          setError('Ya existe una cuenta con ese email. Ingresá desde la pestaña "Ingresar" con tu contraseña.')
          setLoading(false)
          return
        }

        // Login OK → registrar en este store y entrar
        await registerInStore()
        router.push(redirectTo)
        router.refresh()
        return
      }

      if (signUpErr) {
        setError(signUpErr.message)
        setLoading(false)
        return
      }

      // Registro nuevo: si hay sesión activa (confirmación deshabilitada) → entrar
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await registerInStore()
        router.push(redirectTo)
        router.refresh()
      } else {
        setMode('sent')
      }
      setLoading(false)
    }
  }

  // ── Email de confirmación enviado ──────────────────────────────────────────
  if (mode === 'sent') {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: store.color_text }}>
          Confirmá tu email
        </h2>
        <p className="text-sm opacity-60" style={{ color: store.color_text }}>
          Enviamos un link de confirmación a <strong>{email}</strong>.
          Hacé click en el link para activar tu cuenta.
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

  // ── Confirmar unirse a este store ──────────────────────────────────────────
  if (mode === 'join_confirm') {
    async function handleJoin() {
      setLoading(true)
      await registerInStore()
      router.push(redirectTo)
      router.refresh()
    }
    async function handleDecline() {
      const supabase = createClient()
      await supabase.auth.signOut()
      setMode('login')
      setError('')
    }
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">👋</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: store.color_text }}>
          ¡Bienvenido/a de vuelta!
        </h2>
        <p className="text-sm opacity-60 mb-6" style={{ color: store.color_text }}>
          Tu cuenta no está registrada en <strong>{store.name}</strong> todavía.
          ¿Querés agregarla?
        </p>
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-40 mb-3"
          style={{ backgroundColor: bg, color: fg }}
        >
          {loading ? '...' : `Unirme a ${store.name}`}
        </button>
        <button
          onClick={handleDecline}
          className="text-xs opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: store.color_text }}
        >
          No, cerrar sesión
        </button>
      </div>
    )
  }

  // ── Login / Register ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b mb-6" style={{ borderColor: `${store.color_text}15` }}>
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-opacity border-b-2 -mb-px ${
              mode === m ? 'opacity-100' : 'opacity-30 border-transparent hover:opacity-50'
            }`}
            style={{
              color: store.color_text,
              borderColor: mode === m ? store.color_primary : 'transparent',
            }}
          >
            {m === 'login' ? 'Ingresar' : 'Registrarse'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
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
              className="w-full border px-4 py-3 text-sm outline-none focus:border-current bg-transparent"
              style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
            />
          </div>
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
            className="w-full border px-4 py-3 text-sm outline-none focus:border-current bg-transparent"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-1.5 opacity-60"
            style={{ color: store.color_text }}
          >
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
