'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { StoreConfig } from '@/types'

interface LoginClientProps {
  /** null cuando es login de plataforma → muestra branding de Vendly */
  store: StoreConfig | null
  error?: string
  sent: boolean
  /** Ruta a la que redirigir después de login exitoso. Default: '/admin' */
  next?: string
}

type LoginMode = 'password' | 'magic'

export function LoginClient({ store, error, sent, next = '/admin' }: LoginClientProps) {
  const [mode, setMode] = useState<LoginMode>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(sent)
  const errorMsg = error === 'sin_acceso'
    ? 'Tu email no tiene acceso a este panel. Contactá al administrador.'
    : (error ?? '')
  const [formError, setFormError] = useState(errorMsg)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setFormError('')

    const supabase = createClient()

    if (mode === 'password') {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (authError) {
        setFormError('Email o contraseña incorrectos.')
      } else {
        router.push(next)
        router.refresh()
      }
    } else {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${baseUrl}/auth/callback?next=/admin` },
      })
      if (authError) {
        setFormError('Error al enviar el link. Verificá el email e intentá de nuevo.')
      } else {
        setSubmitted(true)
      }
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          {store === null ? (
            // Branding de plataforma
            <span className="text-3xl font-black tracking-tight text-slate-900">
              Vendly
            </span>
          ) : store.logo_url ? (
            <Image src={store.logo_url} alt={store.name} width={120} height={40}
              className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-2xl font-bold" style={{ color: store.color_primary }}>
              {store.name}
            </span>
          )}
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {store === null ? 'Plataforma' : 'Panel de administración'}
          </span>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
                <MailIcon />
              </div>
              <h2 className="text-lg font-bold text-slate-900">¡Revisá tu email!</h2>
              <p className="mt-2 text-sm text-slate-500">
                Enviamos un link de acceso a <span className="font-medium text-slate-700">{email}</span>.
              </p>
              <button
                onClick={() => { setSubmitted(false); setEmail('') }}
                className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
              >
                Usar otro email
              </button>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-bold text-slate-900">Acceder</h2>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 mt-3 border-b border-slate-100">
                <button
                  onClick={() => { setMode('password'); setFormError('') }}
                  className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                    mode === 'password' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Contraseña
                </button>
                <button
                  onClick={() => { setMode('magic'); setFormError('') }}
                  className={`pb-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                    mode === 'magic' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Magic link
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@tutienda.com"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                  />
                </div>

                {mode === 'password' && (
                  <div>
                    <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 bg-white outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                    />
                  </div>
                )}

                {formError && (
                  <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={store ? { backgroundColor: store.color_primary, color: store.color_background } : { backgroundColor: '#0f172a', color: '#ffffff' }}
                >
                  {loading ? 'Cargando...' : mode === 'password' ? 'Ingresar' : 'Enviar link de acceso'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MailIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
