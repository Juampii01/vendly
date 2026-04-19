'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/format'
import { PaymentBadge } from '@/components/admin/PaymentBadge'
import type { Order, OrderStatus } from '@/types'

interface OrdersClientProps {
  initialOrders: Order[]
  activeStatus?: string
  openOrderId?: string
}

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'rejected', label: 'Rechazadas' },
]

const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'processing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviada' },
  { value: 'delivered', label: 'Entregada' },
  { value: 'cancelled', label: 'Cancelada' },
]

export function OrdersClient({ initialOrders, activeStatus, openOrderId }: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [selectedId, setSelectedId] = useState<string | null>(openOrderId ?? null)
  const router = useRouter()
  const pathname = usePathname()

  const selected = orders.find((o) => o.id === selectedId) ?? null

  function setStatusFilter(value: string) {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    )
  }

  return (
    <div className="flex h-full min-h-screen">
      {/* Lista */}
      <div className={`flex flex-col ${selected ? 'hidden md:flex md:w-96 md:shrink-0' : 'flex-1'}`}>
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="mb-4 text-xl font-bold text-slate-900">Órdenes</h1>
          {/* Tabs de estado */}
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  (activeStatus ?? '') === tab.value
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No hay órdenes con este filtro
            </div>
          ) : (
            orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedId(order.id === selectedId ? null : order.id)}
                className={`w-full px-5 py-4 text-left transition-colors hover:bg-slate-50 ${
                  selectedId === order.id ? 'bg-slate-50 border-l-2 border-slate-800' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-slate-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 truncate font-medium text-slate-800">{order.buyer_name}</p>
                    <p className="text-xs text-slate-400 truncate">{order.buyer_email}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-bold text-slate-900">{formatPrice(order.total)}</p>
                    <PaymentBadge status={order.payment_status} />
                    <p className="mt-1 text-[11px] text-slate-400">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detalle */}
      {selected ? (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setSelectedId(null)}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-700 md:hidden"
            >
              ← Volver
            </button>
            <div>
              <p className="font-mono text-sm font-bold text-slate-500">
                #{selected.id.slice(0, 8).toUpperCase()}
              </p>
              <h2 className="text-xl font-bold text-slate-900">{selected.buyer_name}</h2>
            </div>
          </div>

          <div className="space-y-4">
            {/* Estado */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Estado de la orden</p>
              <div className="flex flex-wrap gap-2">
                {ORDER_STATUSES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => updateOrderStatus(selected.id, value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selected.status === value
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-3">
                <div>
                  <p className="text-[11px] text-slate-400 uppercase">Pago</p>
                  <PaymentBadge status={selected.payment_status} />
                </div>
                {selected.mp_payment_id && (
                  <div>
                    <p className="text-[11px] text-slate-400 uppercase">ID MP</p>
                    <p className="font-mono text-xs text-slate-600">{selected.mp_payment_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Productos</p>
              <ul className="space-y-3">
                {selected.items?.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.product_image && (
                        <Image src={item.product_image} alt={item.product_name} fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{item.product_name}</p>
                      {item.variant_label && <p className="text-xs text-slate-400">{item.variant_label}</p>}
                      <p className="text-xs text-slate-400">x{item.quantity} · {formatPrice(item.unit_price)} c/u</p>
                    </div>
                    <p className="shrink-0 font-bold text-slate-900">{formatPrice(item.subtotal)}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{formatPrice(selected.subtotal)}</span></div>
                {selected.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Descuento</span><span>−{formatPrice(selected.discount_amount)}</span></div>}
                <div className="flex justify-between text-slate-500"><span>Envío</span><span>{selected.shipping_amount === 0 ? 'Gratis' : formatPrice(selected.shipping_amount)}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-base text-slate-900"><span>Total</span><span>{formatPrice(selected.total)}</span></div>
              </div>
            </div>

            {/* Comprador */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Comprador</p>
              <div className="space-y-1 text-sm text-slate-700">
                <p>{selected.buyer_name}</p>
                <p className="text-slate-500">{selected.buyer_email}</p>
                {selected.buyer_phone && <p className="text-slate-500">{selected.buyer_phone}</p>}
              </div>
              <p className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Dirección</p>
              <div className="text-sm text-slate-600">
                <p>{selected.shipping_street}</p>
                <p>{selected.shipping_city}, {selected.shipping_state} {selected.shipping_zip}</p>
                <p>{selected.shipping_country}</p>
              </div>
              {selected.notes && (
                <>
                  <p className="mt-4 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Notas</p>
                  <p className="text-sm text-slate-600">{selected.notes}</p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-slate-300">
          <p className="text-sm">Seleccioná una orden para ver el detalle</p>
        </div>
      )}
    </div>
  )
}

