'use client'

import { useState, useCallback } from 'react'
import type { AbandonedCart, Coupon } from '@/types'

interface Props {
  initialCarts: AbandonedCart[]
  storeUrl: string
  storeName: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}

function suggestCouponCode(buyerName: string | null): string {
  if (!buyerName) return 'DESCUENTO20'
  const first = buyerName.trim().split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '')
  return first ? `${first}20` : 'DESCUENTO20'
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('54')) return digits
  if (digits.startsWith('0')) return '54' + digits.slice(1)
  return '54' + digits
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function buildWAMessage(cart: AbandonedCart, storeName: string, recoveryUrl: string, couponCode: string, discount: number): string {
  const name = cart.buyer_name?.split(' ')[0] ?? 'hola'
  const products = (cart.cart_data ?? []).slice(0, 3)
    .map(item => `• ${item.product?.name ?? 'Producto'} x${item.quantity} — ${formatPrice(item.unit_price * item.quantity)}`)
    .join('\n')

  return `Hola ${name}! 👋

Vimos que dejaste productos en ${storeName}:

${products}${(cart.cart_data?.length ?? 0) > 3 ? `\n• ...y ${cart.cart_data.length - 3} más` : ''}

💰 Total: ${formatPrice(cart.subtotal)}

Te queremos dar un *${discount}% de descuento* con el código:

✨ *${couponCode}*

Solo aplicalo en tu carrito al momento de pagar.

👉 Retomá tu compra acá: ${recoveryUrl}

¡Esperamos verte pronto! 🛍️`
}

// ─── Modal de WhatsApp ────────────────────────────────────────────────────────

interface WAModalProps {
  cart: AbandonedCart
  storeUrl: string
  storeName: string
  onClose: () => void
  onSent: (cartId: string) => void
}

