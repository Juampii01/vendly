import { LoginClient } from '@/components/admin/LoginClient'
import { getStoreConfig } from '@/lib/store'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

// Rutas permitidas como destino post-login (evita open redirect)
const ALLOWED_NEXT = ['/admin', '/platform', '/platform/stores']

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string; next?: string }>
}) {
  const params = await searchParams
  const next = params.next && ALLOWED_NEXT.some(p => params.next!.startsWith(p))
    ? params.next
    : '/admin'

  // Si el destino es la plataforma, mostramos branding de Vendly (no de una tienda)
  const isPlatformLogin = next.startsWith('/platform')

  const store = isPlatformLogin ? null : await getStoreConfig().catch(() => null)

  return (
    <LoginClient
      store={store}
      error={params.error}
      sent={params.sent === '1'}
      next={next}
    />
  )
}
