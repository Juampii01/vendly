import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getStoreId } from '@/lib/tenant'
import { AdminUsersClient } from '@/components/admin/AdminUsersClient'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Usuarios — Admin' }

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const storeId = await getStoreId()
  const service = createServiceClient()

  const { data: adminUsers, count } = await service
    .from('admin_users')
    .select('id, email, role, created_at', { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: true })

  const isBootstrap = !count || count === 0

  const currentAdmin = (adminUsers ?? []).find(
    (u: { email: string }) => u.email.toLowerCase() === user.email!.toLowerCase()
  )
  const currentUserRole = currentAdmin?.role ?? null

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
        <p className="mt-1 text-sm text-slate-500">
          Controlá quién puede acceder al panel de administración.
        </p>
      </div>

      <AdminUsersClient
        initialUsers={adminUsers ?? []}
        currentUserEmail={user.email!}
        currentUserRole={currentUserRole}
        isBootstrap={isBootstrap}
      />
    </div>
  )
}
