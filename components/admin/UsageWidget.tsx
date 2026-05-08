import { PLAN_LIMITS, USAGE_KEYS, currentPeriod, readUsageAll, type Plan, type UsageKey } from '@/lib/plan-limits'

interface Props {
  storeId: string
  plan: Plan
}

const KEY_LABELS: Record<UsageKey, string> = {
  ai_generate:   'IA — Generar contenido',
  ai_design:     'IA — Diseño',
  ai_content:    'IA — Reescribir',
  email_sent:    'Emails enviados',
  whatsapp_sent: 'WhatsApp enviados',
}

const KEY_ICONS: Record<UsageKey, string> = {
  ai_generate:   '✨',
  ai_design:     '🎨',
  ai_content:    '📝',
  email_sent:    '✉',
  whatsapp_sent: '💬',
}

/**
 * Widget para el dashboard de admin: muestra el uso del mes actual contra
 * los límites del plan. Server-rendered (consulta DB en server).
 *
 * Cuando billing real esté implementado, este widget sigue sirviendo idéntico
 * — solo cambian los límites mostrados según la suscripción real.
 */
export async function UsageWidget({ storeId, plan }: Props) {
  const usage = await readUsageAll(storeId)
  const period = currentPeriod()
  // Mes en formato legible para humanos (ej: "Mayo 2026")
  const monthName = new Date(`${period.slice(0, 4)}-${period.slice(4, 6)}-01T00:00:00Z`)
    .toLocaleDateString('es', { month: 'long', year: 'numeric' })

  const limits = PLAN_LIMITS[plan]
  const items = USAGE_KEYS.map(k => ({
    key: k,
    label: KEY_LABELS[k],
    icon: KEY_ICONS[k],
    used: usage[k],
    limit: limits[k],
  }))

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Uso del plan</p>
          <h2 className="text-base font-bold text-slate-900 capitalize">{monthName}</h2>
        </div>
        <PlanPill plan={plan} />
      </div>

      <div className="space-y-2.5">
        {items.map(({ key, label, icon, used, limit }) => (
          <UsageBar key={key} label={label} icon={icon} used={used} limit={limit} />
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
        Los límites se reinician el 1° de cada mes (UTC). Para subir tu plan,
        contactá a soporte.
      </p>
    </div>
  )
}

function UsageBar({ label, icon, used, limit }: {
  label: string; icon: string; used: number; limit: number | null
}) {
  const pct = limit === null
    ? 0
    : Math.min(100, Math.round((used / limit) * 100))
  const danger = limit !== null && used >= limit
  const warn   = limit !== null && pct >= 80 && !danger

  const barColor =
    danger ? 'bg-red-500'
    : warn ? 'bg-amber-500'
    : 'bg-slate-700'

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm w-5 text-center">{icon}</span>
        <span className="text-xs text-slate-700 flex-1">{label}</span>
        <span className={`text-xs font-mono ${danger ? 'text-red-600' : 'text-slate-500'}`}>
          {used.toLocaleString()}
          {limit !== null && <span className="text-slate-400"> / {limit.toLocaleString()}</span>}
          {limit === null && <span className="text-slate-400"> · ilimitado</span>}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: limit === null ? '100%' : `${pct}%`, opacity: limit === null ? 0.15 : 1 }}
        />
      </div>
    </div>
  )
}

const PLAN_PILL_STYLES: Record<Plan, string> = {
  free:       'bg-slate-100 text-slate-600 border-slate-200',
  starter:    'bg-blue-50 text-blue-700 border-blue-200',
  pro:        'bg-purple-50 text-purple-700 border-purple-200',
  enterprise: 'bg-amber-50 text-amber-700 border-amber-200',
}

function PlanPill({ plan }: { plan: Plan }) {
  return (
    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${PLAN_PILL_STYLES[plan]}`}>
      {plan}
    </span>
  )
}
