/**
 * Plan limits + usage tracking.
 *
 * Convierte el campo `plan` de store_config (que era un string sin
 * enforcement) en límites reales para los recursos que mueven costo:
 * llamadas a IA, emails enviados, WhatsApp.
 *
 * Cuando billing real esté implementado (Stripe / MP suscripciones), el
 * `plan` de cada store reflejará la suscripción activa. Mientras tanto,
 * vos seteás `plan` manualmente desde /platform/stores/[id] y los limits
 * se aplican igual.
 *
 * Para subir/bajar límites: editá PLAN_LIMITS abajo. Para agregar una
 * métrica nueva: agregar a USAGE_KEYS, definir el límite en cada plan,
 * llamar a checkAndTrack(...) desde el endpoint correspondiente.
 */
import { createServiceClient } from '@/lib/supabase/server'

// ─── Plan + usage keys ────────────────────────────────────────────────────

export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'

// Convención: snake_case, agrupar por dominio (ai_*, email_*, wa_*).
// Si agregás una key, definila en PLAN_LIMITS para los 4 planes.
export const USAGE_KEYS = [
  'ai_generate',     // /api/admin/ai/generate
  'ai_design',       // /api/admin/ai/design
  'ai_content',      // /api/admin/ai/content
  'email_sent',      // /api/newsletter + side effects de checkout
  'whatsapp_sent',   // sendOrderConfirmationWA / sendAbandonedCartWA
] as const
export type UsageKey = typeof USAGE_KEYS[number]

// ─── Limits por plan (mensual) ────────────────────────────────────────────
//
// `null` = sin límite. Los números son razonables para empezar — vos los
// ajustás según vayan los costos reales de Anthropic / Resend / 360dialog.
//
// Conversión de "valor que provee el plan" a "costo del usuario":
//   - free     ($0): solo para que probadores vean el producto. Stop-gap.
//   - starter  ($49 USD/mes equivalente): tienda chica que no usa IA mucho
//   - pro      ($199 USD/mes equiv): tienda real, uso intensivo
//   - enterprise ($499+): cualquier cliente custom (sin límite)
//
// Cuando billing real esté wired, estos números se vuelven la promesa
// contractual del plan.

interface PlanLimits {
  ai_generate:   number | null
  ai_design:     number | null
  ai_content:    number | null
  email_sent:    number | null
  whatsapp_sent: number | null
  // Caps de catálogo (no son por-mes, se chequean contra COUNT actual)
  products_max:  number | null
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    ai_generate:    20,
    ai_design:       5,
    ai_content:     20,
    email_sent:    100,
    whatsapp_sent:  50,
    products_max:   20,
  },
  starter: {
    ai_generate:   200,
    ai_design:      50,
    ai_content:    200,
    email_sent:   1000,
    whatsapp_sent: 500,
    products_max:  200,
  },
  pro: {
    ai_generate:  2000,
    ai_design:     500,
    ai_content:   2000,
    email_sent:  10000,
    whatsapp_sent: 5000,
    products_max:  null,
  },
  enterprise: {
    ai_generate:   null,
    ai_design:     null,
    ai_content:    null,
    email_sent:    null,
    whatsapp_sent: null,
    products_max:  null,
  },
}

// ─── Period helpers ────────────────────────────────────────────────────────

/** Formato YYYYMM del mes actual en UTC. Mantenerlo UTC para consistencia
 *  cross-tenant (sino un store en MX y otro en AR cuentan distinto). */
export function currentPeriod(now: Date = new Date()): string {
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  return `${yyyy}${mm}`
}

// ─── Core: check + track ──────────────────────────────────────────────────

export interface CheckResult {
  allowed: boolean
  used: number
  /** Límite del plan, o null si es ilimitado */
  limit: number | null
  plan: Plan
}

/** Lee el plan del store. Default: 'free' si no está setteado. */
async function getStorePlan(storeId: string): Promise<Plan> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('store_config')
    .select('plan')
    .eq('id', storeId)
    .single()
  const plan = (data?.plan as Plan | undefined) ?? 'free'
  return plan in PLAN_LIMITS ? plan : 'free'
}

/** Lee el uso actual (no incrementa). Útil para mostrar progreso. */
export async function readUsage(
  storeId: string,
  key: UsageKey,
  period = currentPeriod(),
): Promise<number> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('usage_tracking')
    .select('count')
    .eq('store_id', storeId)
    .eq('period', period)
    .eq('key', key)
    .maybeSingle()
  return data?.count ?? 0
}

/** Snapshot de TODO el uso del mes para un store. Útil para el widget de admin. */
export async function readUsageAll(
  storeId: string,
  period = currentPeriod(),
): Promise<Record<UsageKey, number>> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('usage_tracking')
    .select('key, count')
    .eq('store_id', storeId)
    .eq('period', period)
  const result = Object.fromEntries(USAGE_KEYS.map(k => [k, 0])) as Record<UsageKey, number>
  for (const row of data ?? []) {
    if (row.key in result) result[row.key as UsageKey] = row.count
  }
  return result
}

/** Solo chequea si está permitido (sin trackear). */
export async function checkLimit(
  storeId: string,
  key: UsageKey,
): Promise<CheckResult> {
  const plan = await getStorePlan(storeId)
  const limit = PLAN_LIMITS[plan][key]
  const used = await readUsage(storeId, key)
  return {
    allowed: limit === null || used < limit,
    used, limit, plan,
  }
}

/**
 * Patrón principal: chequear ANTES de procesar, trackear DESPUÉS de éxito.
 *
 * Devuelve { allowed: false, ... } si el caller NO debe procesar la request.
 * Si allowed=true, el caller procesa y después llama trackUsage() para
 * incrementar el contador.
 *
 * No incrementamos antes de procesar para evitar inflar el contador con
 * requests que fallaron por otra razón (rate limit upstream, panic, etc.)
 */
export async function precheck(
  storeId: string,
  key: UsageKey,
): Promise<CheckResult> {
  return checkLimit(storeId, key)
}

/** Atomic increment via RPC. Llamar SOLO después de que la operación
 *  expensive (la llamada a IA, el send de email, etc.) haya tenido éxito. */
export async function trackUsage(
  storeId: string,
  key: UsageKey,
  delta = 1,
): Promise<void> {
  const supabase = createServiceClient()
  const { error } = await supabase.rpc('increment_usage', {
    p_store_id: storeId,
    p_period: currentPeriod(),
    p_key: key,
    p_delta: delta,
  })
  // No bloqueamos si el tracking falla — la operación principal ya tuvo
  // éxito. Loguear y seguir.
  if (error) console.error('[plan-limits] trackUsage failed:', { storeId, key, error })
}

// ─── Helper para route handlers ───────────────────────────────────────────

/**
 * One-liner para route handlers. Retorna `null` si está permitido (caller
 * sigue), o un objeto `{ status, body }` con el 429 listo para devolver.
 *
 * Uso típico:
 *   const limited = await guardLimit(storeId, 'ai_generate')
 *   if (limited) return NextResponse.json(limited.body, { status: limited.status })
 *   // ... procesar ...
 *   await trackUsage(storeId, 'ai_generate')
 */
export async function guardLimit(
  storeId: string,
  key: UsageKey,
): Promise<null | { status: 429; body: { error: string; plan: Plan; used: number; limit: number } }> {
  const result = await checkLimit(storeId, key)
  if (result.allowed) return null
  return {
    status: 429,
    body: {
      error: `Límite de plan alcanzado para "${key}". Usaste ${result.used}/${result.limit} este mes.`,
      plan: result.plan,
      used: result.used,
      limit: result.limit ?? 0,
    },
  }
}
