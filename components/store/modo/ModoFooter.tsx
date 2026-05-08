import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { StoreConfig, Category } from '@/types'
import type { SiteFeatures } from '@/lib/site-features'

const DEFAULT_FEATURES: SiteFeatures = {
  hasCart: true, hasCheckout: true, hasWhatsappCTA: false, hasProductCatalog: true, hasUserAccount: true,
}

interface Props {
  store: StoreConfig
  categories: Category[]
  features?: SiteFeatures
}

export function ModoFooter({ store, categories, features = DEFAULT_FEATURES }: Props) {
  return (
    <footer style={{ backgroundColor: store.color_text, color: store.color_background }}>

      {/* ── Bloque principal ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12">

          {/* Marca */}
          <div>
            <p className="text-2xl font-black uppercase tracking-[0.2em] mb-4" style={{ color: store.color_background }}>
              {store.name}
            </p>
            {store.meta_description && (
              <p className="text-xs leading-relaxed opacity-40 max-w-xs mb-6" style={{ color: store.color_background }}>
                {store.meta_description}
              </p>
            )}
            {/* Redes */}
            <div className="flex gap-4">
              {store.instagram_url && (
                <a href={store.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-60 opacity-70" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
              {store.whatsapp_number && (
                <a href={`https://wa.me/${store.whatsapp_number}`} target="_blank" rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-60 opacity-70" aria-label="WhatsApp">
                  <WhatsAppIcon />
                </a>
              )}
              {store.email && (
                <a href={`mailto:${store.email}`}
                  className="transition-opacity hover:opacity-60 opacity-70" aria-label="Email">
                  <EmailIcon />
                </a>
              )}
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5 opacity-30">Tienda</p>
            <ul className="space-y-3">
              <li>
                <Link href="/productos" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                  Ver todo
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/productos?categoria=${cat.slug}`} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5 opacity-30">Ayuda</p>
            <ul className="space-y-3">
              {store.whatsapp_number && (
                <>
                  <li>
                    <a href={`https://wa.me/${store.whatsapp_number}?text=Hola! Tengo una consulta.`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                      Contacto
                    </a>
                  </li>
                  <li>
                    <a href={`https://wa.me/${store.whatsapp_number}?text=Hola! Quiero consultar sobre cambios y devoluciones.`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                      Cambios y devoluciones
                    </a>
                  </li>
                </>
              )}
              {features.hasCart && (
                <li>
                  <Link href="/carrito" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                    Mi carrito
                  </Link>
                </li>
              )}
              {features.hasUserAccount && (
                <li>
                  <Link href="/cuenta" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                    Mi cuenta
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Pago */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-5 opacity-30">Pagos</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Visa', 'Mastercard', 'MP'].map((m) => (
                <span key={m} className="rounded border px-2 py-1 text-[10px] font-semibold opacity-40"
                  style={{ borderColor: `${store.color_background}30` }}>
                  {m}
                </span>
              ))}
            </div>
            {store.free_shipping_threshold && (
              <p className="text-[10px] opacity-30 leading-relaxed">
                Envío gratis en compras mayores a{' '}
                {formatPrice(store.free_shipping_threshold, store.currency, store.locale)}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t px-6 md:px-10 py-4 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2"
        style={{ borderColor: `${store.color_background}12` }}>
        <p className="text-[10px] opacity-25">© {new Date().getFullYear()} {store.name}. Todos los derechos reservados.</p>
        <div className="flex items-center gap-1 opacity-15">
          <p className="text-[10px]">Powered by</p>
          <span className="text-[10px] font-black uppercase tracking-wider">Vendly</span>
        </div>
      </div>
    </footer>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
