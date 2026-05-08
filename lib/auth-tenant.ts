/**
 * Auth multi-tenant aislada por store.
 *
 * Supabase Auth tiene email UNIQUE global por proyecto. Para que el mismo email
 * pueda registrarse en distintos stores como cuentas independientes, guardamos
 * un email "interno" opaco en `auth.users` y el email REAL del usuario en
 * `store_customers.email`, indexado por `(store_id, email)`.
 *
 * Diccionario:
 *   email REAL    = lo que el usuario tipea, ej: juan@gmail.com
 *   email INTERNO = identificador opaco en auth.users:
 *                   t-{storeShortId}-{randomHex}@vendly.internal
 *
 * Flujos:
 *   register(storeId, email, password)
 *     ├─ verifica que (storeId, email) no exista en store_customers
 *     ├─ genera email interno
 *     ├─ admin.createUser({ email: interno, password, email_confirm: true })
 *     ├─ inserta en store_customers
 *     └─ devuelve { ok, internalEmail } — el caller puede signinWithPassword(interno)
 *
 *   login(storeId, email, password)
 *     ├─ lookup store_customers por (storeId, email)
 *     ├─ si no → 401 (sin distinción entre "no existe" y "password mala")
 *     ├─ resuelve internalEmail vía admin.getUserById
 *     └─ signinWithPassword({ email: interno, password })
 *
 *   requestReset(storeId, email)
 *     ├─ lookup; si no encuentra, igual responde OK (anti-enumeration)
 *     ├─ genera token random + guarda hash en store_password_reset_tokens
 *     ├─ envía email a `email REAL` con link a {storeBaseUrl}/cuenta/reset?token=...
 *
 *   completeReset(token, newPassword)
 *     ├─ resuelve token → auth_user_id
 *     ├─ admin.updateUserById(auth_user_id, { password: newPassword })
 *     └─ marca token usado
 */

import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomBytes, createHash } from 'crypto'
import { Resend } from 'resend'
import { getResendApiKey, getResendFromDomain } from '@/lib/tenant-credentials'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente con service_role para operaciones de admin (createUser, updateUserById, etc.)
function adminClient() {
  return createSupabaseClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INTERNAL_EMAIL_DOMAIN = 'vendly.internal'

/** Email opaco de la forma `t-{storeId8}-{hex24}@vendly.internal`. */
function generateInternalEmail(storeId: string): string {
  const storeShort = storeId.replace(/-/g, '').slice(0, 8)
  const token = randomBytes(12).toString('hex')
  return `t-${storeShort}-${token}@${INTERNAL_EMAIL_DOMAIN}`
}

/** SHA-256 de un token. Nunca guardamos el plaintext. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

// ─── Errores tipados ──────────────────────────────────────────────────────────

export type TenantAuthError =
  | { code: 'invalid_email' }
  | { code: 'weak_password' }
  | { code: 'email_taken' }
  | { code: 'invalid_credentials' }
  | { code: 'invalid_token' }
  | { code: 'expired_token' }
  | { code: 'unexpected'; message: string }

export interface TenantAuthOk {
  ok: true
  /** Email interno con el que hay que llamar a `signInWithPassword`. */
  internalEmail: string
  authUserId: string
}

// ─── Validación básica ────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.endsWith(`@${INTERNAL_EMAIL_DOMAIN}`)
}

function validatePassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 6 && password.length <= 200
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerStoreCustomer(params: {
  storeId: string
  email: string
  password: string
  fullName?: string
  phone?: string
}): Promise<TenantAuthOk | TenantAuthError> {
  const email = normalizeEmail(params.email)
  if (!validateEmail(email)) return { code: 'invalid_email' }
  if (!validatePassword(params.password)) return { code: 'weak_password' }

  const supabase = adminClient()

  // ── 1. Verificar que (storeId, email) no exista ───────────────────────────
  const { data: existing } = await supabase
    .from('store_customers')
    .select('id')
    .eq('store_id', params.storeId)
    .ilike('email', email)
    .maybeSingle()

  if (existing) return { code: 'email_taken' }

  // ── 2. Crear auth.user con email interno opaco ────────────────────────────
  const internalEmail = generateInternalEmail(params.storeId)
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: internalEmail,
    password: params.password,
    email_confirm: true, // bypaseamos confirmation: el email interno no es entregable
    user_metadata: { full_name: params.fullName ?? null, store_id: params.storeId },
  })

  if (createErr || !created.user) {
    console.error('[auth-tenant] admin.createUser error:', createErr)
    return { code: 'unexpected', message: createErr?.message ?? 'createUser failed' }
  }

  // ── 3. Insertar en store_customers con el email REAL ──────────────────────
  // Las migraciones más nuevas agregan columnas opcionales (phone, full_name).
  // Si el deploy aún no las aplicó, PostgREST devuelve PGRST204 con el nombre
  // de la columna en el message. Reintentamos removiendo solo esa columna,
  // hasta 3 veces, para conservar el resto de los datos.
  const REQUIRED_KEYS = new Set(['store_id', 'auth_user_id', 'email'])
  const row: Record<string, unknown> = {
    store_id: params.storeId,
    auth_user_id: created.user.id,
    email,
    full_name: params.fullName ?? null,
    ...(params.phone ? { phone: params.phone } : {}),
  }

  let insertErr = (await supabase.from('store_customers').insert(row)).error
  for (let attempts = 0; insertErr?.code === 'PGRST204' && attempts < 3; attempts++) {
    // Extraer la columna del message: "Could not find the 'phone' column..."
    const match = insertErr.message.match(/'([^']+)' column/)
    const missingCol = match?.[1]
    if (!missingCol || REQUIRED_KEYS.has(missingCol) || !(missingCol in row)) break
    delete row[missingCol]
    insertErr = (await supabase.from('store_customers').insert(row)).error
  }

  if (insertErr) {
    console.error('[auth-tenant] insert store_customers error:', insertErr)
    // Rollback: borramos el auth user creado para no dejar huérfano
    await supabase.auth.admin.deleteUser(created.user.id).catch(() => {})
    if (insertErr.code === '23505') return { code: 'email_taken' }
    return { code: 'unexpected', message: insertErr.message }
  }

  return { ok: true, internalEmail, authUserId: created.user.id }
}

