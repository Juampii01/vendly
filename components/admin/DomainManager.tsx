'use client'

import { useState, useEffect, useCallback } from 'react'
import type { StoreDomain } from '@/types'

export function DomainManager() {
  const [domains, setDomains] = useState<StoreDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [input, setInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchDomains = useCallback(async () => {
    const res = await fetch('/api/admin/domains')
    if (res.ok) setDomains(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchDomains() }, [fetchDomains])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setAdding(true)
    const res = await fetch('/api/admin/domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: input }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.error); setAdding(false); return }
    setInput('')
    setAdding(false)
    fetchDomains()
  }

  async function handleSetPrimary(id: string) {
    setActionId(id)
    await fetch('/api/admin/domains', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setActionId(null)
    fetchDomains()
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este dominio?')) return
    setActionId(id)
    await fetch('/api/admin/domains', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setActionId(null)
    fetchDomains()
  }

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700 space-y-1">
        <p className="font-semibold">¿Cómo funciona?</p>
        <p>
          Agregá tu dominio propio (ej: <code className="bg-blue-100 px-1 rounded">matienda.com</code>)
          y luego configurá un registro DNS <strong>CNAME</strong> apuntando a{' '}
          <code className="bg-blue-100 px-1 rounded">cname.vercel-dns.com</code>.
          El SSL se provisiona automáticamente en minutos.
        </p>
      </div>

      {/* Lista de dominios */}
      {loading ? (
        <div className="text-sm text-slate-400">Cargando dominios...</div>
      ) : (
        <div className="space-y-2">
          {domains.length === 0 && (
            <p className="text-sm text-slate-400">No hay dominios propios configurados.</p>
          )}
          {domains.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-slate-800 truncate">{d.domain}</span>
                {d.is_primary && (
                  <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                    Principal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!d.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(d.id)}
                    disabled={actionId === d.id}
                    className="text-xs text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40"
                  >
                    Marcar principal
                  </button>
                )}
                <button
                  onClick={() => handleDelete(d.id)}
                  disabled={actionId === d.id}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  {actionId === d.id ? '...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario agregar dominio */}
      <form onSubmit={handleAdd} className="space-y-3">
        <label className="block text-xs font-medium text-slate-500">
          Agregar dominio propio
        </label>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="matienda.com"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white"
          />
          <button
            type="submit"
            disabled={adding || !input.trim()}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? 'Agregando...' : 'Agregar'}
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </form>

      {/* Instrucciones DNS */}
      {domains.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Configuración DNS requerida
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-600">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 pr-4 font-semibold text-slate-500">Tipo</th>
                  <th className="pb-2 pr-4 font-semibold text-slate-500">Nombre</th>
                  <th className="pb-2 font-semibold text-slate-500">Valor</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr>
                  <td className="pr-4 py-1">CNAME</td>
                  <td className="pr-4 py-1">www</td>
                  <td className="py-1">cname.vercel-dns.com</td>
                </tr>
                <tr className="text-slate-400">
                  <td className="pr-4 py-1">A</td>
                  <td className="pr-4 py-1">@</td>
                  <td className="py-1">76.76.21.21</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400">
            Los cambios de DNS pueden tardar hasta 48 hs en propagarse.
            El SSL se activa automáticamente una vez que el dominio apunte correctamente.
          </p>
        </div>
      )}
    </div>
  )
}
