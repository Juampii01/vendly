import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { AuthForm } from '@/components/store/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi cuenta — Ingresar' }

export default async function CuentaLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { next } = await searchParams
  if (user) redirect(next ?? '/cuenta')

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
        <AuthForm store={store} redirectTo={next ?? '/cuenta'} />
      </div>
    </div>
  )
}