// ─── Login (resolve email real → interno) ─────────────────────────────────────

export async function resolveInternalEmail(params: {
  storeId: string
  email: string
}): Promise<{ internalEmail: string; authUserId: string } | null> {
  const email = normalizeEmail(params.email)
  if (!validateEmail(email)) return null

  const supabase = adminClient()
  const { data: customer } = await supabase
    .from('store_customers')
    .select('auth_user_id')
    .eq('store_id', params.storeId)
    .ilike('email', email)
    .maybeSingle()

  if (!customer) return null

  const { data: authData, error } = await supabase.auth.admin.getUserById(customer.auth_user_id)
  if (error || !authData.user?.email) return null

  return { internalEmail: authData.user.email, authUserId: customer.auth_user_id }
}

// ─── Password reset request ───────────────────────────────────────────────────

const TOKEN_BYTES = 32
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora

export async function requestPasswordReset(params: {
  storeId: string
  email: string
  storeName: string
  baseUrl: string
}): Promise<{ ok: true }> {
  // SIEMPRE devolvemos ok para no revelar si el email existe (anti-enumeration).
  const email = normalizeEmail(params.email)
  if (!validateEmail(email)) return { ok: true }

  const supabase = adminClient()
  const { data: customer } = await supabase
    .from('store_customers')
    .select('auth_user_id')
    .eq('store_id', params.storeId)
    .ilike('email', email)
    .maybeSingle()

  if (!customer) return { ok: true } // no enumeramos

  // Generar token plaintext + hash
  const token = randomBytes(TOKEN_BYTES).toString('base64url')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString()

  await supabase.from('store_password_reset_tokens').insert({
    store_id: params.storeId,
    auth_user_id: customer.auth_user_id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  })

  // Mandar email con link al email REAL — usando Resend del store
  const apiKey = await getResendApiKey(params.storeId).catch(() => null)
  const domain = await getResendFromDomain(params.storeId).catch(() => null)
  if (apiKey && domain) {
    try {
      const resend = new Resend(apiKey)
      const resetUrl = `${params.baseUrl}/cuenta/reset?token=${encodeURIComponent(token)}`
      await resend.emails.send({
        from: `${params.storeName} <noreply@${domain}>`,
        to: email,
        subject: `Restablecer tu contraseña en ${params.storeName}`,
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
            <h1 style="font-size:20px;font-weight:900;margin-bottom:12px">Restablecer contraseña</h1>
            <p style="font-size:14px;color:#555;line-height:1.6;margin-bottom:24px">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en
              <strong>${params.storeName}</strong>. Si vos hiciste el pedido, hacé click acá:
            </p>
            <p style="margin-bottom:24px">
              <a href="${resetUrl}"
                style="display:inline-block;background:#111;color:#fff;padding:14px 28px;text-decoration:none;font-size:13px;font-weight:700">
                Cambiar contraseña
              </a>
            </p>
            <p style="font-size:12px;color:#888;line-height:1.5">
              El link vence en 1 hora. Si no fuiste vos, podés ignorar este mensaje —
              tu cuenta está segura.
            </p>
          </div>
        `,
      })
    } catch (e) {
      console.error('[auth-tenant] reset email failed', e)
      // No revelamos al cliente; el token igual queda generado por si configura mail después
    }
  }

  return { ok: true }
}

// ─── Password reset complete ──────────────────────────────────────────────────

export async function completePasswordReset(params: {
  token: string
  newPassword: string
}): Promise<{ ok: true } | TenantAuthError> {
  if (!validatePassword(params.newPassword)) return { code: 'weak_password' }

  const tokenHash = hashToken(params.token)
  const supabase = adminClient()

  const { data: row } = await supabase
    .from('store_password_reset_tokens')
    .select('id, auth_user_id, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!row) return { code: 'invalid_token' }
  if (row.used_at) return { code: 'invalid_token' }
  if (new Date(row.expires_at) < new Date()) return { code: 'expired_token' }

  const { error: updateErr } = await supabase.auth.admin.updateUserById(row.auth_user_id, {
    password: params.newPassword,
  })
  if (updateErr) return { code: 'unexpected', message: updateErr.message }

  await supabase
    .from('store_password_reset_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id)

  return { ok: true }
}
