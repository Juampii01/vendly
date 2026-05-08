import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Callback de Supabase Auth (magic link / email confirmation).
 *
 * En el modelo tenant-aislado de la tienda NO se usa: los clientes finales se
 * registran/loguean por POST a `/api/auth/store-register` o `/api/auth/store-login`,
 * con email REAL traducido a email INTERNO server-side. No hay magic-link
 * para clientes (su email interno no es entregable).
 *
 * Este endpoint queda solo para los flujos de plataforma:
 *   - `/admin/login` (magic link de admins de tienda)
 *   - `/platform/...`
 *
 * Cualquier `next` que apunte a `/cuenta`, `/carrito` o `/` es rechazado por
 * seguridad (sería un intento de saltar la separación tenant via magic link).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  // Permitimos solo destinos de plataforma — los flujos de tienda usan password.
  const isAllowedDest = next.startsWith('/admin') || next.startsWith('/platform')
  if (!isAllowedDest) {
    return NextResponse.redirect(`${origin}/cuenta/login?error=invalid_callback`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
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

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    console.error('[auth/callback]', error)
    return NextResponse.redirect(`${origin}/admin/login?error=auth_failed`)
  }

  return response
}
