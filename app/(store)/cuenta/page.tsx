import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mi cuenta' }

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cuenta/login')

  const store = await getStoreConfig()
  const service = createServiceClient()

  // ── Verificar que este usuario tenga cuenta en ESTE store ─────────────────
  //
  // En el modelo tenant-aislado, auth.users.email es opaco (interno). El email
  // REAL del cliente vive en store_customers.email. Buscamos por auth_user_id
  // y usamos ese email REAL para todo lo que el usuario ve.
  //
  const storeId = await getStoreId()
  // No incluimos `phone` en el SELECT — la columna puede no existir en deploys
  // que aún no aplicaron `migration_security_hardening.sql`.
  const { data: storeCustomer } = await service
    .from('store_customers')
    .select('id, email, full_name')
    .eq('store_id', storeId)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!storeCustomer) {
    redirect('/cuenta/login?error=not_registered')
  }

  // Órdenes del cliente por su email REAL
  const { data: orders } = await service
    .from('orders')
    .select('id, status, payment_status, total, created_at, items:order_items(product_name, quantity, unit_price)')
    .eq('store_id', storeId)
    .ilike('buyer_email', storeCustomer.email)
    .order('created_at', { ascending: false })
    .limit(10)

  const customerEmail = storeCustomer.email
  const name: string = storeCustomer.full_name ?? customerEmail.split('@')[0]

  const bg = store.color_background
  const text = store.color_text

  return (
    <div style={{ backgroundColor: bg, color: text }} className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">

        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-1">Bienvenida</p>
            <h1 className="text-3xl font-black uppercase tracking-tight">{name}</h1>
            <p className="text-sm opacity-50 mt-1">{customerEmail}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-xs font-semibold uppercase tracking-wider opacity-40 hover:opacity-80 transition-opacity"
            >
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Órdenes */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] opacity-40 mb-4">
            Mis órdenes
          </h2>

          {(!orders || orders.length === 0) ? (
            <div className="border py-12 text-center" style={{ borderColor: `${text}10` }}>
              <p className="text-sm opacity-40 mb-4">Todavía no realizaste ningún pedido.</p>
              <Link
                href="/productos"
                className="text-xs font-black uppercase tracking-[0.15em] px-6 py-3 inline-block transition-opacity hover:opacity-80"
                style={{ backgroundColor: store.color_primary, color: store.color_background }}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: {
                id: string
                status: string
                payment_status: string
                total: number
                created_at: string
                items: { product_name: string; quantity: number; unit_price: number }[]
              }) => (
                <div
                  key={order.id}
                  className="border p-5"
                  style={{ borderColor: `${text}10` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs font-bold opacity-50">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs opacity-40 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('es-AR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black">{formatPrice(order.total)}</p>
                      <PaymentBadge status={order.payment_status} />
                    </div>
                  </div>
                  <div className="border-t pt-3 space-y-1" style={{ borderColor: `${text}08` }}>
                    {order.items.map((item, i) => (
                      <p key={i} className="text-xs opacity-50">
                        {item.quantity}× {item.product_name}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    approved: { label: 'Pagado', color: '#16a34a' },
    pending: { label: 'Pendiente', color: '#d97706' },
    rejected: { label: 'Rechazado', color: '#dc2626' },
    cancelled: { label: 'Cancelado', color: '#6b7280' },
  }
  const { label, color } = map[status] ?? { label: status, color: '#6b7280' }
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5 block" style={{ color }}>
      {label}
    </span>
  )
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n)
}
