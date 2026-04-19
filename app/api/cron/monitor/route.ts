import { NextResponse } from 'next/server'
import { runAllChecks, type CheckResult } from '@/lib/monitor'
import { createServiceClient } from '@/lib/supabase/server'
import { sendMonitorAlert, sendMonitorRecovery } from '@/lib/whatsapp'
import type { StoreConfig } from '@/types'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const ALERT_COOLDOWN_MS = 30 * 60 * 1000 // 30 min entre re-alertas del mismo check

// ─── Auth ─────────────────────────────────────────────────────────────────────

function isAuthorized(req: Request): boolean {
  const auth = req.headers.get('authorization')
  const secret = process.env.CRON_SECRET
  if (!secret) return true // En dev sin secret, permitir
  return auth === `Bearer ${secret}`
}

// ─── Monitor de un store ──────────────────────────────────────────────────────
//
// check_name usa el formato "{store_id}:{nombre}" para garantizar unicidad
// en la tabla monitor_incidents cuando hay múltiples stores activos.
// Los datos de stores con un único store siguen siendo compatibles con el
// formato legacy (solo "{nombre}") si el store_id coincide con el env var.
//

async function monitorStore(
  store: StoreConfig,
  supabase: ReturnType<typeof createServiceClient>,
  now: Date,
): Promise<{ store: StoreConfig; alerted: string[]; recovered: string[] }> {
  const baseUrl = store.base_url!
  const nowIso = now.toISOString()

  // 1. Correr todos los checks
  const results = await runAllChecks(baseUrl)

  // Prefijo para diferenciar por store en la tabla compartida
  const prefix = `${store.id}:`

  // 2. Leer estado anterior de este store
  const { data: prevIncidents } = await supabase
    .from('monitor_incidents')
    .select('*')
    .like('check_name', `${prefix}%`)

  const prevMap = new Map<string, {
    status: string
    fail_count: number
    last_alerted_at: string | null
  }>()
  for (const row of prevIncidents ?? []) {
    prevMap.set(row.check_name, row)
  }

  // 3. Determinar qué checks necesitan alerta
  const checksToAlert: CheckResult[] = []
  const recovered: CheckResult[] = []

  for (const check of results) {
    const key = `${prefix}${check.name}`
    const prev = prevMap.get(key)
    const prevStatus = prev?.status ?? 'unknown'
    const wasOk = prevStatus === 'ok' || prevStatus === 'unknown'

    if (!check.ok) {
      if (wasOk) {
        checksToAlert.push(check)
      } else if (prev) {
        const lastAlerted = prev.last_alerted_at ? new Date(prev.last_alerted_at).getTime() : 0
        const msSinceAlert = now.getTime() - lastAlerted
        if (msSinceAlert >= ALERT_COOLDOWN_MS) {
          checksToAlert.push(check)
        }
      }
    } else if (prevStatus === 'fail') {
      recovered.push(check)
    }
  }

  // 4. Upsert estado en Supabase
  const upsertRows = results.map((check) => {
    const key = `${prefix}${check.name}`
    const prev = prevMap.get(key)
    const isAlerted = checksToAlert.some((c) => c.name === check.name)

    return {
      check_name: key,
      label: check.label,
      category: check.category,
      status: check.ok ? 'ok' : 'fail',
      message: check.message ?? null,
      response_ms: check.ms,
      http_status: check.httpStatus ?? null,
      fail_count: check.ok ? 0 : (prev?.fail_count ?? 0) + 1,
      last_checked_at: nowIso,
      last_ok_at: check.ok ? nowIso : (prev ? undefined : null),
      last_fail_at: !check.ok ? nowIso : (prev ? undefined : null),
      last_alerted_at: isAlerted ? nowIso : (prev?.last_alerted_at ?? null),
      store_id: store.id,
    }
  })

  await supabase.from('monitor_incidents').upsert(upsertRows, { onConflict: 'check_name' })

  // 5. Enviar alertas WhatsApp (incluye nombre del store en el mensaje)
  if (checksToAlert.length > 0) {
    await sendMonitorAlert(
      checksToAlert.map((c) => ({ label: `[${store.name}] ${c.label}`, message: c.message })),
      baseUrl,
    )
  }

  if (recovered.length > 0) {
    await sendMonitorRecovery(
      recovered.map((c) => ({ label: `[${store.name}] ${c.label}` })),
      baseUrl,
    )
  }

  return {
    store,
    alerted: checksToAlert.map((c) => c.name),
    recovered: recovered.map((c) => c.name),
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()

  // ?store_id= opcional para disparar chequeo manual de un store específico
  // Sin el param, corre sobre todos los stores activos (comportamiento normal del cron)
  const filterStoreId = new URL(req.url).searchParams.get('store_id')

  // Obtener todos los stores con base_url configurada
  // Si no hay ninguno, usar el env var como fallback (single-tenant legacy)
  const { data: storesWithUrl } = await (
    filterStoreId
      ? supabase.from('store_config').select('*').not('base_url', 'is', null).eq('id', filterStoreId)
      : supabase.from('store_config').select('*').not('base_url', 'is', null)
  )

  const stores: StoreConfig[] = storesWithUrl ?? []

  // Fallback single-tenant: usar NEXT_PUBLIC_BASE_URL si no hay stores configurados
  if (stores.length === 0) {
    const fallbackUrl = process.env.NEXT_PUBLIC_BASE_URL ?? new URL(req.url).origin
    const storeId = process.env.NEXT_PUBLIC_STORE_ID
    if (!storeId) {
      return NextResponse.json({ error: 'No stores with base_url configured' }, { status: 404 })
    }
    const { data: fallbackStore } = await supabase
      .from('store_config')
      .select('*')
      .eq('id', storeId)
      .single()
    if (fallbackStore) {
      stores.push({ ...fallbackStore, base_url: fallbackUrl } as StoreConfig)
    }
  }

  // Monitorear todos los stores en paralelo
  const results = await Promise.allSettled(
    stores.map((store) => monitorStore(store, supabase, now)),
  )

  const summary = results.map((r, i) => {
    if (r.status === 'fulfilled') {
      return {
        store: stores[i].name,
        alerted: r.value.alerted,
        recovered: r.value.recovered,
      }
    }
    return { store: stores[i].name, error: String(r.reason) }
  })

  return NextResponse.json({
    ran_at: now.toISOString(),
    stores_checked: stores.length,
    summary,
  })
}
