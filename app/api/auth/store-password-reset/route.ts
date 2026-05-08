import { NextResponse } from 'next/server'
import { getStoreId } from '@/lib/tenant'
import { getStoreConfig } from '@/lib/store'
import { requestPasswordReset, completePasswordReset } from '@/lib/auth-tenant'

// ─── POST /api/auth/store-password-reset ──────────────────────────────────────
//
// Body: { email }                  → request reset (manda email)
// Body: { token, new_password }    → complete reset (setea nueva password)
//
// El email de reset siempre va al email REAL del usuario (no al interno).
// Anti-enumeration: cuando se pide reset, siempre devolvemos OK aunque el
// email no exista en este store.
//
export async function POST(req: Request) {
  let body: {
    email?: unknown
    token?: unknown
    new_password?: unknown
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ── Modo: complete reset ─────────────────────────────────────────────────
  if (typeof body.token === 'string') {
    if (typeof body.new_password !== 'string') {
      return NextResponse.json({ error: 'new_password requerido' }, { status: 400 })
    }
    const result = await completePasswordReset({
      token: body.token,
      newPassword: body.new_password,
    })
    if ('code' in result) {
      const status = result.code === 'expired_token' || result.code === 'invalid_token' ? 400 : 500
      return NextResponse.json({ error: errorMessage(result.code), code: result.code }, { status })
    }
    return NextResponse.json({ ok: true })
  }

  // ── Modo: request reset ──────────────────────────────────────────────────
  if (typeof body.email !== 'string') {
    return NextResponse.json({ error: 'email requerido' }, { status: 400 })
  }

  const storeId = await getStoreId()
  const store = await getStoreConfig().catch(() => null)
  const baseUrl =
    store?.base_url ?? process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  await requestPasswordReset({
    storeId,
    email: body.email,
    storeName: store?.name ?? 'Tu tienda',
    baseUrl,
  })

  // Respuesta uniforme — no revelamos si el email existía o no
  return NextResponse.json({ ok: true })
}

function errorMessage(code: string): string {
  switch (code) {
    case 'invalid_token':
      return 'Link inválido o ya usado'
    case 'expired_token':
      return 'Link vencido. Pedí uno nuevo.'
    case 'weak_password':
      return 'La contraseña debe tener entre 6 y 200 caracteres'
    default:
      return 'Error al cambiar la contraseña'
  }
}
