import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runAllChecks } from '@/lib/monitor'
import { requirePlatformAccess } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/platform/stores/[id]/monitor
 *
 * Dispara un chequeo manual de un store específico desde el platform admin.
 * Requiere sesión de platform user (x-user-email inyectado por middleware).
 * Actualiza monitor_incidents igual que el cron, pero sin enviar alertas WhatsApp.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePlatformAccess()
  if ('error' in auth) return auth.error

  const { id } = await params
  const supabase = createServiceClient()

  const { data: store } = await supabase
    .from('store_config')
    .select('id, name, base_url')
    .eq('id', id)
    .maybeSingle()

  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  if (!store.base_url) {
    return NextResponse.json(
      { error: 'El store no tiene base_url configurado.' },
      { status: 400 },
    )
  }

  const now = new Date().toISOString()
  const prefix = `${id}:`

  // Correr todos los checks en paralelo
  const results = await runAllChecks(store.base_url)

  // Leer fail_counts actuales para incrementar correctamente
  const { data: existing } = await supabase
    .from('monitor_incidents')
    .select('check_name, fail_count')
    .eq('store_id', id)

  const prevCounts = new Map<string, number>()
  for (const row of existing ?? []) {
    prevCounts.set(row.check_name, row.fail_count ?? 0)
  }

  const upsertRows = results.map((check) => {
    const key = `${prefix}${check.name}`
    const prevCount = prevCounts.get(key) ?? 0
    const base = {
      check_name: key,
      label: check.label,
      category: check.category,
      status: check.ok ? 'ok' : 'fail',
      message: check.message ?? null,
      response_ms: check.ms,
      http_status: check.httpStatus ?? null,
      fail_count: check.ok ? 0 : prevCount + 1,
      last_checked_at: now,
      store_id: id,
    }
    return check.ok
      ? { ...base, last_ok_at: now }
      : { ...base, last_fail_at: now }
  })

  await supabase
    .from('monitor_incidents')
    .upsert(upsertRows, { onConflict: 'check_name' })

  const failCount = results.filter((r) => !r.ok).length

  return NextResponse.json({
    ok: true,
    store: store.name,
    checked: results.length,
    fails: failCount,
  })
}
