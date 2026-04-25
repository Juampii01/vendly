import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { AuthForm } from '@/components/store/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default async function CuentaRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { next } = await searchParams

  // Si ya está autenticado, redirigir a cuenta
  if (user) redirect(next ?? '/cuenta')

  const store = await getStoreConfig()

  return (
    <div
      className="flex min-h-[80vh] items-center justify-center px-4 py-16"
      style={{ backgroundColor: store.color_background }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-1"
            style={{ color: store.color_text }}
          >
            {store.name}
          </p>
          <h1
            className="text-2xl font-black uppercase tracking-tight"
            style={{ color: store.color_text }}
          >
            Crear cuenta
          </h1>
        </div>

        <AuthForm store={store} redirectTo={next ?? '/cuenta'} defaultMode="register" />
      </div>
    </div>
  )
}
