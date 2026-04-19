'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCartStore } from '@/lib/cart'
import { formatVariantLabel, formatPrice } from '@/lib/format'
import type { CheckoutFormData, StoreConfig, Coupon } from '@/types'

interface CheckoutClientProps {
  store: StoreConfig
}

const EMPTY_FORM: CheckoutFormData = {
  full_name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'Argentina',
  notes: '',
}

export function CheckoutClient({ store }: CheckoutClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const items = useCartStore((s) => s.items)
  const coupon = useCartStore((s) => s.coupon)
  const applyCoupon = useCartStore((s) => s.applyCoupon)
  const removeCoupon = useCartStore((s) => s.removeCoupon)
  const restoreCart = useCartStore((s) => s.restoreCart)
  const session_id = useCartStore((s) => s.session_id)
  const subtotal = useCartStore((s) => s.getSubtotal())
  const discount = useCartStore((s) => s.getDiscount())
  const shipping = useCartStore((s) =>
    s.getShipping(store.free_shipping_threshold, store.shipping_base_price),
  )
  const total = subtotal - discount + shipping

  const [form, setForm] = useState<CheckoutFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [recovering, setRecovering] = useState(false)

  // Cupón
  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  // ── Recuperar carrito abandonado desde ?recover=TOKEN ─────────────────────
  useEffect(() => {
    const token = searchParams.get('recover')
    if (!token) return
    setRecovering(true)
    fetch(`/api/abandoned-carts?recover=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(json => {
        if (json.data?.cart_data?.length) {
          restoreCart(json.data.cart_data)
        }
      })
      .catch(() => {})
      .finally(() => setRecovering(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Redirigir si el carrito está vacío (side effect correcto) ─────────────
  useEffect(() => {
    if (!recovering && items.length === 0) {
      router.replace('/carrito')
    }
  }, [items.length, recovering, router])

  if (items.length === 0) return null

  function setField(key: keyof CheckoutFormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Email inválido'
    if (!form.phone.trim()) newErrors.phone = 'Requerido'
    if (!form.street.trim()) newErrors.street = 'Requerido'
    if (!form.city.trim()) newErrors.city = 'Requerido'
    if (!form.state.trim()) newErrors.state = 'Requerido'
    if (!form.zip.trim()) newErrors.zip = 'Requerido'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(code)}`)
      const json = await res.json()
      if (!res.ok || !json.data) {
        setCouponError(json.error ?? 'Cupón inválido o expirado')
        return
      }
      applyCoupon(json.data as Coupon)
      setCouponInput('')
    } catch {
      setCouponError('Error de conexión. Intentá de nuevo.')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    removeCoupon()
    setCouponInput('')
    setCouponError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError('')

    try {
      // 1. Guardar carrito abandonado
      await fetch('/api/abandoned-carts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id,
          email: form.email,
          phone: form.phone,
          buyer_name: form.full_name,
          items,
          subtotal,
        }),
      })

      // 2. Crear preferencia de MercadoPago
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          buyer: form,
          coupon_code: coupon?.code ?? null,
          session_id,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.data) {
        setApiError(json.error ?? 'Error al procesar el pago. Intentá de nuevo.')
        return
      }

      // 3. Redirigir a MercadoPago
      window.location.href = json.data.init_point
    } catch {
      setApiError('Error de conexión. Revisá tu internet e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Finalizar compra</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        {/* ── Formulario ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Datos personales */}
          <fieldset className="rounded-2xl border border-black/10 p-6">
            <legend className="px-1 text-sm font-semibold">Datos personales</legend>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Nombre completo"
                id="full_name"
                value={form.full_name}
                error={errors.full_name}
                onChange={(v) => setField('full_name', v)}
                autoComplete="name"
              />
              <Field
                label="Email"
                id="email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(v) => setField('email', v)}
                autoComplete="email"
              />
              <Field
                label="Teléfono"
                id="phone"
                type="tel"
                value={form.phone}
                error={errors.phone}
                onChange={(v) => setField('phone', v)}
                autoComplete="tel"
              />
            </div>
          </fieldset>

          {/* Dirección de envío */}
          <fieldset className="rounded-2xl border border-black/10 p-6">
            <legend className="px-1 text-sm font-semibold">Dirección de entrega</legend>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Calle y número"
                  id="street"
                  value={form.street}
                  error={errors.street}
                  onChange={(v) => setField('street', v)}
                  autoComplete="street-address"
                />
              </div>
              <Field
                label="Ciudad"
                id="city"
                value={form.city}
                error={errors.city}
                onChange={(v) => setField('city', v)}
                autoComplete="address-level2"
              />
              <Field
                label="Provincia"
                id="state"
                value={form.state}
                error={errors.state}
                onChange={(v) => setField('state', v)}
                autoComplete="address-level1"
              />
              <Field
                label="Código postal"
                id="zip"
                value={form.zip}
                error={errors.zip}
                onChange={(v) => setField('zip', v)}
                autoComplete="postal-code"
              />
              <Field
                label="País"
                id="country"
                value={form.country}
                onChange={(v) => setField('country', v)}
                autoComplete="country-name"
              />
            </div>
          </fieldset>

          {/* Notas */}
          <fieldset className="rounded-2xl border border-black/10 p-6">
            <legend className="px-1 text-sm font-semibold">Notas adicionales (opcional)</legend>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="Instrucciones especiales para la entrega..."
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-black/20 px-3 py-2.5 text-sm outline-none focus:border-black/40"
            />
          </fieldset>

          {/* ── Cupón de descuento ────────────────────────────────────────── */}
          <div className="rounded-2xl border border-black/10 p-6">
            <p className="mb-3 text-sm font-semibold">Código de descuento</p>

            {coupon ? (
              // Cupón aplicado
              <div className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <div>
                    <p className="text-sm font-bold text-green-800">{coupon.code}</p>
                    <p className="text-xs text-green-600">
                      {coupon.type === 'percentage'
                        ? `${coupon.value}% de descuento`
                        : `${formatPrice(coupon.value)} de descuento`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-xs text-green-700 underline underline-offset-2 hover:text-green-900"
                >
                  Quitar
                </button>
              </div>
            ) : (
              // Input para ingresar cupón
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase())
                    setCouponError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  placeholder="CÓDIGO"
                  className="flex-1 rounded-xl border border-black/20 px-3 py-2.5 text-sm font-mono uppercase outline-none focus:border-black/40"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
                  style={{ backgroundColor: store.color_primary, color: store.color_background }}
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
            )}

            {couponError && (
              <p className="mt-2 text-xs text-red-500">{couponError}</p>
            )}
          </div>

          {apiError && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{apiError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full py-4 text-base font-bold transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ backgroundColor: store.color_primary, color: store.color_background }}
          >
            {loading ? 'Procesando...' : 'Ir a pagar con Mercado Pago'}
          </button>
        </form>

        {/* ── Resumen lateral ────────────────────────────────────────────── */}
        <aside className="rounded-2xl border border-black/10 p-6 h-fit">
          <h2 className="mb-4 text-base font-bold">Tu pedido</h2>
          <ul className="space-y-3">
            {items.map((item) => {
              const key = item.variant_id
                ? `${item.product_id}__${item.variant_id}`
                : item.product_id
              const img = item.product.images[0] ?? null

              return (
                <li key={key} className="flex items-center gap-3">
                  <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {img && (
                      <Image src={img} alt={item.product.name} fill sizes="40px" className="object-cover" />
                    )}
                    <span
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ backgroundColor: store.color_primary, color: store.color_background }}
                    >
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-[10px] opacity-50">{formatVariantLabel(item.variant.attributes)}</p>
                    )}
                  </div>
                  <span className="text-xs font-bold shrink-0">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="opacity-60">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {coupon && discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({coupon.code})</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="opacity-60">Envío</span>
              <span>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2 font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── Field helper ─────────────────────────────────────────────────────────────

interface FieldProps {
  label: string
  id: string
  value: string
  error?: string
  type?: string
  onChange: (v: string) => void
  autoComplete?: string
}

function Field({ label, id, value, error, type = 'text', onChange, autoComplete }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium opacity-70">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={`rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-black/10 ${
          error ? 'border-red-400 focus:border-red-400' : 'border-black/20 focus:border-black/40'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