function WAModal({ cart, storeUrl, storeName, onClose, onSent }: WAModalProps) {
  const [code, setCode] = useState(suggestCouponCode(cart.buyer_name))
  const [discount, setDiscount] = useState(20)
  const [maxUses, setMaxUses] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const recoveryUrl = `${storeUrl}/checkout?recover=${cart.recovery_token}`
  const message = buildWAMessage(cart, storeName, recoveryUrl, code, discount)
  const phone = formatPhone(cart.phone ?? '')
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  async function handleSend() {
    setError('')
    setLoading(true)
    try {
      // 1. Crear cupón
      const res = await fetch('/api/admin/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          type: 'percentage',
          value: discount,
          max_uses: maxUses,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error creando el cupón')
        return
      }

      // 2. Registrar whatsapp_count en el carrito
      await fetch('/api/admin/carritos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cart.id }),
      })

      // 3. Abrir WhatsApp
      window.open(waLink, '_blank')
      onSent(cart.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-white">Enviar WhatsApp a {cart.buyer_name ?? cart.phone}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{cart.phone}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-lg">×</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Productos del carrito */}
          <div className="rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Carrito</p>
            <div className="space-y-1">
              {(cart.cart_data ?? []).slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{item.product?.name ?? 'Producto'} ×{item.quantity}</span>
                  <span className="text-slate-400">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
              {(cart.cart_data?.length ?? 0) > 4 && (
                <p className="text-xs text-slate-600">+{cart.cart_data.length - 4} más</p>
              )}
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Total</span>
              <span className="text-xs text-white font-semibold">{formatPrice(cart.subtotal)}</span>
            </div>
          </div>

          {/* Config del cupón */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Cupón de descuento</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-[10px] text-slate-500 uppercase tracking-wide">Código</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wide">Descuento %</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wide">Usos máx.</label>
                <input
                  type="number"
                  min={1}
                  value={maxUses}
                  onChange={e => setMaxUses(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Preview del mensaje */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-2">Vista previa del mensaje</p>
            <pre className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700 rounded-xl p-3 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
              {message}
            </pre>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 rounded-xl border border-slate-700 text-slate-400 text-sm py-2.5 hover:text-white hover:border-slate-500 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !code.trim() || !cart.phone}
              className="flex-1 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <WhatsAppIcon />
              {loading ? 'Creando cupón...' : 'Generar y abrir WhatsApp'}
            </button>
          </div>

          {!cart.phone && (
            <p className="text-xs text-yellow-500 text-center">Este carrito no tiene teléfono registrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CarritosClient({ initialCarts, storeUrl, storeName }: Props) {
  const [carts, setCarts] = useState(initialCarts)
  const [activeModal, setActiveModal] = useState<AbandonedCart | null>(null)
  const [recovering, setRecovering] = useState<string | null>(null)

  const handleMarkRecovered = useCallback(async (id: string) => {
    setRecovering(id)
    try {
      await fetch('/api/admin/carritos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setCarts(prev => prev.filter(c => c.id !== id))
    } finally {
      setRecovering(null)
    }
  }, [])

  const handleSent = useCallback((cartId: string) => {
    setCarts(prev => prev.filter(c => c.id !== cartId))
  }, [])

  if (carts.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-black text-white mb-1">Carritos abandonados</h1>
        <p className="text-slate-500 text-sm mb-8">Clientes que empezaron el checkout pero no finalizaron.</p>
        <div className="rounded-2xl border-2 border-dashed border-slate-800 py-20 text-center">
          <p className="text-slate-400 text-sm">🛍️ No hay carritos abandonados activos.</p>
          <p className="text-slate-600 text-xs mt-2">Cuando alguien deje un carrito, aparecerá acá.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white mb-1">Carritos abandonados</h1>
        <p className="text-slate-500 text-sm">{carts.length} carrito{carts.length !== 1 ? 's' : ''} sin recuperar</p>
      </div>

      <div className="space-y-3">
        {carts.map(cart => (
          <div key={cart.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* Info del cliente */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white truncate">
                    {cart.buyer_name ?? <span className="text-slate-500 italic">Sin nombre</span>}
                  </p>
                  <span className="text-xs text-slate-600">{timeAgo(cart.created_at)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  {cart.email && <span>{cart.email}</span>}
                  {cart.phone && <span className="font-mono">{cart.phone}</span>}
                </div>

                {/* Productos */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(cart.cart_data ?? []).slice(0, 3).map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-300">
                      {item.product?.name ?? 'Producto'}
                      {item.quantity > 1 && <span className="text-slate-500">×{item.quantity}</span>}
                    </span>
                  ))}
                  {(cart.cart_data?.length ?? 0) > 3 && (
                    <span className="inline-flex items-center rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-xs text-slate-500">
                      +{cart.cart_data.length - 3} más
                    </span>
                  )}
                </div>
              </div>

              {/* Total + acciones */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <p className="text-lg font-bold text-white">{formatPrice(cart.subtotal)}</p>

                <div className="flex items-center gap-2 text-[10px] text-slate-600">
                  {cart.email_count > 0 && (
                    <span className="flex items-center gap-1">
                      <span>📧</span>{cart.email_count} email{cart.email_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  {cart.whatsapp_count > 0 && (
                    <span className="flex items-center gap-1">
                      <span>💬</span>{cart.whatsapp_count} WA
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkRecovered(cart.id)}
                    disabled={recovering === cart.id}
                    className="rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 px-3 py-1.5 transition-colors disabled:opacity-40"
                  >
                    {recovering === cart.id ? 'Marcando...' : '✓ Recuperado'}
                  </button>
                  <button
                    onClick={() => setActiveModal(cart)}
                    disabled={!cart.phone}
                    title={!cart.phone ? 'Sin teléfono registrado' : ''}
                    className="rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-3 py-1.5 transition-colors disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <WhatsAppIcon />
                    Enviar WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeModal && (
        <WAModal
          cart={activeModal}
          storeUrl={storeUrl}
          storeName={storeName}
          onClose={() => setActiveModal(null)}
          onSent={handleSent}
        />
      )}
    </div>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
