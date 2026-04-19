import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[auth/callback]', error)
    return NextResponse.redirect(errorRedirect)
  }

  return response
}
