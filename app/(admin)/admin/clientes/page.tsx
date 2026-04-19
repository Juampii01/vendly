import { createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { formatPrice } from '@/lib/format'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Customer } from '@/types'

export const metadata: Metadata = { title: 'Clientes — Admin' }

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ busqueda?: string }>
}) {
  const { busqueda } = await searchParams
  const supabase = createServiceClient()
  const storeId = await getStoreId()

  let query = supabase
    .from('customers')
    .select('*')
    .eq('store_id', storeId)
    .order('total_spent', { ascending: false })
    .limit(200)

  if (busqueda) {
    query = query.or(`full_name.ilike.%${busqueda}%,email.ilike.%${busqueda}%`)
  }

  const { data: customers } = await query

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
        <p className="text-sm text-slate-400">{customers?.length ?? 0} registrados</p>
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
        {!customers?.length ? (
          <div className="py-16 text-center text-sm text-slate-400">
            {busqueda ? 'No se encontraron clientes' : 'Todavía no hay clientes'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left hidden sm:table-cell">Ciudad</th>
                <th className="px-5 py-3 text-right hidden md:table-cell">Órdenes</th>
                <th className="px-5 py-3 text-right">Total gastado</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(customers as Customer[]).map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-800">{customer.full_name}</p>
                    <p className="text-xs text-slate-400">{customer.email}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-slate-500">
                    {customer.address_city
                      ? `${customer.address_city}, ${customer.address_state ?? ''}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-right hidden md:table-cell text-slate-700 font-medium">
                    {customer.total_orders ?? 0}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900">
                    {formatPrice(customer.total_spent ?? 0)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/admin/ordenes?status=approved&email=${encodeURIComponent(customer.email)}`}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                    >
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
