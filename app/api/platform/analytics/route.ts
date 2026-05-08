import 'server-only'
import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requirePlatformAccess } from '@/lib/auth'

export async function GET(req: Request) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { searchParams } = new URL(req.url)
  const days = Math.min(parseInt(searchParams.get('days') ?? '30'), 90)

  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceISO = since.toISOString()

  const supabase = createServiceClient()

  const [
    { data: stores },
    { data: recentOrders },
    { count: totalOrders },
  ] = await Promise.all([
    supabase
      .from('store_config')
      .select('id, name, slug, status, plan, currency, created_at')
      .order('created_at', { ascending: false }),

    // Órdenes recientes con store_id para agrupar
    supabase
      .from('orders')
      .select('id, store_id, total, status, payment_status, created_at')
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),

    // Total histórico
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true }),
  ])

  // Agrupar órdenes por día (últimos N días)
  const ordersByDay: Record<string, number> = {}
  const revenueByDay: Record<string, number> = {}
  const ordersByStore: Record<string, { count: number; revenue: number }> = {}

  for (const o of recentOrders ?? []) {
    const day = o.created_at.slice(0, 10)
    ordersByDay[day] = (ordersByDay[day] ?? 0) + 1
    if (o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered') {
      revenueByDay[day] = (revenueByDay[day] ?? 0) + (o.total ?? 0)
    }

    const storeId = o.store_id
    if (!ordersByStore[storeId]) ordersByStore[storeId] = { count: 0, revenue: 0 }
    ordersByStore[storeId].count += 1
    if (o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered') {
      ordersByStore[storeId].revenue += o.total ?? 0
    }
  }

  // Generar serie de días
  const series: { date: string; orders: number; revenue: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    series.push({
      date: key,
      orders: ordersByDay[key] ?? 0,
      revenue: revenueByDay[key] ?? 0,
    })
  }

  // Combinar stores con sus métricas
  const storesWithMetrics = (stores ?? []).map((s) => ({
    ...s,
    period_orders: ordersByStore[s.id]?.count ?? 0,
    period_revenue: ordersByStore[s.id]?.revenue ?? 0,
  })).sort((a, b) => b.period_orders - a.period_orders)

  const periodRevenue = Object.values(revenueByDay).reduce((a, b) => a + b, 0)
  const periodOrders = (recentOrders ?? []).length

  // ─── Platform health (vista del líder de Vendly) ──────────────────────────
  //
  // Estos KPIs miran salud del NEGOCIO Vendly, no de cada tienda. El dashboard
  // de tiendas existente sigue mostrando "revenue por tienda"; esto agrega
  // arriba la fila de salud de la plataforma.
  //
  // MRR estimado: basado en precios de plan asumidos. Cuando billing real
  // esté implementado (Stripe/MP suscripciones), MRR pasa a leerse directo
  // de subscription rows. Por ahora es estimación.

  // Stores by status
  const storesByStatus = { active: 0, inactive: 0, suspended: 0 }
  const storesByPlan = { free: 0, starter: 0, pro: 0, enterprise: 0 }
  for (const s of stores ?? []) {
    const status = s.status as keyof typeof storesByStatus
    if (status in storesByStatus) storesByStatus[status]++
    const plan = s.plan as keyof typeof storesByPlan
    if (plan in storesByPlan) storesByPlan[plan]++
  }

  // MRR estimado en USD (precios de plan ARS-equivalentes). Cuando tengamos
  // billing real, esta sección sale de la tabla subscriptions.
  const PLAN_MRR_USD = { free: 0, starter: 49, pro: 199, enterprise: 499 }
  const mrrEstimate = (Object.keys(storesByPlan) as Array<keyof typeof PLAN_MRR_USD>)
    .reduce((sum, plan) => sum + storesByPlan[plan] * PLAN_MRR_USD[plan], 0)

  // Stores en riesgo: alertas accionables para el líder
  //   - active sin órdenes en el período → tienda viva pero no convierte
  //   - suspended → necesita revisión manual (probablemente impago / abuso)
  //   - alta tasa de rechazos en MP (>50% en el período) → problema de gateway
  const rejectsByStore: Record<string, { rejected: number; total: number }> = {}
  for (const o of recentOrders ?? []) {
    if (!rejectsByStore[o.store_id]) rejectsByStore[o.store_id] = { rejected: 0, total: 0 }
    rejectsByStore[o.store_id].total += 1
    if (o.payment_status === 'rejected') rejectsByStore[o.store_id].rejected += 1
  }

  type RiskStore = {
    id: string; name: string; slug: string; reason: string; severity: 'high' | 'medium'
  }
  const atRisk: RiskStore[] = []
  for (const s of storesWithMetrics) {
    if (s.status === 'suspended') {
      atRisk.push({ id: s.id, name: s.name, slug: s.slug, severity: 'high', reason: 'Suspendida — revisar' })
      continue
    }
    if (s.status === 'active') {
      const rej = rejectsByStore[s.id]
      if (rej && rej.total >= 3 && rej.rejected / rej.total > 0.5) {
        atRisk.push({
          id: s.id, name: s.name, slug: s.slug, severity: 'high',
          reason: `${rej.rejected}/${rej.total} pagos rechazados (>50%) — revisar gateway`,
        })
        continue
      }
      if (s.period_orders === 0) {
        atRisk.push({
          id: s.id, name: s.name, slug: s.slug, severity: 'medium',
          reason: `Sin órdenes en ${days} días — tienda activa pero no convierte`,
        })
      }
    }
  }

  // Stores nuevos en el período (signal de growth)
  const newStoresInPeriod = (stores ?? []).filter(s => s.created_at >= sinceISO).length

  // Volumen total procesado (suma de revenue cross-stores) — ya lo tenemos
  // como periodRevenue, pero acá lo nombramos para que tenga semántica de
  // "GMV de la plataforma" en el dashboard

  return NextResponse.json({
    days,
    total_orders: totalOrders ?? 0,
    period_orders: periodOrders,
    period_revenue: periodRevenue,
    series,
    stores: storesWithMetrics,
    // ── Platform health (vista del líder) ──
    platform: {
      stores_by_status: storesByStatus,
      stores_by_plan: storesByPlan,
      mrr_estimate_usd: mrrEstimate,
      mrr_disclaimer: 'Estimación basada en precios de plan asumidos. Cuando billing real esté implementado, esto se lee de subscription rows.',
      gmv_period: periodRevenue,
      new_stores_in_period: newStoresInPeriod,
      at_risk: atRisk,
    },
  })
}
