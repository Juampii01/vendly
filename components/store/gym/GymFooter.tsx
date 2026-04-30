import Link from 'next/link'
import type { StoreConfig, Category } from '@/types'

interface Props { store: StoreConfig; categories: Category[] }

export function GymFooter({ store, categories }: Props) {
  const ACCENT = store.color_accent
  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quiero información sobre membresías.`
    : null

  return (
    <footer style={{ backgroundColor: '#0a0a0a', borderTop: `2px solid ${ACCENT}` }}>
      <div className="mx-auto max-w-7xl px-6 md:px-10 pt-16 pb-10 grid grid-cols-1 md:grid-cols-4 gap-12">

        {/* Marca */}
        <div className="md:col-span-2">
          <p className="text-2xl font-black uppercase tracking-[0.25em] mb-4" style={{ color: '#f5f5f5', letterSpacing: '-0.01em' }}>
            {store.name}
          </p>
          <p className="text-xs leading-relaxed mb-6 max-w-xs" style={{ color: 'rgba(245,245,245,0.35)' }}>
            {store.meta_description ?? 'Entrenamiento de alto rendimiento en Buenos Aires. Membresías, clases y personal training.'}
          </p>
          <div className="flex gap-3">
            {store.instagram_url && (
              <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center h-9 w-9 border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                style={{ borderColor: 'rgba(245,245,245,0.12)', color: 'rgba(245,245,245,0.4)', ['--accent' as string]: ACCENT }}
                aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center h-9 px-4 text-[10px] font-black uppercase tracking-[0.15em] transition-opacity hover:opacity-80"
                style={{ backgroundColor: ACCENT, color: '#fff' }}>
                WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Links */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: ACCENT }}>
            El gym
          </p>
          <ul className="space-y-3">
            {[{ href: '/productos?categoria=membresias', label: 'Membresías' }, { href: '/productos?categoria=clases', label: 'Clases' }, { href: '/productos?categoria=personal-training', label: 'Personal Training' }, { href: '/productos?categoria=suplementos', label: 'Suplementos' }].map(item => (
              <li key={item.href}>
                <Link href={item.href} className="text-xs transition-colors hover:text-white"
                  style={{ color: 'rgba(245,245,245,0.4)' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: ACCENT }}>
            Horarios
          </p>
          <div className="space-y-2 text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>
            <p>Lun — Vie: 06:00 – 23:00</p>
            <p>Sábado: 08:00 – 20:00</p>
            <p>Domingo: 09:00 – 14:00</p>
            {store.email && (
              <a href={`mailto:${store.email}`} className="block mt-4 hover:text-white transition-colors">
                {store.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t px-6 md:px-10 py-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2"
        style={{ borderColor: 'rgba(245,245,245,0.05)' }}>
        <p className="text-[10px]" style={{ color: 'rgba(245,245,245,0.2)' }}>
          © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
        </p>
        <p className="text-[10px]" style={{ color: 'rgba(245,245,245,0.15)' }}>
          Powered by <span className="font-black uppercase tracking-wider">Vendly</span>
        </p>
      </div>
    </footer>
  )
}
