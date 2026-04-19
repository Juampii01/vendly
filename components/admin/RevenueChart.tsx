interface DayData {
  date: string   // 'DD/MM'
  revenue: number
  orders: number
}

interface RevenueChartProps {
  data: DayData[]
  accent?: string
}

export function RevenueChart({ data, accent = '#6366f1' }: RevenueChartProps) {
  if (!data.length) return null

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const W = 560
  const H = 140
  const PAD_LEFT = 0
  const PAD_BOTTOM = 28
  const chartW = W - PAD_LEFT
  const chartH = H - PAD_BOTTOM

  // Build SVG path for line chart
  const points = data.map((d, i) => {
    const x = PAD_LEFT + (i / (data.length - 1)) * chartW
    const y = chartH - (d.revenue / maxRevenue) * chartH
    return { x, y, ...d }
  })

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')

  const areaPath =
    `M ${points[0].x.toFixed(1)} ${chartH} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ` L ${points[points.length - 1].x.toFixed(1)} ${chartH} Z`

  // Show every ~5th label to avoid crowding
  const step = Math.ceil(data.length / 7)

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Revenue — últimos 30 días
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatPrice(totalRevenue)}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {totalOrders} {totalOrders === 1 ? 'orden aprobada' : 'órdenes aprobadas'}
          </p>
        </div>
      </div>

      <div className="overflow-hidden">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          preserveAspectRatio="none"
          style={{ height: 140 }}
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={PAD_LEFT}
              y1={(chartH * (1 - f)).toFixed(1)}
              x2={W}
              y2={(chartH * (1 - f)).toFixed(1)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#revGrad)" />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Dots on every visible point */}
          {points.map((p, i) =>
            i % step === 0 || i === points.length - 1 ? (
              <circle key={i} cx={p.x} cy={p.y} r="3" fill={accent} />
            ) : null,
          )}

          {/* X-axis labels */}
          {points.map((p, i) =>
            i % step === 0 || i === points.length - 1 ? (
              <text
                key={`lbl-${i}`}
                x={p.x}
                y={H - 6}
                textAnchor="middle"
                fontSize="9"
                fill="#94a3b8"
                fontFamily="inherit"
              >
                {p.date}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  )
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
}
