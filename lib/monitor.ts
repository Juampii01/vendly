import 'server-only'
import { createServiceClient } from '@/lib/supabase/server'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'
const IS_DEV = process.env.NODE_ENV === 'development'

export interface CheckResult {
  name: string
  label: string
  category: 'page' | 'api' | 'seo' | 'integration'
  ok: boolean
  warning?: boolean   // true = no configurado (esperado), false/undefined = error real
  ms: number
  httpStatus?: number
  message?: string
}

export interface StoreHealth {
  id: string
  name: string
  slug: string
  url: string
  checks: CheckResult[]
  summary: { total: number; ok: number; failing: number }
}

export interface MultiHealthData {
  timestamp: string
  integrations: CheckResult[]
  stores: StoreHealth[]
  summary: { total: number; ok: number; failing: number; warnings: number; stores_failing: number }
}

// ─── HTTP check ───────────────────────────────────────────────────────────────

async function httpCheck(
  name: string,
  label: string,
  category: CheckResult['category'],
  url: string,
  expectedStatuses: number[],
): Promise<CheckResult> {
  const start = Date.now()
  try {
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers: { 'x-monitor': '1' },
    })
    const ms = Date.now() - start
    const ok = expectedStatuses.includes(res.status)
    return {
      name, label, category, ok, ms,
      httpStatus: res.status,
      message: ok ? undefined : `HTTP ${res.status} (esperado: ${expectedStatuses.join(' | ')})`,
    }
  } catch (e) {
    const ms = Date.now() - start
    const msg = e instanceof Error ? e.message : String(e)
    return { name, label, category, ok: false, ms, message: msg }
  }
}

// ─── Checks por store ─────────────────────────────────────────────────────────

function storeBaseUrl(slug: string, baseUrl: string | null): string {
  if (IS_DEV) return `http://${slug}.localhost:3000`
  return baseUrl ?? `https://${slug}.${ROOT_DOMAIN}`
}

async function runStoreChecks(slug: string, url: string): Promise<CheckResult[]> {
  const PAGE_CHECKS = [
    { name: 'page_home',     label: 'Home (/)',               url: `${url}/`,            statuses: [200, 307] },
    { name: 'page_products', label: 'Productos (/productos)',  url: `${url}/productos`,   statuses: [200] },
    { name: 'page_cart',     label: 'Carrito (/carrito)',     url: `${url}/carrito`,     statuses: [200] },
    { name: 'page_checkout', label: 'Checkout (/checkout)',   url: `${url}/checkout`,    statuses: [200] },
  ] as const

  const SEO_CHECKS = [
    { name: 'seo_sitemap',  label: 'Sitemap',   url: `${url}/sitemap.xml`,          statuses: [200] },
    { name: 'seo_robots',   label: 'Robots',    url: `${url}/robots.txt`,           statuses: [200] },
    { name: 'pwa_manifest', label: 'Manifest',  url: `${url}/manifest.webmanifest`, statuses: [200] },
  ] as const

  const API_CHECKS = [
    { name: 'api_checkout', label: 'API Checkout',   url: `${url}/api/checkout`,    statuses: [405] },
    { name: 'api_webhook',  label: 'API Webhook MP', url: `${url}/api/webhooks/mp`, statuses: [200] },
  ] as const

  const prefix = slug // para evitar colisión de nombres entre stores
  const [pages, seo, apis] = await Promise.all([
    Promise.all(PAGE_CHECKS.map(c => httpCheck(`${prefix}:${c.name}`, c.label, 'page', c.url, [...c.statuses]))),
    Promise.all(SEO_CHECKS.map(c => httpCheck(`${prefix}:${c.name}`, c.label, 'seo', c.url, [...c.statuses]))),
    Promise.all(API_CHECKS.map(c => httpCheck(`${prefix}:${c.name}`, c.label, 'api', c.url, [...c.statuses]))),
  ])

  return [...pages, ...seo, ...apis]
}

// ─── Integration checks (compartidas, una sola vez) ───────────────────────────

