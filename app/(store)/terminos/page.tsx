import { getStoreConfig } from '@/lib/store'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Términos y Condiciones' }

export default async function TerminosPage() {
  const store = await getStoreConfig()
  const isVendly = store.site_type === 'vendly-marketing'

  if (isVendly) return <VendlyTerminos />

  // Página genérica para cualquier tienda
  return (
    <div className="mx-auto max-w-3xl px-6 py-16" style={{ color: store.color_text }}>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Términos y Condiciones</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed opacity-80">
        <p>
          Al acceder y utilizar esta tienda online, aceptás los siguientes términos y condiciones.
          Si no estás de acuerdo, te pedimos que no uses el servicio.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Uso del sitio</h2>
        <p>
          Esta tienda está destinada a la compra de productos por parte de consumidores finales.
          El contenido del sitio es propiedad de {store.name} y no puede reproducirse sin autorización.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Precios y pagos</h2>
        <p>
          Los precios están expresados en pesos argentinos e incluyen IVA. Los pagos se procesan
          a través de MercadoPago. {store.name} no almacena datos de tarjetas de crédito.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Envíos y devoluciones</h2>
        <p>
          Los tiempos y costos de envío se informan durante el proceso de compra. Las devoluciones
          se aceptan dentro de los 30 días de recibido el producto, en condiciones originales.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Contacto</h2>
        <p>
          Para consultas sobre estos términos, contactanos por WhatsApp o al email {store.email ?? 'disponible en el sitio'}.
        </p>
      </div>
    </div>
  )
}

// ─── Versión Vendly ───────────────────────────────────────────────────────────

function VendlyTerminos() {
  const sections = [
    {
      title: 'Aceptación de los términos',
      content: `Al contratar los servicios de Vendly, aceptás estos Términos y Condiciones en su totalidad. Vendly se reserva el derecho de modificarlos con previo aviso. El uso continuo del servicio implica la aceptación de cualquier cambio.`,
    },
    {
      title: 'Descripción del servicio',
      content: `Vendly provee un servicio de diseño, configuración y entrega de tiendas online sobre infraestructura propia. El cliente recibe acceso a un panel de administración para gestionar su tienda. Vendly es invisible para los compradores finales del cliente.`,
    },
    {
      title: 'Propiedad del sitio',
      content: `El contenido publicado en la tienda (productos, textos, imágenes) es propiedad del cliente. Vendly no reclama derechos sobre dicho contenido. El diseño y la infraestructura técnica son propiedad de Vendly y no pueden ser replicados sin autorización.`,
    },
    {
      title: 'Pagos y facturación',
      content: `Los pagos de clientes finales se procesan directamente a través de MercadoPago y van a la cuenta del titular de la tienda. Vendly no interviene en las transacciones económicas entre el cliente y sus compradores.`,
    },
    {
      title: 'Responsabilidades del cliente',
      content: `El cliente es responsable de la legalidad del contenido publicado en su tienda, del cumplimiento de las normativas de defensa del consumidor aplicables, y de mantener actualizados sus datos de contacto y credenciales de MercadoPago.`,
    },
    {
      title: 'Soporte y mantenimiento',
      content: `El soporte post-entrega varía según el plan contratado. Vendly no garantiza disponibilidad 24/7 del servicio de soporte. Los servicios de infraestructura dependen de terceros (Vercel, Supabase) y Vendly no es responsable por interrupciones externas.`,
    },
    {
      title: 'Modificaciones al servicio',
      content: `Vendly puede actualizar, modificar o discontinuar funcionalidades con previo aviso al cliente. Los cambios que afecten significativamente la operación de la tienda serán comunicados con al menos 7 días de anticipación.`,
    },
    {
      title: 'Jurisdicción',
      content: `Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa se someterá a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.`,
    },
  ]

  return (
    <div style={{ backgroundColor: '#050508', color: '#ffffff', minHeight: '100vh' }}>
      {/* Navbar mínimo */}
      <nav className="border-b px-6 h-16 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-black text-xs">V</span>
          </div>
          <span className="font-black text-lg tracking-tight">Vendly</span>
        </a>
        <a href="/" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>
          ← Volver
        </a>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#6366f1' }}>Legal</p>
          <h1 className="text-4xl font-black tracking-tight mb-3">Términos y Condiciones</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Última actualización: abril 2026</p>
        </div>

        <div className="space-y-10">
          {sections.map(({ title, content }, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold mb-3">
                <span className="mr-3 text-sm font-mono" style={{ color: 'rgba(99,102,241,0.7)' }}>0{i + 1}</span>
                {title}
              </h2>
              <p className="text-sm leading-relaxed pl-9" style={{ color: 'rgba(255,255,255,0.6)' }}>{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            ¿Tenés preguntas sobre estos términos?{' '}
            <a href="https://wa.me/5491100000000?text=Consulta sobre términos de Vendly"
              target="_blank" rel="noopener noreferrer"
              className="underline hover:text-white transition-colors">
              Escribinos por WhatsApp
            </a>
          </p>
        </div>
      </div>

      <footer className="border-t py-8 px-6" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>© 2026 Vendly</span>
          <div className="flex gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <a href="/terminos" className="hover:text-white transition-colors">Términos</a>
            <a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a>
            <a href="/" className="hover:text-white transition-colors">Inicio</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
