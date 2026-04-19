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
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
          {trend && (
            <p className={`mt-2 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent + '18', color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
