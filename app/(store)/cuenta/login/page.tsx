import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { AuthForm } from '@/components/store/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi cuenta — Ingresar' }

export default async function CuentaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { next, error } = await searchParams

  // Si viene con error=not_registered: el usuario está logueado pero sin cuenta
  // en esta tienda → cerrar sesión y mostrar el mensaje de error
  if (user && error !== 'not_registered') {
    redirect(next ?? '/cuenta')
  }

  // Si viene con not_registered, forzar logout del server para limpiar sesión
  if (user && error === 'not_registered') {
    await supabase.auth.signOut()
  }

  const store = await getStoreConfig()

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center px-4 py-16"
      style={{ backgroundColor: store.color_background }}
    >
      <div className="w-full max-w-sm">
        <h1
          className="mb-8 text-2xl font-black uppercase tracking-tight"
          style={{ color: store.color_text }}
        >
          Mi cuenta
        </h1>

        {error === 'not_registered' && (
          <div
            className="mb-6 rounded-lg border px-4 py-3 text-sm"
            style={{
              borderColor: '#fca5a5',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
            }}
          >
            Tu cuenta no está registrada en <strong>{store.name}</strong>.
            Podés registrarte desde esta pantalla.
          </div>
        )}

        <AuthForm store={store} redirectTo={next ?? '/cuenta'} />
      </div>
    </div>
  )
}
