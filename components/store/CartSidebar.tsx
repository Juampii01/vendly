'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/cart'
import { formatVariantLabel, formatPrice } from '@/lib/format'
import type { StoreConfig } from '@/types'

interface CartSidebarProps {
  open: boolean
  onClose: () => void
  store: StoreConfig
}

export function CartSidebar({ open, onClose, store }: CartSidebarProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const subtotal = useCartStore((s) => s.getSubtotal())
  const shipping = useCartStore((s) =>
    s.getShipping(store.free_shipping_threshold, store.shipping_base_price),
  )
  const total = subtotal - useCartStore((s) => s.getDiscount()) + shipping
  const overlayRef = useRef<HTMLDivElement>(null)

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ backgroundColor: store.color_background, color: store.color_text }}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
          <h2 className="text-lg font-semibold">Tu carrito</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:opacity-60" aria-label="Cerrar carrito">
            <CloseIcon />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <EmptyCartIcon />
              <p className="text-sm opacity-60">Tu carrito está vacío</p>
              <Link
                href="/productos"
                onClick={onClose}
                className="rounded-full px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ backgroundColor: store.color_primary, color: store.color_background }}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const key = item.variant_id
                  ? `${item.product_id}__${item.variant_id}`
                  : item.product_id
                const imgSrc = item.product.images[0] ?? null

                return (
                  <li key={key} className="flex gap-3">
                    {/* Imagen */}
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {imgSrc && (
                        <Image
                          src={imgSrc}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col gap-1">
                      <p className="text-sm font-medium leading-tight">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs opacity-60">
                          {formatVariantLabel(item.variant.attributes)}
                        </p>
                      )}
                      <p className="text-sm font-semibold">
                        {formatPrice(item.unit_price * item.quantity)}
                      </p>

                      {/* Cantidad */}
                      <div className="mt-auto flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-black/20 text-sm hover:opacity-60"
                          aria-label="Quitar uno"
                        >
                          −
                        </button>
                        <span className="w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                          className="flex h-6 w-6 items-center justify-center rounded border border-black/20 text-sm hover:opacity-60"
                          aria-label="Agregar uno"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.product_id, item.variant_id)}
                          className="ml-auto text-xs opacity-40 hover:opacity-80 hover:text-red-500"
                          aria-label="Eliminar item"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black/10 px-4 py-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="opacity-60">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Envío</span>
                <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-1 border-t border-black/10">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full rounded-full py-3 text-center text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: store.color_primary, color: store.color_background }}
            >
              Finalizar compra
            </Link>
            <Link
              href="/carrito"
              onClick={onClose}
              className="block w-full rounded-full py-3 text-center text-sm font-medium border border-black/20 transition-opacity hover:opacity-60"
            >
              Ver carrito completo
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function EmptyCartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-30">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}
