'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TriggerMonitorButton({
  storeId,
  hasBaseUrl,
}: {
  storeId: string
  hasBaseUrl: boolean
}) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'running' | 'ok' | 'error'>('idle')
  const [detail, setDetail] = useState<string | null>(null)

  async function run() {
    setState('running')
    setDetail(null)
    try {
      const res = await fetch(`/api/platform/stores/${storeId}/monitor`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) {
        setDetail(
          json.fails > 0
            ? `${json.checked} checks — ${json.fails} error${json.fails !== 1 ? 'es' : ''}`
            : `${json.checked} checks OK`,
        )
        setState('ok')
        setTimeout(() => {
          router.refresh()
          setState('idle')
          setDetail(null)
        }, 2000)
      } else {
        setDetail(json.error ?? 'Error al ejecutar')
        setState('error')
      }
    } catch {
      setDetail('Error de conexión')
      setState('error')
    }
  }

  const disabled = !hasBaseUrl || state === 'running'

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={run}
        disabled={disabled}
        title={!hasBaseUrl ? 'El store no tiene base_url configurado' : undefined}
        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          state === 'ok'
            ? 'border-green-700 bg-green-900/20 text-green-400'
            : state === 'error'
            ? 'border-red-700 bg-red-900/20 text-red-400'
            : 'border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
        }`}
      >
        {state === 'running'
          ? 'Ejecutando checks…'
          : state === 'ok'
          ? '✓ Completado'
          : state === 'error'
          ? '✗ Error'
          : 'Disparar chequeo manual'}
      </button>
      {detail && (
        <span
          className={`text-xs ${state === 'error' ? 'text-red-400' : 'text-slate-400'}`}
        >
          {detail}
        </span>
      )}
    </div>
  )
}
