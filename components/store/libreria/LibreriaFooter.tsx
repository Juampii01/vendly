import Link from 'next/link'
import type { StoreConfig, Category } from '@/types'

interface Props {
  store: StoreConfig
  categories: Category[]
}

export function LibreriaFooter({ store, categories }: Props) {
  const ACCENT = store.color_accent
  const BG = store.color_background

  return (
    <footer style={{ backgroundColor: store.color_primary, color: BG }}>

      {/* Newsletter band */}
      <div className="border-b px-6 py-10 text-center" style={{ borderColor: 'rgba(250,246,239,0.1)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: ACCENT }}>Club de lectores</p>
        <h3 className="text-2xl font-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>Novedades, recomendaciones y descuentos</h3>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'rgba(250,246,239,0.55)' }}>
          Suscribite y recibí un 10% de descuento en tu primera compra. Sin spam, solo libros.
        </p>
        <form className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
          <input type="email" placeholder="tu@email.com" className="flex-1 px-4 py-2.5 text-sm rounded-none outline-none"
            style={{ backgroundColor: 'rgba(250,246,239,0.1)', color: BG, border: '1px solid rgba(250,246,239,0.2)' }} />
          <button type="submit" className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-80" style={{ backgroundColor: ACCENT, color: BG }}>
            Suscribirme
          </button>
        </form>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h2 className="text-2xl font-black mb-2" style={{ fontFamily: 'Georgia, serif', color: BG }}>{store.name}</h2>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] mb-5" style={{ color: ACCENT }}>Librería</p>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(250,246,239,0.5)' }}>
            Más de 10.000 títulos esperándote. Ficción, ensayo, infantil y mucho más.
          </p>
          <div className="flex gap-3">
            {store.instagram_url && (
              <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ border: '1px solid rgba(250,246,239,0.2)', color: 'rgba(250,246,239,0.6)' }}>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: ACCENT }}>Géneros</h4>
          <ul className="space-y-2.5">
            <li><Link href="/productos" className="text-sm transition-opacity hover:opacity-100" style={{ color: 'rgba(250,246,239,0.55)' }}>Todos los libros</Link></li>
            {categories.map(cat => (
              <li key={cat.id}>
                <Link href={`/productos?categoria=${cat.slug}`} className="text-sm transition-opacity hover:opacity-100" style={{ color: 'rgba(250,246,239,0.55)' }}>
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: ACCENT }}>Atención al cliente</h4>
          <ul className="space-y-2.5">
            {['Cómo comprar', 'Envíos y entregas', 'Devoluciones', 'Preguntas frecuentes'].map(label => (
              <li key={label}><a href="#" className="text-sm transition-opacity hover:opacity-100" style={{ color: 'rgba(250,246,239,0.55)' }}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-5" style={{ color: ACCENT }}>Contacto</h4>
          <ul className="space-y-3">
            {store.email && (
              <li>
                <a href={`mailto:${store.email}`} className="text-sm flex items-center gap-2 transition-opacity hover:opacity-100" style={{ color: 'rgba(250,246,239,0.55)' }}>
                  <span>✉</span> {store.email}
                </a>
              </li>
            )}
            {store.whatsapp_number && (
              <li>
                <a href={`https://wa.me/${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm flex items-center gap-2 transition-opacity hover:opacity-100" style={{ color: 'rgba(250,246,239,0.55)' }}>
                  <span>📱</span> {store.whatsapp_number}
                </a>
              </li>
            )}
            <li className="text-sm pt-2" style={{ color: 'rgba(250,246,239,0.35)' }}>Lun–Vie 9:00–20:00<br />Sábados 10:00–18:00</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: 'rgba(250,246,239,0.08)' }}>
        <p className="text-[10px]" style={{ color: 'rgba(250,246,239,0.3)' }}>© {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
        <div className="flex items-center gap-5">
          {['Términos y condiciones', 'Privacidad'].map(label => (
            <a key={label} href="#" className="text-[10px] transition-opacity hover:opacity-100" style={{ color: 'rgba(250,246,239,0.3)' }}>{label}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}
