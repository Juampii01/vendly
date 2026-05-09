import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Clientes — Admin' }

// Vista unificada: una fila por email, mergeando datos de ambas tablas.
//   - store_customers: cuentas REGISTRADAS via /cuenta/registro (tienen login,
//     tal vez nunca compraron). Tabla introducida por el hardening tenant-aislado.
//   - customers: buyers DERIVADOS del checkout (existieron porque alguien
//     completó una compra; pueden no tener cuenta registrada).
//
// Antes esta página solo leía `customers` y por eso "no se veían las nuevas
// cuentas que se crean" — los registrados sin compras estaban invisibles.
interface UnifiedCustomer {
  email: string
  full_name: string
  registered: boolean   // true si tiene cuenta en store_customers
  total_orders: number
  total_spent: number
  city: string | null
  state: string | null
  created_at: string
}

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string }>
}) {
  const { busqueda } = await searchParams
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  const [{ data: registered }, { data: buyers }] = await Promise.all([
    supabase
      .from('store_customers')
      .select('email, full_name, created_at')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('customers')
      .select('email, full_name, total_orders, total_spent, address_city, address_state, created_at')
      .eq('store_id', storeId)
      .order('total_spent', { ascending: false })
      .limit(500),
  ])

  // Merge por email (case-insensitive). store_customers tiene prioridad para
  // nombre porque es el que el usuario ingresó al registrarse; customers tiene
  // los datos de pedidos.
  const byEmail = new Map<string, UnifiedCustomer>()
  for (const r of registered ?? []) {
    if (!r.email) continue
    byEmail.set(r.email.toLowerCase(), {
      email: r.email,
      full_name: r.full_name ?? r.email.split('@')[0],
      registered: true,
      total_orders: 0,
      total_spent: 0,
      city: null, state: null,
      created_at: r.created_at,
    })
  }
  for (const b of buyers ?? []) {
    if (!b.email) continue
    const key = b.email.toLowerCase()
    const existing = byEmail.get(key)
    if (existing) {
      existing.total_orders = b.total_orders ?? 0
      existing.total_spent = b.total_spent ?? 0
      existing.city = b.address_city
      existing.state = b.address_state
    } else {
      byEmail.set(key, {
        email: b.email,
        full_name: b.full_name ?? b.email.split('@')[0],
        registered: false,
        total_orders: b.total_orders ?? 0,
        total_spent: b.total_spent ?? 0,
        city: b.address_city,
        state: b.address_state,
        created_at: b.created_at,
      })
    }
  }

  let customers = [...byEmail.values()]

  if (busqueda) {
    const q = busqueda.toLowerCase()
    customers = customers.filter(c =>
      c.email.toLowerCase().includes(q) || c.full_name.toLowerCase().includes(q),
    )
  }

  // Orden: primero los que más compraron, después los registrados sin compras
  customers.sort((a, b) => (b.total_spent - a.total_spent) || (b.created_at.localeCompare(a.created_at)))

  const totalRegistered = customers.filter(c => c.registered).length
  const totalBuyers     = customers.filter(c => c.total_orders > 0).length

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span><strong className="text-slate-900">{customers.length}</strong> en total</span>
          <span className="text-slate-300">·</span>
          <span><strong className="text-slate-900">{totalRegistered}</strong> con cuenta</span>
          <span className="text-slate-300">·</span>
          <span><strong className="text-slate-900">{totalBuyers}</strong> compraron</span>
        </div>
      </div>

      {/* Search */}
      <form className="mb-5">
        <div className="relative max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center opacity-40">
            <SearchIcon />
          </span>
          <input
            type="search"
            name="busqueda"
            defaultValue={busqueda}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </form>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {!customers.length ? (
          <div className="py-16 text-center text-sm text-slate-400">
            {busqueda ? 'No se encontraron clientes' : 'Todavía no hay clientes'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Estado</th>
                <th className="px-5 py-3 text-left hidden lg:table-cell">Ciudad</th>
                <th className="px-5 py-3 text-right hidden md:table-cell">Órdenes</th>
                <th className="px-5 py-3 text-right">Total gastado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.email} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{customer.full_name}</p>
                    <p className="text-xs text-slate-400">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      {customer.registered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                          <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          Cuenta
                        </span>
                      )}
                      {customer.total_orders > 0 && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                          Compró
                        </span>
                      )}
                      {!customer.registered && customer.total_orders === 0 && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500">
                    {customer.city
                      ? `${customer.city}${customer.state ? ', ' + customer.state : ''}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right hidden md:table-cell text-slate-700 font-medium">
                    {customer.total_orders}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                    {customer.total_spent > 0 ? formatPrice(customer.total_spent) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/ordenes?status=approved&email=${encodeURIComponent(customer.email)}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors">
                      Ver órdenes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function SearchIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
}
