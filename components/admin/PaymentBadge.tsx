// Componente compartido — usado en admin/page.tsx y OrdersClient.tsx

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  approved:    { label: 'Aprobado',   cls: 'bg-green-50 text-green-700' },
  pending:     { label: 'Pendiente',  cls: 'bg-yellow-50 text-yellow-700' },
  rejected:    { label: 'Rechazado',  cls: 'bg-red-50 text-red-600' },
  in_process:  { label: 'En proceso', cls: 'bg-blue-50 text-blue-700' },
  cancelled:   { label: 'Cancelado',  cls: 'bg-slate-100 text-slate-500' },
  refunded:    { label: 'Reembolsado', cls: 'bg-purple-50 text-purple-700' },
  in_mediation:{ label: 'En mediación', cls: 'bg-orange-50 text-orange-700' },
}

export function PaymentBadge({ status }: { status: string }) {
  const { label, cls } = PAYMENT_STATUS_CONFIG[status] ?? {
    label: status,
    cls: 'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {label}
    </span>
  )
}
