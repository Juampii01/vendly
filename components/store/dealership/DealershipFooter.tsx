import Link from 'next/link'
import type { StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
}

export function DealershipFooter({ store, categories }: Props) {
  const year = new Date().getFullYear()
  const GOLD = store.color_accent

  return (
    <footer style={{ backgroundColor: '#0f172a', color: 'rgba(255,255,255,0.85)' }}>

      {/* ── CTA band — Test Drive ──────────────────────────────────────────── */}
      {store.whatsapp_number && (
        <div
          className="px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-2xl md:text-3xl font-black uppercase tracking-[-0.02em] leading-tight"
              style={{ color: '#ffffff' }}>
              ¿Querés conocer el auto<br className="hidden md:block" /> en persona?
            </p>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Agendá tu visita o test drive sin compromiso.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <a
              href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Hola, quiero agendar un test drive`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-center rounded-xl transition-all hover:brightness-110 text-white"
              style={{ backgroundColor: GOLD }}
            >
              Agendar test drive
            </a>
            <a
              href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-center border rounded-xl transition-all hover:bg-white/10 text-white"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* ── Links grid ────────────────────────────────────────────────────── */}
      <div className="px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Marca */}
        <div className="col-span-2 md:col-span-1">
          <p className="text-xl font-black uppercase tracking-[-0.02em]" style={{ color: '#ffffff' }}>
            {store.name}
          </p>
          <div className="mt-1 w-8 h-0.5" style={{ backgroundColor: GOLD }} />
          <p className="mt-4 text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Concesionaria oficial. Los mejores modelos con financiación a medida, entrega inmediata y servicio post-venta.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            {store.whatsapp_number && (
              <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {store.whatsapp_number}
              </a>
            )}
            {store.email && (
              <a href={`mailto:${store.email}`}
                className="flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
                </svg>
                {store.email}
              </a>
            )}
          </div>
        </div>

        {/* Modelos */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: GOLD }}>
            Modelos
          </p>
          <ul className="space-y-3">
            <li>
              <Link href="/productos"
                className="text-xs font-medium transition-opacity hover:opacity-100"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                Todos los vehículos
              </Link>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <Link href={`/productos?categoria=${cat.slug}`}
                  className="text-xs font-medium transition-opacity hover:opacity-100"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Servicios */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: GOLD }}>
            Servicios
          </p>
          <ul className="space-y-3">
            {[
              { label: 'Test Drive', href: store.whatsapp_number ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}?text=Test drive` : '#' },
              { label: 'Financiación', href: '/productos' },
              { label: 'Tasación de usado', href: '/productos' },
              { label: 'Servicio técnico', href: '/productos' },
              { label: 'Accesorios originales', href: '/productos' },
            ].map(item => (
              <li key={item.label}>
                <a href={item.href} target={item.href.startsWith('https') ? '_blank' : undefined}
                  rel={item.href.startsWith('https') ? 'noopener noreferrer' : undefined}
                  className="text-xs font-medium transition-opacity hover:opacity-100"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Horarios */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: GOLD }}>
            Horarios
          </p>
          <ul className="space-y-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <li className="flex justify-between gap-4">
              <span>Lunes — Viernes</span>
              <span className="font-semibold">9:00 – 19:00</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Sábados</span>
              <span className="font-semibold">9:00 – 14:00</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Domingos</span>
              <span className="font-semibold">Cerrado</span>
            </li>
          </ul>
          <div className="mt-5 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] mb-3" style={{ color: GOLD }}>
              Financiación
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Hasta 60 cuotas con todos los bancos. Crédito prendario. Permuta de usados.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────────────────────── */}
      <div className="border-t px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <p className="text-[9px] uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © {year} {store.name}. Todos los derechos reservados.
        </p>
        <a href="https://vendly.com" target="_blank" rel="noopener noreferrer"
          className="text-[9px] opacity-20 hover:opacity-50 transition-opacity uppercase tracking-[0.15em] font-bold">
          Powered by Vendly
        </a>
      </div>
    </footer>
  )
}
