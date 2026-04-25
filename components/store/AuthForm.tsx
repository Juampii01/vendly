'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StoreConfig } from '@/types'

interface AuthFormProps {
  store: StoreConfig
  redirectTo?: string
  /** Si 'register', arranca en modo registro */
  defaultMode?: 'login' | 'register'
}

type Mode = 'login' | 'register' | 'sent' | 'offer-register'

export function AuthForm({ store, redirectTo = '/cuenta', defaultMode = 'login' }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const ACCENT = store.color_accent ?? store.color_primary
  const BG = store.color_primary
  const FG = store.color_background

  // ── Helpers ─────────────────────────────────────────────────────────────────

  async function registerInStore() {
    await fetch('/api/auth/store-register', { method: 'POST' })
  }

  function resetForm() {
    setEmail('')
    setPassword('')
    setName('')
    setError('')
  }

  // ── INGRESAR ──────────────────────────────────────────────────────────────────

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Verificar si tiene cuenta en ESTA tienda
    const res = await fetch('/api/auth/store-register')
    const { registered } = await res.json()

    if (registered) {
      router.push(redirectTo)
      router.refresh()
      return
    }

    // Credenciales válidas pero NO registrado en esta tienda.
    // Ofrecemos registrarse aquí en lugar de mostrar un error engañoso.
    await supabase.auth.signOut()
    setMode('offer-register')
    setLoading(false)
  }

  // ── REGISTRARSE ───────────────────────────────────────────────────────────────

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

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

    // Email ya existe en Supabase Auth globalmente (registrado en otra tienda)
    const emailAlreadyExists =
      !signUpErr &&
      data.user !== null &&
      (data.user.identities?.length === 0 || data.user.identities === null)

    if (emailAlreadyExists) {
      // El email ya existe. NO auto-registramos: esto evita que credenciales
      // de una tienda se usen para acceder a otra sin acción explícita.
      // En cambio, intentamos verificar la contraseña y mostramos el flujo
      // "registrarse en esta tienda" de forma clara.
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })

      if (loginErr) {
        // Contraseña incorrecta → ese email existe pero con otra contraseña
        await supabase.auth.signOut()
        setError('Ese email ya está en uso con otra contraseña. Probá iniciando sesión.')
        setLoading(false)
        return
      }

      // Contraseña OK → el usuario tiene cuenta en otra tienda y quiere registrarse acá.
      // Cerramos sesión y mostramos la pantalla de confirmación explícita.
      await supabase.auth.signOut()
      setMode('offer-register')
      setLoading(false)
      return
    }

    if (signUpErr) {
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    // Registro nuevo exitoso
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Sin confirmación de email → sesión activa, registrar en este store
      await registerInStore()
      router.push(redirectTo)
      router.refresh()
    } else {
      // Con confirmación de email → avisar al usuario
      setMode('sent')
    }
    setLoading(false)
  }

  // ── CONFIRMAR REGISTRO EN ESTA TIENDA (email ya existe) ───────────────────────

  async function handleConfirmRegister() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
    if (loginErr) {
      setError('No pudimos verificar tu identidad. Intentá de nuevo.')
      setLoading(false)
      return
    }

    // Verificar si ya está registrado en esta tienda
    const res = await fetch('/api/auth/store-register')
    const { registered } = await res.json()

    if (registered) {
      // Ya estaba registrado → entrar directamente
      router.push(redirectTo)
      router.refresh()
      return
    }

    // Registrar explícitamente en esta tienda
    await registerInStore()
    router.push(redirectTo)
    router.refresh()
  }

  // ── UI: Pantalla de confirmación (cuenta existe en otra tienda) ───────────────

  if (mode === 'offer-register') {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-4">🏪</div>
        <h2 className="text-lg font-black uppercase tracking-tight mb-2" style={{ color: store.color_text }}>
          Bienvenido a {store.name}
        </h2>
        <p className="text-sm mb-1" style={{ color: `${store.color_text}99` }}>
          Tu cuenta <strong>{email}</strong> existe en otra tienda.
        </p>
        <p className="text-sm mb-8" style={{ color: `${store.color_text}99` }}>
          ¿Querés registrarte en <strong>{store.name}</strong> también?
        </p>

        {error && <p className="text-xs text-red-500 font-medium mb-4">{error}</p>}

        <button
          onClick={handleConfirmRegister}
          disabled={loading}
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-40 mb-3"
          style={{ backgroundColor: BG, color: FG }}
        >
          {loading ? '...' : `Registrarme en ${store.name}`}
        </button>

        <button
          onClick={() => { resetForm(); setMode('login') }}
          className="text-xs opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: store.color_text }}
        >
          Cancelar
        </button>
      </div>
    )
  }

  // ── UI: Email de confirmación enviado ─────────────────────────────────────────

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
          onClick={() => { resetForm(); setMode('login') }}
          className="mt-6 text-sm underline opacity-50 hover:opacity-80"
          style={{ color: store.color_text }}
        >
          Ya confirmé, quiero ingresar
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
            onClick={() => { setMode(m); setError('') }}
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

      <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-4">
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
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 bg-transparent transition-all"
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
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
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
            className="w-full border rounded-xl px-4 py-3 text-sm outline-none bg-transparent transition-all"
            style={{ borderColor: `${store.color_text}25`, color: store.color_text }}
          />
        </div>

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80 disabled:opacity-40 rounded-xl"
          style={{ backgroundColor: BG, color: FG }}
        >
          {loading ? '...' : mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  )
}
