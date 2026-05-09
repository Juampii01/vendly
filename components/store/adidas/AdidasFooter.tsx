import Link from 'next/link'
import type { StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
}

const COLUMNS = [
  {
    title: 'Productos',
    links: [
      { label: 'Hombre',  href: '/productos?categoria=hombre' },
      { label: 'Mujer',   href: '/productos?categoria=mujer' },
      { label: 'Niños',   href: '/productos?categoria=ninos' },
      { label: 'Outlet',  href: '/productos?tag=sale' },
      { label: 'Drops nuevos', href: '/productos?featured=true' },
    ],
  },
  {
    title: 'Deportes',
    links: [
      { label: 'Running',     href: '/productos?categoria=running' },
      { label: 'Football',    href: '/productos?categoria=football' },
      { label: 'Basketball',  href: '/productos?categoria=basketball' },
      { label: 'Training',    href: '/productos?categoria=training' },
      { label: 'Originals',   href: '/productos?categoria=originals' },
    ],
  },
  {
    title: 'Soporte',
    links: [
      { label: 'Estado de mi pedido', href: '/cuenta' },
      { label: 'Envíos y devoluciones', href: '/envios' },
      { label: 'Guía de talles', href: '/talles' },
      { label: 'Centro de ayuda', href: '/ayuda' },
      { label: 'Contacto', href: '/contacto' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '/about' },
      { label: 'Sustentabilidad', href: '/sustentabilidad' },
      { label: 'Atletas', href: '/atletas' },
      { label: 'Trabajá con nosotros', href: '/empleos' },
      { label: 'Prensa', href: '/prensa' },
    ],
  },
]

function ThreeStripes({ color = '#fff' }: { color?: string }) {
  return (
    <div className="inline-flex items-end gap-[3px]">
      <span className="block w-[3px] h-3" style={{ backgroundColor: color }} />
      <span className="block w-[3px] h-5" style={{ backgroundColor: color }} />
      <span className="block w-[3px] h-7" style={{ backgroundColor: color }} />
    </div>
  )
}

export function AdidasFooter({ store }: Props) {
  return (
    <footer style={{ backgroundColor: '#000', color: '#fff' }}>

      {/* ── CTA strip ───────────────────────────────────────────────────── */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.45em] mb-2" style={{ color: '#FF3A20' }}>
              ¿Listo para superarte?
            </p>
            <h3 className="text-3xl md:text-4xl font-black uppercase leading-tight tracking-[-0.03em]">
              Hablá con nosotros
            </h3>
          </div>
          <Link href="/contacto"
            className="inline-flex items-center gap-3 px-9 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all hover:gap-5"
            style={{ backgroundColor: '#FF3A20', color: '#fff' }}>
            Contacto <span>→</span>
          </Link>
        </div>
      </div>

      {/* ── Main columns ────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        {/* Brand column */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-5">
            <ThreeStripes color="#fff" />
            <span className="font-black uppercase tracking-[-0.02em] text-lg">{store.name || 'Adidas'}</span>
          </div>
          <p className="text-sm text-white/55 leading-relaxed mb-7 max-w-xs">
            Equipo técnico y lifestyle para los que no se conforman.
            Desde 1949.
          </p>
          {/* Social */}
          <div className="flex items-center gap-2">
            {[
              { label: 'IG', href: store.instagram_url ?? '#' },
              { label: 'FB', href: '#' },
              { label: 'YT', href: '#' },
              { label: 'TT', href: '#' },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center text-[9px] font-black uppercase tracking-wider border transition-colors hover:bg-white hover:text-black"
                style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {COLUMNS.map(col => (
          <div key={col.title}>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 text-white/45">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/75 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="border-t py-7" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-[10px] text-white/35">
            <span>© {new Date().getFullYear()} {store.name || 'Adidas'}. Todos los derechos reservados.</span>
            <Link href="/terminos" className="hover:text-white transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/35">
            <span>🌐</span>
            <span className="font-black uppercase tracking-[0.3em]">Argentina · ES</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
