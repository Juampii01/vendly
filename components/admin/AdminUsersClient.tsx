'use client'

import { useState } from 'react'

interface AdminUser {
  id: string
  email: string
  role: 'owner' | 'admin'
  created_at: string
}

interface Props {
  initialUsers: AdminUser[]
  currentUserEmail: string
  currentUserRole: string | null
  isBootstrap: boolean
}

export function AdminUsersClient({ initialUsers, currentUserEmail, currentUserRole, isBootstrap }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers)
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<'admin' | 'owner'>('admin')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [removingEmail, setRemovingEmail] = useState<string | null>(null)

  const canManage = isBootstrap || currentUserRole === 'owner'

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim()) return
    setAdding(true)
    setAddError('')

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
    })
    const data = await res.json()

    if (!res.ok) {
      setAddError(data.error ?? 'Error al agregar')
    } else if (data.data) {
      // Usar el id real de la DB — antes generábamos un UUID falso en cliente que
      // descoordinaba la lista del estado real (ej. al borrar inmediatamente).
      setUsers((prev) => [...prev, data.data as AdminUser])
      setNewEmail('')
    } else {
      setNewEmail('')
    }
    setAdding(false)
  }

  async function handleRemove(email: string) {
    setRemovingEmail(email)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.email !== email))
    }
    setRemovingEmail(null)
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Modo bootstrap */}
      {isBootstrap && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm font-semibold text-amber-800">Modo configuración inicial</p>
          <p className="mt-1 text-sm text-amber-700">
            Todavía no hay admins configurados. Agregá tu email como <strong>owner</strong> para
            activar el control de acceso. Una vez que lo hagas, solo los emails que agregues
            podrán ingresar al panel.
          </p>
        </div>
      )}

      {/* Lista de usuarios */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-slate-900">Acceso actual</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {users.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No hay usuarios configurados aún.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Rol</th>
                  <th className="px-5 py-3 text-left">Desde</th>
                  {canManage && <th className="px-5 py-3" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isYou = u.email.toLowerCase() === currentUserEmail.toLowerCase()
                  return (
                    <tr key={u.email} className="hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-800">{u.email}</span>
                        {isYou && (
                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
                            Vos
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {new Date(u.created_at).toLocaleDateString('es-AR')}
                      </td>
                      {canManage && (
                        <td className="px-5 py-3.5 text-right">
                          {!isYou && u.role !== 'owner' && (
                            <button
                              onClick={() => handleRemove(u.email)}
                              disabled={removingEmail === u.email}
                              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40 transition-colors"
                            >
                              {removingEmail === u.email ? 'Eliminando...' : 'Eliminar'}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Agregar usuario */}
      {canManage && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-slate-900">Agregar usuario</h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => { setNewEmail(e.target.value); setAddError('') }}
                  placeholder="email@ejemplo.com"
                  required
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                />
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'owner')}
                  className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-400 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  {adding ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
              {addError && (
                <p className="text-sm text-red-600">{addError}</p>
              )}
            </form>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-500">Owner</strong> — acceso completo, puede agregar y eliminar otros admins.<br />
                <strong className="text-slate-500">Admin</strong> — puede gestionar productos, órdenes y clientes. No puede gestionar usuarios.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                El usuario recibirá acceso automáticamente la próxima vez que inicie sesión con ese email.
              </p>
            </div>
          </div>
        </div>
      )}

      {!canManage && (
        <p className="text-sm text-slate-400">
          Solo el owner puede gestionar el acceso de otros usuarios.
        </p>
      )}
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'owner') {
    return (
      <span className="inline-block rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-bold text-violet-700">
        Owner
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
      Admin
    </span>
  )
}
