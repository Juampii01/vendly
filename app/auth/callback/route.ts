import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  // Detectar si el flujo es de la tienda o del admin
  const isStoreFlow = next.startsWith('/cuenta') || next.startsWith('/carrito') || next === '/'
  const errorRedirect = isStoreFlow
    ? `${origin}/cuenta/login?error=auth_failed`
    : `${origin}/admin/login?error=auth_failed`

  if (!code) {
    return NextResponse.redirect(errorRedirect)
  }

  const response = NextResponse.redirect(`${origin}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { error, data } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error)
    return NextResponse.redirect(errorRedirect)
  }

  // ── Si es flujo de tienda: registrar al usuario en store_customers ─────────
  //
  // Esto cubre el caso de confirmación de email (signUp con email verification).
  // El usuario hizo click en el link → llega aquí → lo registramos en la tienda.
  //
  if (isStoreFlow && data.user) {
    try {
      const [service, storeId] = [createServiceClient(), await getStoreId()]
      await service
        .from('store_customers')
        .upsert(
          {
            store_id: storeId,
            auth_user_id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name ?? null,
          },
          { onConflict: 'store_id,auth_user_id', ignoreDuplicates: true },
        )
    } catch (e) {
      // No bloqueamos el redirect si falla — el check en /cuenta lo atrapa
      console.error('[auth/callback] store-register failed', e)
    }
  }

  return response
}
