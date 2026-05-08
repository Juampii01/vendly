import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { registerStoreCustomer, resolveInternalEmail } from '@/lib/auth-tenant'

// ─── GET /api/auth/store-register ─────────────────────────────────────────────
//
// Compatibilidad: el AuthForm legacy llamaba a este GET para verificar si el
// usuario actualmente autenticado tiene cuenta en este store. Mantenemos el
// comportamiento.
//
export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ registered: false })

  // Lookup de membership por auth_user_id (NO por email — el email en auth.users
  // ahora es interno opaco).
  const { createServiceClient } = await import('@/lib/supabase/server')
  const service = createServiceClient()
  const storeId = await getStoreId()
  const { data } = await service
    .from('store_customers')
    .select('id')
    .eq('store_id', storeId)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ registered: !!data })
}

// ─── POST /api/auth/store-register ────────────────────────────────────────────
//
// Body: { email, password, full_name?, phone? }
// Crea un cliente nuevo en el store actual, aislado por (store_id, email).
// Después del registro deja al usuario logueado vía signinWithPassword.
//
export async function POST(req: Request) {
  let body: {
    email?: unknown
    password?: unknown
    full_name?: unknown
    phone?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password, full_name, phone } = body

  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'email y password requeridos' }, { status: 400 })
  }

  const storeId = await getStoreId()

  const result = await registerStoreCustomer({
    storeId,
    email,
    password,
    fullName: typeof full_name === 'string' ? full_name : undefined,
    phone: typeof phone === 'string' ? phone : undefined,
  })

  if ('code' in result) {
    return NextResponse.json(
      { error: errorMessage(result.code), code: result.code },
      { status: result.code === 'email_taken' ? 409 : 400 },
    )
  }

  // Login automático tras registro exitoso (signin con email INTERNO).
  // Esto setea las cookies de sesión vía createClient() server-side.
  const supabase = await createClient()
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: result.internalEmail,
    password,
  })

  if (signInErr) {
    // El registro funcionó pero el sign-in falló — devolvemos OK para que el
    // cliente reintente login manualmente.
    return NextResponse.json({ ok: true, must_login: true })
  }

  return NextResponse.json({ ok: true })
}

// ─── DELETE /api/auth/store-register ──────────────────────────────────────────
//
// "Quitarse" del store actual: borra la fila de store_customers.
// El auth.user queda; pero como tiene UNIQUE (auth_user_id), eliminar la fila
// libera el constraint para futuros usos.
//
export async function DELETE() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { createServiceClient } = await import('@/lib/supabase/server')
  const service = createServiceClient()
  const storeId = await getStoreId()

  // Borramos store_customers row + auth user (es del store, no es global)
  const { data: customer } = await service
    .from('store_customers')
    .delete()
    .eq('store_id', storeId)
    .eq('auth_user_id', user.id)
    .select('auth_user_id')
    .maybeSingle()

  if (customer) {
    await service.auth.admin.deleteUser(customer.auth_user_id).catch(() => {})
  }

  await supabase.auth.signOut().catch(() => {})

  // Suprimimos vars no usadas pero importadas
  void resolveInternalEmail

  return NextResponse.json({ ok: true })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorMessage(code: string): string {
  switch (code) {
    case 'invalid_email':
      return 'Email inválido'
    case 'weak_password':
      return 'La contraseña debe tener entre 6 y 200 caracteres'
    case 'email_taken':
      return 'Ya existe una cuenta con ese email en esta tienda'
    default:
      return 'Error al crear la cuenta'
  }
}
