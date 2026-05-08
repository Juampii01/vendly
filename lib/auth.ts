import 'server-only'
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AdminRole = 'owner' | 'admin'

export interface AuthedAdmin {
  user: { id: string; email: string }
  storeId: string
  role: AdminRole
  /** true si también tiene acceso de plataforma (operador). */
  isPlatform: boolean
}

export interface AuthedPlatform {
  user: { id: string; email: string }
  role: 'owner' | 'admin'
}

type AuthFailure = { error: NextResponse }

// ─── Helpers internos ─────────────────────────────────────────────────────────

async function getAuthedUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

/**
 * Devuelve el rol del usuario en `admin_users` para el `storeId` dado, o `null`.
 * Comparación de email case-insensitive.
 */
async function getAdminRole(email: string, storeId: string): Promise<AdminRole | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('admin_users')
    .select('role')
    .eq('store_id', storeId)
    .ilike('email', email)
    .maybeSingle()
  return (data?.role as AdminRole | undefined) ?? null
}

/** Devuelve el rol de platform del usuario (operador), o `null`. */
async function getPlatformRole(email: string): Promise<'owner' | 'admin' | null> {
  const service = createServiceClient()
  const { data } = await service
    .from('platform_users')
    .select('role')
    .ilike('email', email)
    .maybeSingle()
  return (data?.role as 'owner' | 'admin' | undefined) ?? null
}

// ─── requireStoreAdmin ────────────────────────────────────────────────────────

/**
 * Garantiza que el caller esté autenticado y sea admin/owner del `storeId`
 * resuelto por hostname/cookie. Los platform_users también pasan (operador
 * de la plataforma puede operar sobre cualquier store).
 *
 * Retorna `{ user, storeId, role, isPlatform }` si OK, o `{ error: NextResponse }` para responder.
 *
 * Uso:
 *   const auth = await requireStoreAdmin()
 *   if ('error' in auth) return auth.error
 *   // auth.user, auth.storeId, auth.role disponibles
 */
export async function requireStoreAdmin(opts?: {
  /** Si se pasa, exige rol específico (ej: 'owner'). */
  role?: AdminRole
}): Promise<AuthedAdmin | AuthFailure> {
  const user = await getAuthedUser()
  if (!user || !user.email) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }

  let storeId: string
  try {
    storeId = await getStoreId()
  } catch {
    return { error: NextResponse.json({ error: 'Store no resuelto' }, { status: 400 }) }
  }

  const [adminRole, platformRole] = await Promise.all([
    getAdminRole(user.email, storeId),
    getPlatformRole(user.email),
  ])

  // Platform users tienen acceso a todos los stores como `owner`
  const effectiveRole: AdminRole | null = adminRole ?? (platformRole ? 'owner' : null)

  if (!effectiveRole) {
    return { error: NextResponse.json({ error: 'Sin acceso a este store' }, { status: 403 }) }
  }

  if (opts?.role === 'owner' && effectiveRole !== 'owner') {
    return { error: NextResponse.json({ error: 'Requiere rol owner' }, { status: 403 }) }
  }

  return {
    user: { id: user.id, email: user.email },
    storeId,
    role: effectiveRole,
    isPlatform: platformRole !== null,
  }
}

// ─── requirePlatformAccess ────────────────────────────────────────────────────

/**
 * Garantiza que el caller sea operador de la plataforma (registrado en `platform_users`).
 *
 * SIN bootstrap-bypass — el bypass abre /platform a cualquier usuario logueado
 * cuando la tabla está vacía. La inicialización del primer platform_user debe
 * hacerse con SQL/CLI, no por self-onboarding.
 */
export async function requirePlatformAccess(): Promise<AuthedPlatform | AuthFailure> {
  const user = await getAuthedUser()
  if (!user || !user.email) {
    return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }

  const role = await getPlatformRole(user.email)
  if (!role) {
    return { error: NextResponse.json({ error: 'Sin acceso a la plataforma' }, { status: 403 }) }
  }

  return { user: { id: user.id, email: user.email }, role }
}

// ─── isAuthorizedCron ─────────────────────────────────────────────────────────

/**
 * Valida `Authorization: Bearer ${CRON_SECRET}`.
 * Si `CRON_SECRET` no está seteado en el entorno, RECHAZA la request.
 *
 * El comportamiento anterior (`return true` cuando no hay secret) dejaba el
 * endpoint público en deploys donde se olvidó configurar la variable.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}
