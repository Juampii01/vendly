interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  accent?: string
}

export function MetricCard({ title, value, subtitle, icon, trend, accent = '#6366f1' }: MetricCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
      {/* Accent top border */}
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ backgroundColor: accent }} />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-black text-slate-900 leading-none">{value}</p>
          {subtitle && (
            <p className="mt-1.5 text-[11px] text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${
              trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
            }`}>
              <span>{trend.value >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="font-normal text-slate-400">{trend.label}</span>
            </p>
          )}
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent + '15', color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