async function checkSupabase(): Promise<CheckResult> {
  const name = 'supabase'
  const label = 'Supabase DB'
  const start = Date.now()
  try {
    const { error } = await createServiceClient().from('store_config').select('id').limit(1)
    const ms = Date.now() - start
    if (error) return { name, label, category: 'integration', ok: false, ms, message: error.message }
    return { name, label, category: 'integration', ok: true, ms }
  } catch (e) {
    return { name, label, category: 'integration', ok: false, ms: Date.now() - start, message: String(e) }
  }
}

async function checkMercadoPago(): Promise<CheckResult> {
  const name = 'mercadopago'
  const label = 'MercadoPago API'
  const token = process.env.MP_ACCESS_TOKEN ?? process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) return { name, label, category: 'integration', ok: false, warning: true, ms: 0, message: 'Token no configurado' }
  const start = Date.now()
  try {
    const res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8_000),
    })
    const ms = Date.now() - start
    return { name, label, category: 'integration', ok: res.ok, ms, httpStatus: res.status, message: res.ok ? undefined : `HTTP ${res.status}` }
  } catch (e) {
    return { name, label, category: 'integration', ok: false, ms: Date.now() - start, message: String(e) }
  }
}

async function checkResend(): Promise<CheckResult> {
  const name = 'resend'
  const label = 'Resend Email'
  const key = process.env.RESEND_API_KEY
  if (!key) return { name, label, category: 'integration', ok: false, warning: true, ms: 0, message: 'API key no configurada' }
  const start = Date.now()
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8_000),
    })
    const ms = Date.now() - start
    return { name, label, category: 'integration', ok: res.ok, ms, httpStatus: res.status, message: res.ok ? undefined : `HTTP ${res.status}` }
  } catch (e) {
    return { name, label, category: 'integration', ok: false, ms: Date.now() - start, message: String(e) }
  }
}

// ─── Runner multi-store ───────────────────────────────────────────────────────

export async function runMultiStoreHealth(): Promise<MultiHealthData> {
  const service = createServiceClient()

  // Cargar todos los stores activos
  const { data: storeRows } = await service
    .from('store_config')
    .select('id, name, slug, base_url, status')
    .eq('status', 'active')
    .order('name', { ascending: true })

  const stores = storeRows ?? []

  // Checks en paralelo: integraciones + todas las stores
  const [integrations, ...storeResults] = await Promise.all([
    Promise.all([checkSupabase(), checkMercadoPago(), checkResend()]),
    ...stores.map(async (s) => {
      const url = storeBaseUrl(s.slug, s.base_url)
      const checks = await runStoreChecks(s.slug, url)
      const failing = checks.filter(c => !c.ok).length
      return {
        id: s.id,
        name: s.name,
        slug: s.slug,
        url,
        checks,
        summary: { total: checks.length, ok: checks.length - failing, failing },
      } satisfies StoreHealth
    }),
  ])

  const allChecks = [...integrations, ...storeResults.flatMap(s => s.checks)]
  // Solo errores reales (no warnings de "no configurado")
  const totalFailing = allChecks.filter(c => !c.ok && !c.warning).length
  const totalWarnings = allChecks.filter(c => !c.ok && c.warning).length
  const storesFailing = storeResults.filter(s => s.summary.failing > 0).length

  return {
    timestamp: new Date().toISOString(),
    integrations,
    stores: storeResults,
    summary: {
      total: allChecks.length,
      ok: allChecks.filter(c => c.ok).length,
      failing: totalFailing,
      warnings: totalWarnings,
      stores_failing: storesFailing,
    },
  }
}

// ─── Legacy single-store (mantener compatibilidad con /api/dev/health) ────────

export async function runAllChecks(baseUrl: string): Promise<CheckResult[]> {
  const slug = 'default'
  const [checks, supabase, mp, resend] = await Promise.all([
    runStoreChecks(slug, baseUrl),
    checkSupabase(),
    checkMercadoPago(),
    checkResend(),
  ])
  return [...checks, supabase, mp, resend]
}
