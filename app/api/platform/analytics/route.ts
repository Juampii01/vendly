import 'server-only'
import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

async function requirePlatformAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const service = createServiceClient()
  const { count } = await service
    .from('platform_users')
    .select('*', { count: 'exact', head: true })

  if (!count || count === 0) return user

  const { data } = await service
    .from('platform_users')
    .select('id')
    .eq('email', user.email!)
    .maybeSingle()

  return data ? user : null
}

export async function GET(req: Request) {
  const user = await requirePlatformAccess()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

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
    { data: topStoreOrders },
  ] = await Promise.all([
    supabase
      .from('store_config')
      .select('id, name, slug, status, plan, currency')
      .order('created_at', { ascending: false }),

    // Órdenes recientes con store_id para agrupar
    supabase
      .from('orders')
      .select('id, store_id, total, status, created_at')
      .gte('created_at', sinceISO)
      .order('created_at', { ascending: false }),

    // Total histórico
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true }),

    // Conteo por store en el período
    supabase
      .from('orders')
      .select('store_id')
      .gte('created_at', sinceISO),
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

  return NextResponse.json({
    days,
    total_orders: totalOrders ?? 0,
    period_orders: periodOrders,
    period_revenue: periodRevenue,
    series,
    stores: storesWithMetrics,
  })
}
