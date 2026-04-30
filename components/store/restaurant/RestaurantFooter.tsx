import Link from 'next/link'
import type { StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
}

export function RestaurantFooter({ store, categories }: Props) {
  const wa = store.whatsapp_number
    ? `https://wa.me/${store.whatsapp_number}?text=Hola! Quisiera hacer una reserva.`
    : null

  return (
    <footer style={{ backgroundColor: '#07050302', borderTop: '1px solid rgba(200,144,42,0.12)' }}>

      {/* ── CTA reservas ── */}
      <div className="py-20 text-center px-6" style={{ backgroundColor: '#0a0704' }}>
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.5em]" style={{ color: '#c8902a' }}>
          Reservas
        </p>
        <h2
          className="mb-6 font-black uppercase leading-none"
          style={{ color: '#f0ebe0', fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.03em' }}
        >
          Tu mesa<br />te espera
        </h2>
        <p className="mb-10 text-sm opacity-40 max-w-xs mx-auto" style={{ color: '#f0ebe0' }}>
          Martes a domingo · 12:00 a 24:00 hs<br />
          Consultá disponibilidad por WhatsApp
        </p>
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 text-[11px] font-black uppercase tracking-[0.25em] transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#c8902a', color: '#0e0b06' }}
          >
            Reservar por WhatsApp
          </a>
        )}
      </div>

      {/* ── Info grid ── */}
      <div
        className="mx-auto max-w-7xl px-6 md:px-10 pt-16 pb-10 grid grid-cols-1 md:grid-cols-3 gap-12"
        style={{ borderTop: '1px solid rgba(240,235,224,0.05)' }}
      >
        {/* Marca */}
        <div>
          <p className="text-2xl font-black uppercase tracking-[0.28em] mb-4" style={{ color: '#f0ebe0' }}>
            {store.name}
          </p>
          <p className="text-xs leading-relaxed mb-6 max-w-xs" style={{ color: 'rgba(240,235,224,0.35)' }}>
            {store.meta_description ?? 'Cocina argentina contemporánea. Ingredientes de estación, vinos de autor.'}
          </p>
          <div className="flex gap-4">
            {store.instagram_url && (
              <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
                className="transition-opacity hover:opacity-100 opacity-40"
                aria-label="Instagram">
                <InstaIcon />
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="transition-opacity hover:opacity-100 opacity-40"
                aria-label="WhatsApp">
                <WAIcon />
              </a>
            )}
          </div>
        </div>

        {/* Menú */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: 'rgba(200,144,42,0.6)' }}>
            El menú
          </p>
          <ul className="space-y-3">
            <li>
              <Link href="/productos" className="text-xs transition-colors hover:text-[#c8902a]"
                style={{ color: 'rgba(240,235,224,0.4)' }}>
                Ver todo
              </Link>
            </li>
            {categories.map(cat => (
              <li key={cat.id}>
                <Link href={`/productos?categoria=${cat.slug}`}
                  className="text-xs transition-colors hover:text-[#c8902a]"
                  style={{ color: 'rgba(240,235,224,0.4)' }}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] mb-5" style={{ color: 'rgba(200,144,42,0.6)' }}>
            Encontranos
          </p>
          <div className="space-y-4 text-xs" style={{ color: 'rgba(240,235,224,0.4)' }}>
            {store.email && (
              <p>
                <span className="block text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(200,144,42,0.5)' }}>Email</span>
                <a href={`mailto:${store.email}`} className="hover:text-[#c8902a] transition-colors">{store.email}</a>
              </p>
            )}
            <p>
              <span className="block text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(200,144,42,0.5)' }}>Horario</span>
              Martes a domingo<br />
              Mediodía: 12:00 – 15:30<br />
              Noche: 20:00 – 00:00
            </p>
            <p>
              <span className="block text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgba(200,144,42,0.5)' }}>Lunes</span>
              Cerrado
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="border-t px-6 md:px-10 py-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2"
        style={{ borderColor: 'rgba(240,235,224,0.05)' }}
      >
        <p className="text-[10px]" style={{ color: 'rgba(240,235,224,0.2)' }}>
          © {new Date().getFullYear()} {store.name}. Todos los derechos reservados.
        </p>
        <p className="text-[10px]" style={{ color: 'rgba(240,235,224,0.15)' }}>
          Powered by <span className="font-black uppercase tracking-wider">Vendly</span>
        </p>
      </div>
    </footer>
  )
}

function InstaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0ebe0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function WAIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#f0ebe0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
