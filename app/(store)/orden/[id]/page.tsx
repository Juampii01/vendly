import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import { ClearCartOnSuccess } from '@/components/store/ClearCartOnSuccess'
import type { Order } from '@/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const store = await getStoreConfig()
  return { title: `Confirmación de orden — ${store.name}` }
}

export default async function OrdenPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { status } = await searchParams

  const [store, supabase] = await Promise.all([getStoreConfig(), Promise.resolve(createServiceClient())])

  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .eq('store_id', await getStoreId())
    .single()

  if (!order) notFound()

  const paymentStatus = status ?? order.payment_status

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Limpiar carrito si el pago fue aprobado */}
      {paymentStatus === 'approved' && <ClearCartOnSuccess />}

      {/* Estado */}
      <div className="mb-8 text-center">
        {paymentStatus === 'approved' ? (
          <>
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: store.color_accent + '20' }}
            >
              <CheckIcon color={store.color_accent} />
            </div>
            <h1 className="text-2xl font-bold">¡Pago confirmado!</h1>
            <p className="mt-2 opacity-60">
              Gracias, {order.buyer_name}. Te enviamos la confirmación a{' '}
              <span className="font-medium">{order.buyer_email}</span>.
            </p>
          </>
        ) : paymentStatus === 'pending' ? (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50">
              <ClockIcon />
            </div>
            <h1 className="text-2xl font-bold">Pago pendiente</h1>
            <p className="mt-2 opacity-60">
              Tu pago está siendo procesado. Te avisamos cuando se acredite.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <XIcon />
            </div>
            <h1 className="text-2xl font-bold">Pago no completado</h1>
            <p className="mt-2 opacity-60">
              Hubo un problema con tu pago. Podés intentarlo de nuevo.
            </p>
          </>
        )}
      </div>

      {/* Detalle de la orden */}
      <div className="rounded-2xl border border-black/10 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            Orden #{order.id.slice(0, 8).toUpperCase()}
          </h2>
          <OrderStatusBadge status={order.status} store={store} />
        </div>

        {/* Items */}
        <ul className="divide-y divide-black/10">
          {(order.items as Order['items']).map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.product_image && (
                  <Image
                    src={item.product_image}
                    alt={item.product_name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{item.product_name}</p>
                {item.variant_label && (
                  <p className="text-xs opacity-50">{item.variant_label}</p>
                )}
                <p className="text-xs opacity-50">x{item.quantity}</p>
              </div>
              <span className="text-sm font-bold">{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        {/* Totales */}
        <div className="space-y-2 border-t border-black/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="opacity-60">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento</span>
              <span>−{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="opacity-60">Envío</span>
            <span>{order.shipping_amount === 0 ? 'Gratis' : formatPrice(order.shipping_amount)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Dirección */}
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
          <p className="font-medium mb-1">Entrega a:</p>
          <p className="opacity-70">{order.shipping_street}</p>
          <p className="opacity-70">
            {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
          </p>
          <p className="opacity-70">{order.shipping_country}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/productos"
          className="block w-full rounded-full py-3.5 text-center text-sm font-bold transition-opacity hover:opacity-80"
          style={{ backgroundColor: store.color_primary, color: store.color_background }}
        >
          Ver más productos
        </Link>
        {paymentStatus === 'rejected' && (
          <Link
            href="/checkout"
            className="block w-full rounded-full border border-black/20 py-3.5 text-center text-sm font-medium transition-opacity hover:opacity-70"
          >
            Intentar de nuevo
          </Link>
        )}
      </div>
    </div>
  )
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}

function OrderStatusBadge({
  status,
  store,
}: {
  status: string
  store: Awaited<ReturnType<typeof getStoreConfig>>
}) {
  const labels: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    processing: 'Preparando',
    shipped: 'Enviada',
    delivered: 'Entregada',
    cancelled: 'Cancelada',
  }
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: store.color_accent + '20', color: store.color_accent }}
    >
      {labels[status] ?? status}
    </span>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  )
}
