import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { resolveInternalEmail } from '@/lib/auth-tenant'

// ─── POST /api/auth/store-login ───────────────────────────────────────────────
//
// Body: { email, password }
//
// Login aislado por tenant: traduce el email REAL del usuario al INTERNO opaco
// que está en auth.users, y dispara signinWithPassword con el interno. La
// cookie de sesión queda seteada por createClient() server-side.
//
// Si el (store_id, email) no existe en store_customers, devolvemos 401 sin
// distinguir entre "no existe" y "password incorrecta" — para no exponer
// qué emails están registrados en cada tienda.
//
export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'email y password requeridos' }, { status: 400 })
  }

  const storeId = await getStoreId()
  const resolved = await resolveInternalEmail({ storeId, email })

  if (!resolved) {
    return NextResponse.json(
      { error: 'Email o contraseña incorrectos' },
      { status: 401 },
    )
  }

  // signinWithPassword setea cookies de sesión a través del cliente SSR
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: resolved.internalEmail,
    password,
  })

  if (error) {
    return NextResponse.json(
      { error: 'Email o contraseña incorrectos' },
      { status: 401 },
    )
  }

  return NextResponse.json({ ok: true })
}
