import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import { MetricCard } from '@/components/admin/MetricCard'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { PaymentBadge } from '@/components/admin/PaymentBadge'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — Admin' }

export default async function AdminDashboardPage() {
  const supabase = createServiceClient()
  const [store, storeId] = await Promise.all([getStoreConfig(), getStoreId()])

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const [
    { data: ordersToday },
    { data: ordersAll },
    { count: abandonedCount },
    { data: recentOrders },
    { count: totalCustomers },
    { data: last30DaysOrders },
  ] = await Promise.all([
    supabase
      .from('orders')
      .select('total, payment_status')
      .eq('store_id', storeId)
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('orders')
      .select('payment_status')
      .eq('store_id', storeId),
    supabase
      .from('abandoned_carts')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('recovered', false),
    supabase
      .from('orders')
      .select('id, buyer_name, buyer_email, total, status, payment_status, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId),
    supabase
      .from('orders')
      .select('total, payment_status, created_at')
      .eq('store_id', storeId)
      .eq('payment_status', 'approved')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true }),
  ])

  type OrderRow = { total?: number; payment_status?: string }
  const approvedToday = (ordersToday ?? []).filter((o: OrderRow) => o.payment_status === 'approved')
  const revenueToday = approvedToday.reduce((s: number, o: OrderRow) => s + (o.total ?? 0), 0)
  const countToday = approvedToday.length

  const totalApproved = (ordersAll ?? []).filter((o: OrderRow) => o.payment_status === 'approved').length
  const totalOrders = (ordersAll ?? []).length
  const conversionRate = totalOrders > 0 ? Math.round((totalApproved / totalOrders) * 100) : 0

  // Agrupar últimos 30 días por fecha
  const dayMap = new Map<string, { revenue: number; orders: number }>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    dayMap.set(key, { revenue: 0, orders: 0 })
  }

  type ChartOrder = { total?: number; payment_status?: string; created_at?: string }
  for (const o of last30DaysOrders ?? [] as ChartOrder[]) {
    const d = new Date(o.created_at!)
    const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
    const entry = dayMap.get(key)
    if (entry) {
      entry.revenue += o.total ?? 0
      entry.orders += 1
    }
  }

  const chartData = Array.from(dayMap.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
  }))

  return (
    <div className="p-6 md:p-8 pt-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          title="Órdenes hoy"
          value={countToday}
          subtitle="pagos aprobados"
          icon={<ShoppingIcon />}
          accent={store.color_primary}
        />
        <MetricCard
          title="Revenue hoy"
          value={formatPrice(revenueToday)}
          subtitle="pagos aprobados"
          icon={<MoneyIcon />}
          accent="#16a34a"
        />
        <MetricCard
          title="Carritos abandonados"
          value={abandonedCount ?? 0}
          subtitle="sin recuperar"
          icon={<CartIcon />}
          accent="#f59e0b"
        />
        <MetricCard
          title="Conversión"
          value={`${conversionRate}%`}
          subtitle={`${totalCustomers ?? 0} clientes totales`}
          icon={<TrendIcon />}
          accent="#8b5cf6"
        />
      </div>

      {/* Gráfico de revenue */}
      <div className="mt-6">
        <RevenueChart data={chartData} accent={store.color_primary} />
      </div>

      {/* Últimas órdenes */}
      <div className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Últimas órdenes</h2>
          <Link href="/admin/ordenes" className="text-sm text-slate-400 hover:text-slate-700 underline underline-offset-4">
            Ver todas
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {(recentOrders ?? []).length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Todavía no hay órdenes
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 text-left">Orden</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Cliente</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Estado</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(recentOrders ?? []).map((order: {
                  id: string; buyer_name: string; buyer_email: string
                  total: number; status: string; payment_status: string; created_at: string
                }) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/ordenes?id=${order.id}`}
                        className="font-mono text-xs font-semibold text-slate-700 hover:underline"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="font-medium text-slate-700 truncate max-w-[160px]">{order.buyer_name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{order.buyer_email}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <PaymentBadge status={order.payment_status} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-900">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function ShoppingIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>
}
function MoneyIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
}
function CartIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" /></svg>
}
function TrendIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
}
