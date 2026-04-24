import Link from 'next/link'

interface Action {
  label: string
  href?: string
  onClick?: string   // para client components, se pasa como prop
  variant?: 'primary' | 'secondary'
}

interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-8">
        <div>
          <h1 className="text-lg font-black text-slate-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}

// ─── Shared button styles ─────────────────────────────────────────────────────

export function AdminPrimaryButton({
  children,
  href,
  onClick,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const cls = 'inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-slate-700 disabled:opacity-40'
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}

export function AdminSecondaryButton({
  children,
  href,
  onClick,
  disabled,
}: {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
}) {
  const cls = 'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 disabled:opacity-40'
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  )
}
