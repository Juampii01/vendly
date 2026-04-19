import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import StoreStatusControl from './StoreStatusControl'
import TriggerMonitorButton from './TriggerMonitorButton'

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'vendly.com'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('store_config')
    .select('name')
    .eq('id', id)
    .maybeSingle()
  return { title: data ? `${data.name} — Platform` : 'Store — Platform' }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function StoreManagePage({ params }: Props) {
  const { id } = await params
  const supabase = createServiceClient()

  const [
    { data: store },
    { data: domains },
    { data: tenantCfg },
    { data: incidents },
    { count: orderCount },
    { count: productCount },
    { data: admins },
  ] = await Promise.all([
    supabase
      .from('store_config')
      .select(
        'id, name, slug, status, plan, plan_expires_at, currency, locale, base_url, template_id, created_at, updated_at',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('store_domains')
      .select('id, domain, is_primary, created_at')
      .eq('store_id', id)
      .order('is_primary', { ascending: false }),
    supabase
      .from('tenant_config')
      .select(
        'mp_access_token, mp_public_key, resend_api_key, resend_from_domain, wa_api_key, wa_from_number',
      )
      .eq('store_id', id)
      .maybeSingle(),
    supabase
      .from('monitor_incidents')
      .select(
        'check_name, label, category, status, message, response_ms, http_status, fail_count, last_checked_at, last_ok_at, last_fail_at',
      )
      .eq('store_id', id)
      .order('category')
      .order('label'),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', id),
    supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', id)
      .eq('is_active', true),
    supabase
      .from('admin_users')
      .select('id, email, role, created_at')
      .eq('store_id', id)
      .order('created_at'),
  ])

  if (!store) notFound()

  // URLs
  const primaryDomain = domains?.find((d) => d.is_primary)?.domain ?? null
  const isDev = process.env.NODE_ENV === 'development'
  const storeUrl = isDev
    ? `http://${store.slug}.localhost:3000`
    : primaryDomain
      ? `https://${primaryDomain}`
      : store.base_url ?? `https://${store.slug}.${ROOT_DOMAIN}`
  const adminUrl = `${storeUrl}/admin`
  const hasBaseUrl = !!store.base_url

  // Integraciones — solo verificamos si están configuradas, nunca mostramos valores
  const hasTenant = !!tenantCfg
  const integrations = [
    {
      name: 'MercadoPago',
      note: 'Pagos online',
      configured: !!(tenantCfg?.mp_access_token),
    },
    {
      name: 'Resend',
      note: 'Emails transaccionales',
      configured: !!(tenantCfg?.resend_api_key),
    },
    {
      name: 'WhatsApp',
      note: 'Notificaciones',
      configured: !!(tenantCfg?.wa_api_key),
    },
  ]

  // Monitor — separar activos de sanos
  const allIncidents = incidents ?? []
  const activeIncidents = allIncidents.filter((i) => i.status === 'fail')
  const healthyChecks = allIncidents.filter((i) => i.status === 'ok')
  const unknownChecks = allIncidents.filter((i) => i.status === 'unknown')
  const hasMonitorData = allIncidents.length > 0

  return (
    <div className="p-8 max-w-5xl">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <Link
          href="/platform/stores"
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3 inline-block"
        >
          ← Stores
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white">{store.name}</h1>
            <p className="text-slate-500 font-mono text-sm mt-0.5">{store.slug}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              ↗ Store
            </a>
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              ↗ Admin
            </a>
            <Link
              href={`/platform/stores/${store.id}/design`}
              className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              ✦ Editor
            </Link>
            <StoreStatusControl storeId={store.id} currentStatus={store.status} />
          </div>
        </div>
      </div>

      {/* ── Métricas ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard label="Órdenes" value={orderCount ?? 0} />
        <MetricCard label="Productos activos" value={productCount ?? 0} />
        <MetricCard label="Admins" value={admins?.length ?? 0} />
        <MetricCard label="Plan" value={store.plan.toUpperCase()} accent />
      </div>

      {/* ── Fila 1: Config + Dominios ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Configuración */}
        <SectionCard title="Configuración">
          <DataRow label="ID" value={store.id} mono xs />
          <DataRow label="Slug" value={store.slug} mono />
          <DataRow label="Plan" value={store.plan} badge />
          <DataRow label="Estado" value={store.status} badge />
          <DataRow label="Moneda" value={store.currency} />
          <DataRow label="Locale" value={store.locale} />
          <DataRow label="Base URL" value={store.base_url ?? '—'} mono xs />
          <DataRow
            label="Creado"
            value={new Date(store.created_at).toLocaleDateString('es-AR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          />
          {store.plan_expires_at && (
            <DataRow
              label="Plan vence"
              value={new Date(store.plan_expires_at).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            />
          )}
        </SectionCard>

        {/* Dominios */}
        <SectionCard title="Dominios">
          {domains && domains.length > 0 ? (
            <ul className="space-y-0">
              {domains.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {d.is_primary && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-900/60 text-purple-300">
                        principal
                      </span>
                    )}
                    <a
                      href={`https://${d.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-white hover:text-slate-300 transition-colors truncate"
                    >
                      {d.domain}
                    </a>
                  </div>
                  <span className="text-xs text-slate-600 shrink-0 ml-3">
                    {new Date(d.created_at).toLocaleDateString('es-AR')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-2">
              <p className="text-sm text-slate-500">Sin dominio propio configurado.</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Accesible en:{' '}
                <span className="font-mono text-slate-400">
                  {store.slug}.{ROOT_DOMAIN}
                </span>{' '}
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-500 border border-slate-700">
                  preview
                </span>
              </p>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Fila 2: Integraciones + Monitor activo ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Integraciones */}
        <SectionCard title="Integraciones">
          <div className="space-y-0">
            {integrations.map((integ) => (
              <div
                key={integ.name}
                className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
              >
                <div>
                  <p className="text-sm text-white font-medium">{integ.name}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{integ.note}</p>
                </div>
                <IntegrationStatus configured={integ.configured} hasTenant={hasTenant} />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Monitor — estado actual */}
        <SectionCard title="Monitor — estado actual">
          {!hasMonitorData ? (
            <div className="py-4">
              <p className="text-sm text-slate-500">Sin datos de monitor todavía.</p>
              {!hasBaseUrl && (
                <p className="text-xs text-slate-600 mt-2">
                  El store no tiene{' '}
                  <span className="font-mono">base_url</span> configurado — el cron
                  no puede chequearlo.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Incidentes activos */}
              {activeIncidents.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-400 mb-2">
                    ✗ Incidentes activos — {activeIncidents.length}
                  </p>
                  <ul className="space-y-1.5">
                    {activeIncidents.map((inc) => (
                      <li
                        key={inc.check_name}
                        className="flex items-start gap-2 py-1.5 border-b border-red-900/20 last:border-0"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-red-300 leading-tight">
                            {inc.label}
                          </p>
                          {inc.message && (
                            <p className="text-[11px] text-red-400/60 truncate mt-0.5">
                              {inc.message}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">Sin incidentes activos.</p>
              )}

              {/* Checks sanos */}
              {healthyChecks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-500/70 mb-2">
                    ✓ Checks sanos — {healthyChecks.length}
                  </p>
                  <ul className="space-y-0">
                    {healthyChecks.map((inc) => (
                      <li
                        key={inc.check_name}
                        className="flex items-center gap-2 py-1.5 border-b border-slate-800/40 last:border-0"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-green-600 shrink-0" />
                        <span className="text-xs text-slate-400 flex-1">{inc.label}</span>
                        {inc.response_ms != null && (
                          <span className="text-[11px] text-slate-600 tabular-nums">
                            {inc.response_ms}ms
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sin estado */}
              {unknownChecks.length > 0 && (
                <p className="text-xs text-slate-600">
                  {unknownChecks.length} check{unknownChecks.length !== 1 ? 's' : ''} sin estado aún.
                </p>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Historial de checks ─────────────────────────────────────────── */}
      {hasMonitorData && (
        <div className="mb-4">
          <SectionCard title="Historial de checks">
            <div className="overflow-x-auto -mx-5 -mb-5">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-5 py-2.5 text-left text-slate-500 font-medium">Check</th>
                    <th className="px-3 py-2.5 text-left text-slate-500 font-medium">Cat.</th>
                    <th className="px-3 py-2.5 text-center text-slate-500 font-medium">Estado</th>
                    <th className="px-3 py-2.5 text-right text-slate-500 font-medium">Resp.</th>
                    <th className="px-3 py-2.5 text-right text-slate-500 font-medium">HTTP</th>
                    <th className="px-3 py-2.5 text-right text-slate-500 font-medium">Fallos</th>
                    <th className="px-5 py-2.5 text-right text-slate-500 font-medium">
                      Última verificación
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allIncidents.map((inc) => (
                    <tr
                      key={inc.check_name}
                      className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="px-5 py-2.5">
                        <p className="text-slate-300 font-medium">{inc.label}</p>
                        {inc.message && inc.status === 'fail' && (
                          <p className="text-red-400/60 mt-0.5 truncate max-w-[220px]">
                            {inc.message}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 font-mono">{inc.category}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`font-bold text-sm ${
                            inc.status === 'ok'
                              ? 'text-green-400'
                              : inc.status === 'fail'
                              ? 'text-red-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {inc.status === 'ok' ? '✓' : inc.status === 'fail' ? '✗' : '?'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-500 font-mono tabular-nums">
                        {inc.response_ms != null ? `${inc.response_ms}ms` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-500 font-mono tabular-nums">
                        {inc.http_status ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        <span
                          className={
                            inc.fail_count > 0 ? 'text-red-400 font-semibold' : 'text-slate-600'
                          }
                        >
                          {inc.fail_count}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right text-slate-600 tabular-nums">
                        {new Date(inc.last_checked_at).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* ── Admins del store ────────────────────────────────────────────── */}
      <div className="mb-8">
        <SectionCard title="Admins del store">
          {admins && admins.length > 0 ? (
            <ul className="space-y-0">
              {admins.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between py-2.5 border-b border-slate-800 last:border-0"
                >
                  <span className="text-sm text-white">{a.email}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      a.role === 'owner'
                        ? 'bg-amber-900/60 text-amber-300'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {a.role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Sin admins configurados.</p>
          )}
        </SectionCard>
      </div>

      {/* ── Acciones finales ─────────────────────────────────────────────── */}
      <TriggerMonitorButton storeId={store.id} hasBaseUrl={hasBaseUrl} />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
        {title}
      </h2>
      {children}
    </section>
  )
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${accent ? 'text-purple-300' : 'text-white'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function DataRow({
  label,
  value,
  mono,
  xs,
  badge,
}: {
  label: string
  value: string
  mono?: boolean
  xs?: boolean
  badge?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-slate-800/40 last:border-0">
      <dt className="text-xs text-slate-500 shrink-0 pt-0.5 leading-tight">{label}</dt>
      <dd
        className={`text-right break-all leading-tight ${
          mono
            ? `font-mono text-slate-300 ${xs ? 'text-[11px]' : 'text-xs'}`
            : 'text-sm text-white'
        }`}
      >
        {badge ? (
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 uppercase">
            {value}
          </span>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function IntegrationStatus({
  configured,
  hasTenant,
}: {
  configured: boolean
  hasTenant: boolean
}) {
  if (!hasTenant) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
        <span className="text-xs text-slate-600">Sin config</span>
      </span>
    )
  }
  if (configured) {
    return (
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        <span className="text-xs text-green-400 font-medium">Propio</span>
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      <span className="text-xs text-amber-400 font-medium">Fallback global</span>
    </span>
  )
}
