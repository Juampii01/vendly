import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'
import { getStoreConfig } from '@/lib/store'
import { getStoreId } from '@/lib/tenant'
import { AdminSidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // El middleware ya validó la sesión y redirige si no hay usuario.
  // Leemos user desde los headers que inyectó el middleware —
  // elimina el segundo roundtrip a Supabase Auth por request.
  const h = await headers()
  const userId = h.get('x-user-id')
  const userEmail = h.get('x-user-email') ?? ''

  if (!userId) redirect('/admin/login')

  // ── Verificar acceso al store ─────────────────────────────────────────────────
  //
  // Orden de verificación:
  //   1. Platform user → acceso total a todos los stores (operador de Vendly)
  //   2. admin_users del store → acceso normal de cliente
  //   3. Bootstrap (tabla vacía) → primer usuario autenticado pasa
  //
  // Las tres queries corren en paralelo para no agregar latencia.
  //
  const [storeId, service] = [await getStoreId(), createServiceClient()]

  const [{ data: platformUser }, { data: adminUser }, store] = await Promise.all([
    service
      .from('platform_users')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle(),
    service
      .from('admin_users')
      .select('id, role')
      .eq('store_id', storeId)
      .eq('email', userEmail)
      .maybeSingle(),
    getStoreConfig(),
  ])

  // Platform users pasan directo — son los operadores de la plataforma
  if (!platformUser && !adminUser) {
    const { count } = await service
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', storeId)

    if (count && count > 0) {
      // Ya hay admins configurados y este usuario no es uno → sin acceso
      redirect('/admin/login?error=sin_acceso')
    }

    // ── Bootstrap: 0 admins registrados ─────────────────────────────────────
    //
    // Solo permitimos el acceso si el email del usuario coincide con el email
    // de contacto del store. Esto previene que cualquier usuario autenticado
    // de otra tienda acceda en modo bootstrap.
    //
    // Si no hay email de store configurado → denegar por seguridad.
    //
    if (!store.email || userEmail.toLowerCase() !== store.email.toLowerCase()) {
      redirect('/admin/login?error=sin_acceso')
    }

    // Bootstrap válido → auto-crear el primer owner
    // Usamos upsert para que sea idempotente en caso de condición de carrera.
    const { error: insertErr } = await service
      .from('admin_users')
      .upsert(
        { store_id: storeId, email: userEmail.toLowerCase(), role: 'owner' },
        { onConflict: 'store_id,email', ignoreDuplicates: true },
      )
    if (insertErr) {
      console.error('[bootstrap] No se pudo crear owner:', insertErr)
      redirect('/admin/login?error=bootstrap_failed')
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar store={store} userEmail={userEmail} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
