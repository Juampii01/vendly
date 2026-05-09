'use client'

import { useState } from 'react'
import type { Coupon } from '@/types'

interface Props {
  initialCoupons: Coupon[]
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function formatDate(str: string): string {
  return new Date(str).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const EMPTY_FORM = {
  code: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  max_uses: '',
  min_order_amount: '',
  expires_at: '',
  description: '',
}

const DESCRIPTION_MAX = 200

export function CuponesClient({ initialCoupons }: Props) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toggling, setToggling] = useState<string | null>(null)
  const [editingDescId, setEditingDescId] = useState<string | null>(null)
  const [editingDescValue, setEditingDescValue] = useState('')
  const [savingDesc, setSavingDesc] = useState(false)

  function setField(key: keyof typeof EMPTY_FORM, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setError('')
  }

  function suggestCode() {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    setField('code', `PROMO${rand}`)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim() || !form.value) {
      setError('Código y valor son requeridos')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/cupones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Number(form.value),
          max_uses: form.max_uses ? Number(form.max_uses) : null,
          min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : null,
          expires_at: form.expires_at || null,
          description: form.description.trim() || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al crear el cupón')
        return
      }
      setCoupons(prev => [json.data, ...prev])
      setForm(EMPTY_FORM)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(coupon: Coupon) {
    setToggling(coupon.id)
    try {
      await fetch(`/api/admin/cupones/${coupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !coupon.is_active }),
      })
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este cupón?')) return
    await fetch(`/api/admin/cupones/${id}`, { method: 'DELETE' })
    setCoupons(prev => prev.filter(c => c.id !== id))
  }

  function startEditDesc(coupon: Coupon) {
    setEditingDescId(coupon.id)
    setEditingDescValue(coupon.description ?? '')
  }

  function cancelEditDesc() {
    setEditingDescId(null)
    setEditingDescValue('')
  }

  async function saveEditDesc(id: string) {
    setSavingDesc(true)
    try {
      const res = await fetch(`/api/admin/cupones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editingDescValue.trim() || null }),
      })
      if (!res.ok) return
      const next = editingDescValue.trim() || null
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, description: next } : c))
      cancelEditDesc()
    } finally {
      setSavingDesc(false)
    }
  }

  const activeCoupons = coupons.filter(c => c.is_active)
  const inactiveCoupons = coupons.filter(c => !c.is_active)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Cupones</h1>
          <p className="text-slate-500 text-sm">{activeCoupons.length} cupón{activeCoupons.length !== 1 ? 'es' : ''} activo{activeCoupons.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setError('') }}
          className="rounded-xl bg-white text-slate-900 text-sm font-semibold px-4 py-2 hover:bg-slate-100 transition-colors"
        >
          + Nuevo cupón
        </button>
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-700 bg-slate-900 p-5 mb-6 space-y-4">
          <h2 className="text-sm font-semibold text-white">Crear cupón</h2>

          {/* Código */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wide">Código</label>
            <div className="flex gap-2 mt-1">
              <input
                value={form.code}
                onChange={e => setField('code', e.target.value.toUpperCase().replace(/\s/g, ''))}
                placeholder="PROMO20"
                className="flex-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 font-mono placeholder:text-slate-600"
              />
              <button type="button" onClick={suggestCode}
                className="rounded-lg border border-slate-700 text-slate-400 text-xs px-3 hover:text-white hover:border-slate-500 transition-colors">
                Auto
              </button>
            </div>
          </div>

          {/* Tipo + Valor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Tipo</label>
              <select
                value={form.type}
                onChange={e => setField('type', e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo ($)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">
                {form.type === 'percentage' ? 'Porcentaje' : 'Monto ($)'}
              </label>
              <input
                type="number"
                min={1}
                max={form.type === 'percentage' ? 100 : undefined}
                value={form.value}
                onChange={e => setField('value', e.target.value)}
                placeholder={form.type === 'percentage' ? '20' : '5000'}
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Opcionales */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Usos máx.</label>
              <input
                type="number"
                min={1}
                value={form.max_uses}
                onChange={e => setField('max_uses', e.target.value)}
                placeholder="∞"
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Mínimo ($)</label>
              <input
                type="number"
                min={0}
                value={form.min_order_amount}
                onChange={e => setField('min_order_amount', e.target.value)}
                placeholder="Ninguno"
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Vence</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={e => setField('expires_at', e.target.value)}
                className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-slate-500 uppercase tracking-wide">Descripción (opcional)</label>
              <span className="text-[10px] text-slate-600">{form.description.length}/{DESCRIPTION_MAX}</span>
            </div>
            <textarea
              value={form.description}
              onChange={e => setField('description', e.target.value.slice(0, DESCRIPTION_MAX))}
              placeholder='Ej: "Descuento abonando en efectivo en el local"'
              rows={2}
              className="mt-1 w-full resize-none rounded-lg bg-slate-800 border border-slate-700 text-white text-sm px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600"
            />
            <p className="mt-1 text-[10px] text-slate-600">Se muestra al cliente en el checkout cuando aplica el cupón.</p>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setShowForm(false); setError('') }}
              className="flex-1 rounded-xl border border-slate-700 text-slate-400 text-sm py-2.5 hover:text-white transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-white text-slate-900 text-sm font-semibold py-2.5 hover:bg-slate-100 transition-colors disabled:opacity-40">
              {saving ? 'Creando...' : 'Crear cupón'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de cupones */}
      {coupons.length === 0 && !showForm ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-800 py-20 text-center">
          <p className="text-slate-400 text-sm">🏷️ No hay cupones todavía.</p>
          <p className="text-slate-600 text-xs mt-2">Creá uno para ofrecer descuentos a tus clientes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...activeCoupons, ...inactiveCoupons].map(coupon => {
            const usesLeft = coupon.max_uses != null ? coupon.max_uses - coupon.uses_count : null
            const isExpired = coupon.expires_at ? new Date(coupon.expires_at) < new Date() : false
            const isExhausted = usesLeft !== null && usesLeft <= 0
            const statusBad = !coupon.is_active || isExpired || isExhausted

            return (
              <div key={coupon.id} className={`rounded-2xl border p-4 flex items-center gap-4 flex-wrap ${statusBad ? 'border-slate-800 bg-slate-900/40' : 'border-slate-700 bg-slate-900'}`}>
                {/* Código */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-sm font-bold ${statusBad ? 'text-slate-500' : 'text-white'}`}>
                      {coupon.code}
                    </span>
                    {!coupon.is_active && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-500">desactivado</span>
                    )}
                    {coupon.is_active && isExpired && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-red-950/60 text-red-400">vencido</span>
                    )}
                    {coupon.is_active && isExhausted && !isExpired && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-950/60 text-orange-400">agotado</span>
                    )}
                    {coupon.is_active && !isExpired && !isExhausted && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-green-950/60 text-green-400">activo</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                    <span>
                      {coupon.type === 'percentage' ? `${coupon.value}% de descuento` : `${formatPrice(coupon.value)} de descuento`}
                    </span>
                    {coupon.min_order_amount && (
                      <span>mín. {formatPrice(coupon.min_order_amount)}</span>
                    )}
                    {coupon.max_uses != null && (
                      <span>{coupon.uses_count}/{coupon.max_uses} usos</span>
                    )}
                    {coupon.max_uses == null && coupon.uses_count > 0 && (
                      <span>{coupon.uses_count} usos</span>
                    )}
                    {coupon.expires_at && (
                      <span>vence {formatDate(coupon.expires_at)}</span>
                    )}
                  </div>

                  {/* Descripción: vista o editor inline */}
                  {editingDescId === coupon.id ? (
                    <div className="mt-2 w-full">
                      <textarea
                        value={editingDescValue}
                        onChange={e => setEditingDescValue(e.target.value.slice(0, DESCRIPTION_MAX))}
                        placeholder='Ej: "Descuento abonando en efectivo en el local"'
                        rows={2}
                        autoFocus
                        className="w-full resize-none rounded-lg bg-slate-800 border border-slate-700 text-white text-xs px-3 py-2 outline-none focus:border-slate-500 placeholder:text-slate-600"
                      />
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-600">{editingDescValue.length}/{DESCRIPTION_MAX}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={cancelEditDesc}
                            disabled={savingDesc}
                            className="rounded-lg border border-slate-700 text-[11px] text-slate-400 hover:text-white px-2.5 py-1 transition-colors disabled:opacity-40"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => saveEditDesc(coupon.id)}
                            disabled={savingDesc}
                            className="rounded-lg bg-white text-slate-900 text-[11px] font-semibold px-2.5 py-1 hover:bg-slate-100 transition-colors disabled:opacity-40"
                          >
                            {savingDesc ? 'Guardando...' : 'Guardar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : coupon.description ? (
                    <button
                      onClick={() => startEditDesc(coupon)}
                      className="mt-1.5 block w-full text-left text-xs text-slate-400 hover:text-white transition-colors"
                      title="Click para editar"
                    >
                      {coupon.description}
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditDesc(coupon)}
                      className="mt-1.5 text-[11px] text-slate-600 hover:text-slate-300 transition-colors"
                    >
                      + Agregar descripción
                    </button>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(coupon)}
                    disabled={toggling === coupon.id}
                    className="rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 px-3 py-1.5 transition-colors disabled:opacity-40"
                  >
                    {toggling === coupon.id ? '...' : coupon.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="rounded-lg border border-red-900/60 text-xs text-red-400 hover:bg-red-950/40 px-3 py-1.5 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
