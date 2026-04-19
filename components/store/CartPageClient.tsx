'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart'
import { formatVariantLabel } from '@/lib/format'
import type { StoreConfig } from '@/types'

interface CartPageClientProps {
  store: StoreConfig
}

export function CartPageClient({ store }: CartPageClientProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const coupon = useCartStore((s) => s.coupon)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const subtotal = useCartStore((s) => s.getSubtotal())
  const discount = useCartStore((s) => s.getDiscount())
  const shipping = useCartStore((s) =>
    s.getShipping(store.free_shipping_threshold, store.shipping_base_price),
  )
  const total = subtotal - discount + shipping

  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return
    setCouponError('')
    setCouponLoading(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponInput.trim())}`)
      const json = await res.json()
      if (json.data) {
        applyCoupon(json.data)
        setCouponInput('')
      } else {
        setCouponError('Cupón inválido o expirado')
      }
    } catch {
      setCouponError('Error al validar el cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <EmptyCartIcon />
        <h1 className="mt-6 text-2xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-2 opacity-60">Agregá productos para continuar</p>
        <Link
          href="/productos"
          className="mt-8 inline-block rounded-full px-8 py-3 text-sm font-bold transition-opacity hover:opacity-80"
          style={{ backgroundColor: store.color_primary, color: store.color_background }}
        >
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Carrito</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* ── Items ──────────────────────────────────────────────────────── */}
        <div>
          <ul className="divide-y divide-black/10">
            {items.map((item) => {
              const key = item.variant_id
                ? `${item.product_id}__${item.variant_id}`
                : item.product_id
              const img = item.product.images[0] ?? null

              return (
                <li key={key} className="flex gap-4 py-5">
                  {/* Imagen */}
                  <Link href={`/productos/${item.product.slug}`} className="shrink-0">
                    <div className="relative h-24 w-20 overflow-hidden rounded-xl bg-gray-100">
                      {img && (
                        <Image
                          src={img}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col gap-1">
                    <Link
                      href={`/productos/${item.product.slug}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    {item.variant && (
                      <p className="text-xs opacity-50">
                        {formatVariantLabel(item.variant.attributes)}
                      </p>
                    )}
                    <p className="text-sm font-bold" style={{ color: store.color_primary }}>
                      {formatPrice(item.unit_price * item.quantity)}
                    </p>
                    <p className="text-xs opacity-40">{formatPrice(item.unit_price)} c/u</p>

                    {/* Controles */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-black/20">
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.variant_id, item.quantity - 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-lg hover:opacity-60"
                        >
                          −
                        </button>
                        <span className="w-7 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product_id, item.variant_id, item.quantity + 1)
                          }
                          className="flex h-8 w-8 items-center justify-center text-lg hover:opacity-60"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id, item.variant_id)}
                        className="text-xs opacity-40 hover:text-red-500 hover:opacity-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── Resumen ────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-black/10 p-6 h-fit">
          <h2 className="mb-4 text-lg font-bold">Resumen</h2>

          {/* Cupón */}
          <div className="mb-5">
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm"
                style={{ backgroundColor: `${store.color_accent}20`, color: store.color_text }}>
                <span className="font-semibold">
                  Cupón <span className="font-mono">{coupon.code}</span> aplicado
                </span>
                <button
                  onClick={removeCoupon}
                  className="ml-2 text-xs opacity-60 hover:text-red-500 hover:opacity-100"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Código de cupón"
                  className="flex-1 rounded-xl border border-black/20 px-3 py-2 text-sm outline-none focus:border-black/40"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: store.color_secondary, color: store.color_text }}
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
            )}
          </div>

          {/* Totales */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-semibold" style={{ color: store.color_accent }}>
                <span>Descuento</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="opacity-60">Envío</span>
              <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
            {store.free_shipping_threshold !== null && shipping > 0 && (
              <p className="text-xs opacity-50">
                Faltan {formatPrice(store.free_shipping_threshold - subtotal)} para envío gratis
              </p>
            )}
            <div className="flex justify-between border-t border-black/10 pt-3 text-base font-bold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-5 block w-full rounded-full py-3.5 text-center text-sm font-bold transition-opacity hover:opacity-80"
            style={{ backgroundColor: store.color_primary, color: store.color_background }}
          >
            Finalizar compra
          </Link>
        </div>
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

function EmptyCartIcon() {
  return (
    <svg className="mx-auto opacity-20" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
