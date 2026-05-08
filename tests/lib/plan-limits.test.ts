/**
 * Tests del framework de plan limits + usage tracking.
 *
 * Cubrimos los caminos críticos:
 *   - currentPeriod: formato YYYYMM en UTC
 *   - readUsage / readUsageAll: lee correctamente del usage_tracking
 *   - checkLimit: respeta el plan, retorna allowed/used/limit
 *   - guardLimit: 429 cuando excede, null cuando permite
 *   - trackUsage: llama al RPC con period correcto
 *   - Plans sin enforcement (enterprise) siempre allowed
 *   - Plan default 'free' cuando store no tiene plan setteado
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSupabaseMock, type SupabaseMock } from '../helpers/supabase-mock'

let supabase: SupabaseMock

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => supabase.client,
  createClient: () => supabase.client,
}))

const STORE_A = 'store-a-uuid'

beforeEach(() => {
  supabase = createSupabaseMock()
})

// ════════════════════════════════════════════════════════════════════════════
// Period helpers
// ════════════════════════════════════════════════════════════════════════════

describe('currentPeriod', () => {
  it('devuelve YYYYMM en UTC', async () => {
    const { currentPeriod } = await import('@/lib/plan-limits')
    expect(currentPeriod(new Date('2026-05-08T12:00:00Z'))).toBe('202605')
    expect(currentPeriod(new Date('2026-01-01T00:00:00Z'))).toBe('202601')
    expect(currentPeriod(new Date('2026-12-31T23:59:59Z'))).toBe('202612')
  })

  it('zero-padea meses de un dígito', async () => {
    const { currentPeriod } = await import('@/lib/plan-limits')
    expect(currentPeriod(new Date('2026-03-15T10:00:00Z'))).toBe('202603')
    expect(currentPeriod(new Date('2026-09-15T10:00:00Z'))).toBe('202609')
  })

  it('usa UTC, no la timezone local', async () => {
    const { currentPeriod } = await import('@/lib/plan-limits')
    // 31 de mayo 23:59 UTC sigue siendo mayo (no junio aunque la TZ local sea UTC+X)
    expect(currentPeriod(new Date('2026-05-31T23:59:59Z'))).toBe('202605')
    // 1 de junio 00:00 UTC ya es junio
    expect(currentPeriod(new Date('2026-06-01T00:00:00Z'))).toBe('202606')
  })
})

// ════════════════════════════════════════════════════════════════════════════
// readUsage
// ════════════════════════════════════════════════════════════════════════════

describe('readUsage', () => {
  it('devuelve count si existe la fila', async () => {
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 42 }, error: null })
    const { readUsage } = await import('@/lib/plan-limits')
    expect(await readUsage(STORE_A, 'ai_generate')).toBe(42)
  })

  it('devuelve 0 si la fila no existe', async () => {
    supabase.scriptResponse('usage_tracking', 'select', { data: null, error: null })
    const { readUsage } = await import('@/lib/plan-limits')
    expect(await readUsage(STORE_A, 'ai_generate')).toBe(0)
  })
})

// ════════════════════════════════════════════════════════════════════════════
// checkLimit + guardLimit
// ════════════════════════════════════════════════════════════════════════════

describe('checkLimit', () => {
  it('plan free + uso bajo límite → allowed:true', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'free' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 5 }, error: null })

    const { checkLimit } = await import('@/lib/plan-limits')
    const result = await checkLimit(STORE_A, 'ai_generate')

    expect(result).toMatchObject({
      allowed: true,
      used: 5,
      limit: 20,    // PLAN_LIMITS.free.ai_generate
      plan: 'free',
    })
  })

  it('plan free + uso EXACTO al límite → allowed:false (límite es exclusivo)', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'free' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 20 }, error: null })

    const { checkLimit } = await import('@/lib/plan-limits')
    const result = await checkLimit(STORE_A, 'ai_generate')

    expect(result.allowed).toBe(false)
  })

  it('plan free + uso EXCEDIDO → allowed:false', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'free' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 100 }, error: null })

    const { checkLimit } = await import('@/lib/plan-limits')
    const result = await checkLimit(STORE_A, 'ai_generate')

    expect(result).toMatchObject({ allowed: false, used: 100, limit: 20 })
  })

  it('plan enterprise → siempre allowed (limit es null)', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'enterprise' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 999_999 }, error: null })

    const { checkLimit } = await import('@/lib/plan-limits')
    const result = await checkLimit(STORE_A, 'ai_generate')

    expect(result).toMatchObject({ allowed: true, limit: null, plan: 'enterprise' })
  })

  it('store sin plan setteado → fallback a "free"', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: null }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: null, error: null })

    const { checkLimit } = await import('@/lib/plan-limits')
    const result = await checkLimit(STORE_A, 'ai_generate')

    expect(result.plan).toBe('free')
    expect(result.limit).toBe(20)   // free.ai_generate
  })

  it('plan inválido (string raro en DB) → fallback a "free"', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'platinum_xyz' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: null, error: null })

    const { checkLimit } = await import('@/lib/plan-limits')
    const result = await checkLimit(STORE_A, 'ai_generate')

    expect(result.plan).toBe('free')
  })

  it('chequea diferentes USAGE_KEYS con sus límites correspondientes', async () => {
    // pro: ai_generate=2000, email_sent=10000, ai_design=500
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'pro' }, error: null }, { sticky: true })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 100 }, error: null }, { sticky: true })

    const { checkLimit } = await import('@/lib/plan-limits')
    expect((await checkLimit(STORE_A, 'ai_generate')).limit).toBe(2000)
    expect((await checkLimit(STORE_A, 'email_sent')).limit).toBe(10000)
    expect((await checkLimit(STORE_A, 'ai_design')).limit).toBe(500)
  })
})

describe('guardLimit', () => {
  it('devuelve null cuando está permitido (caller sigue)', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'starter' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 0 }, error: null })

    const { guardLimit } = await import('@/lib/plan-limits')
    expect(await guardLimit(STORE_A, 'ai_generate')).toBeNull()
  })

  it('devuelve { status: 429, body } cuando excede', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'free' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 25 }, error: null })

    const { guardLimit } = await import('@/lib/plan-limits')
    const r = await guardLimit(STORE_A, 'ai_generate')

    expect(r).not.toBeNull()
    expect(r!.status).toBe(429)
    expect(r!.body).toMatchObject({
      plan: 'free',
      used: 25,
      limit: 20,
    })
    expect(r!.body.error).toMatch(/límite de plan/i)
  })

  it('enterprise nunca bloquea', async () => {
    supabase.scriptResponse('store_config', 'select', { data: { plan: 'enterprise' }, error: null })
    supabase.scriptResponse('usage_tracking', 'select', { data: { count: 1_000_000 }, error: null })

    const { guardLimit } = await import('@/lib/plan-limits')
    expect(await guardLimit(STORE_A, 'ai_generate')).toBeNull()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// trackUsage
// ════════════════════════════════════════════════════════════════════════════

describe('trackUsage', () => {
  it('llama a increment_usage RPC con los args correctos', async () => {
    supabase.scriptResponse('increment_usage', 'rpc', { data: 1, error: null })

    const { trackUsage } = await import('@/lib/plan-limits')
    await trackUsage(STORE_A, 'ai_generate')

    const calls = supabase.callsFor('increment_usage', 'rpc')
    expect(calls).toHaveLength(1)
    expect(calls[0].payload).toMatchObject({
      p_store_id: STORE_A,
      p_key: 'ai_generate',
      p_delta: 1,
      p_period: expect.stringMatching(/^\d{6}$/),
    })
  })

  it('soporta delta custom (ej: 10 emails de un batch)', async () => {
    supabase.scriptResponse('increment_usage', 'rpc', { data: 10, error: null })

    const { trackUsage } = await import('@/lib/plan-limits')
    await trackUsage(STORE_A, 'email_sent', 10)

    expect(supabase.callsFor('increment_usage', 'rpc')[0].payload).toMatchObject({
      p_delta: 10,
      p_key: 'email_sent',
    })
  })

  it('NO tira si el RPC falla (tracking es no-bloqueante)', async () => {
    supabase.scriptResponse('increment_usage', 'rpc', {
      data: null,
      error: { message: 'database connection lost' },
    })

    const { trackUsage } = await import('@/lib/plan-limits')
    // No debe tirar excepción — la operación principal del caller ya tuvo éxito
    await expect(trackUsage(STORE_A, 'ai_generate')).resolves.toBeUndefined()
  })
})

// ════════════════════════════════════════════════════════════════════════════
// readUsageAll (snapshot para widget de admin)
// ════════════════════════════════════════════════════════════════════════════

describe('readUsageAll', () => {
  it('devuelve TODAS las USAGE_KEYS, con 0 para las que no tienen fila', async () => {
    supabase.scriptResponse('usage_tracking', 'select', {
      data: [
        { key: 'ai_generate', count: 12 },
        { key: 'email_sent', count: 50 },
      ],
      error: null,
    })

    const { readUsageAll } = await import('@/lib/plan-limits')
    const usage = await readUsageAll(STORE_A)

    // Las keys que tienen fila se reflejan
    expect(usage.ai_generate).toBe(12)
    expect(usage.email_sent).toBe(50)
    // Las que no, devuelven 0 (no undefined)
    expect(usage.ai_design).toBe(0)
    expect(usage.ai_content).toBe(0)
    expect(usage.whatsapp_sent).toBe(0)
  })

  it('ignora keys desconocidas en la DB (forward-compat)', async () => {
    supabase.scriptResponse('usage_tracking', 'select', {
      data: [
        { key: 'ai_generate', count: 5 },
        { key: 'algo_nuevo_no_definido', count: 999 },
      ],
      error: null,
    })

    const { readUsageAll } = await import('@/lib/plan-limits')
    const usage = await readUsageAll(STORE_A)

    expect(usage.ai_generate).toBe(5)
    expect((usage as Record<string, number>).algo_nuevo_no_definido).toBeUndefined()
  })
})
