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
    { count: totalProducts },
  ] = await Promise.all([
    supabase.from('orders').select('total, payment_status').eq('store_id', storeId).gte('created_at', todayStart.toISOString()),
    supabase.from('orders').select('payment_status').eq('store_id', storeId),
    supabase.from('abandoned_carts').select('*', { count: 'exact', head: true }).eq('store_id', storeId).eq('recovered', false),
    supabase.from('orders').select('id, buyer_name, buyer_email, total, status, payment_status, created_at').eq('store_id', storeId).order('created_at', { ascending: false }).limit(5),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('store_id', storeId),
    supabase.from('orders').select('total, payment_status, created_at').eq('store_id', storeId).eq('payment_status', 'approved').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('store_id', storeId).eq('is_active', true),
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
    date, revenue: v.revenue, orders: v.orders,
  }))

  const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1)

  const isRealEstate = store.site_type === 'real-estate'

  return (
    <div className="min-h-full bg-slate-50">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-100 bg-white px-6 py-5 md:px-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{todayCap}</p>
            <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/productos/nuevo"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-slate-700"
            >
              <PlusIcon />
              {isRealEstate ? 'Nuevo inmueble' : 'Nuevo producto'}
            </Link>
            <Link
              href="/admin/configuracion"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-50"
            >
              <SettingsIcon />
              Configuración
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">

        {/* ── Métricas ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            title="Órdenes hoy"
            value={countToday}
            subtitle="pagos aprobados"
            icon={<ShoppingIcon />}
            accent={store.color_accent || store.color_primary}
          />
          <MetricCard
            title="Revenue hoy"
            value={formatPrice(revenueToday)}
            subtitle="pagos aprobados"
            icon={<MoneyIcon />}
            accent="#10b981"
          />
          <MetricCard
            title={isRealEstate ? 'Consultas' : 'Carritos abandonados'}
            value={abandonedCount ?? 0}
            subtitle="sin recuperar"
            icon={<CartIcon />}
            accent="#f59e0b"
          />
          <MetricCard
            title="Conversión"
            value={`${conversionRate}%`}
            subtitle={`${totalCustomers ?? 0} clientes`}
            icon={<TrendIcon />}
            accent="#8b5cf6"
          />
        </div>

        {/* ── Segunda fila: gráfico + stats rápidas ──────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">

          {/* Gráfico */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Últimos 30 días</p>
                <h2 className="mt-0.5 text-sm font-black text-slate-900">Revenue acumulado</h2>
              </div>
              <Link href="/admin/ordenes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
                Ver órdenes →
              </Link>
            </div>
            <RevenueChart data={chartData} accent={store.color_accent || store.color_primary} />
          </div>

          {/* Quick stats */}
          <div className="flex flex-col gap-4">
            <QuickStatCard
              label={isRealEstate ? 'Inmuebles activos' : 'Productos activos'}
              value={totalProducts ?? 0}
              href="/admin/productos"
              accent={store.color_accent || store.color_primary}
            />
            <QuickStatCard
              label="Clientes totales"
              value={totalCustomers ?? 0}
              href="/admin/clientes"
              accent="#10b981"
            />
            <QuickStatCard
              label="Órdenes totales"
              value={totalOrders}
              href="/admin/ordenes"
              accent="#8b5cf6"
            />
          </div>
        </div>

        {/* ── Últimas órdenes ────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-black text-slate-900">Últimas órdenes</h2>
            <Link href="/admin/ordenes" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors">
              Ver todas →
            </Link>
          </div>

          {(recentOrders ?? []).length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3 opacity-20">📦</p>
              <p className="text-sm font-semibold text-slate-400">Todavía no hay órdenes</p>
              <p className="text-xs text-slate-300 mt-1">Las nuevas órdenes aparecerán aquí</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Orden</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hidden sm:table-cell">Cliente</th>
                  <th className="px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hidden md:table-cell">Estado</th>
                  <th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(recentOrders ?? []).map((order: {
                  id: string; buyer_name: string; buyer_email: string
                  total: number; status: string; payment_status: string; created_at: string
                }) => (
                  <tr key={order.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/ordenes?id=${order.id}`}
                        className="font-mono text-xs font-bold text-slate-800 hover:text-slate-900 group-hover:underline"
                      >
                        #{order.id.slice(0, 8).toUpperCase()}
                      </Link>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <p className="font-semibold text-slate-800 truncate max-w-[160px]">{order.buyer_name}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{order.buyer_email}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <PaymentBadge status={order.payment_status} />
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-900">
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

// ─── Quick stat card ──────────────────────────────────────────────────────────

function QuickStatCard({ label, value, href, accent }: { label: string; value: number; href: string; accent: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-slate-200 hover:shadow-md"
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-black text-slate-900">{value.toLocaleString('es-AR')}</p>
      </div>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white transition-transform group-hover:scale-110"
        style={{ backgroundColor: accent }}
      >
        →
      </div>
    </Link>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function SettingsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
}
function ShoppingIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
}
function MoneyIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
}
function CartIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
}
function TrendIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
}
