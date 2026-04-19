'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Status = 'active' | 'inactive' | 'suspended'

const STATUS_CONFIG: Record<Status, { label: string; dot: string; text: string }> = {
  active:    { label: 'Activo',     dot: 'bg-green-500', text: 'text-green-400' },
  inactive:  { label: 'Inactivo',   dot: 'bg-slate-500', text: 'text-slate-400' },
  suspended: { label: 'Suspendido', dot: 'bg-red-500',   text: 'text-red-400'   },
}

const ACTIONS: Record<Status, { label: string; next: Status; style: string }[]> = {
  active:    [
    { label: 'Desactivar', next: 'inactive',  style: 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' },
    { label: 'Suspender',  next: 'suspended', style: 'border-red-800 text-red-400 hover:border-red-600' },
  ],
  inactive:  [
    { label: 'Activar',   next: 'active',    style: 'border-green-800 text-green-400 hover:border-green-600' },
    { label: 'Suspender', next: 'suspended', style: 'border-red-800 text-red-400 hover:border-red-600' },
  ],
  suspended: [
    { label: 'Activar',    next: 'active',   style: 'border-green-800 text-green-400 hover:border-green-600' },
    { label: 'Desactivar', next: 'inactive', style: 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500' },
  ],
}

export default function StoreStatusControl({
  storeId,
  currentStatus,
}: {
  storeId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState<Status>(currentStatus as Status)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive
  const actions = ACTIONS[status] ?? []

  async function changeStatus(next: Status) {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/platform/stores/${storeId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Error al cambiar estado.')
        return
      }
      setStatus(next)
      router.refresh()
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Badge de estado actual */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
        <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
        <span className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</span>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        {actions.map(action => (
          <button
            key={action.next}
            onClick={() => changeStatus(action.next)}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 ${action.style}`}
          >
            {loading ? '...' : action.label}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
