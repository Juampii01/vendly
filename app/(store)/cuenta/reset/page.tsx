import { getStoreConfig } from '@/lib/store'
import { ResetPasswordForm } from '@/components/store/ResetPasswordForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Restablecer contraseña' }
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPage({ searchParams }: PageProps) {
  const params = await searchParams
  const store = await getStoreConfig()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: store.color_background, color: store.color_text }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-black uppercase tracking-tight"
            style={{ color: store.color_text }}
          >
            {store.name}
          </h1>
        </div>

        <div className="rounded-2xl border p-8" style={{ borderColor: `${store.color_text}15` }}>
          <ResetPasswordForm store={store} token={params.token ?? null} />
        </div>
      </div>
    </div>
  )
}
