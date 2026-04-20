import { getStoreConfig } from '@/lib/store'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Privacidad' }

export default async function PrivacidadPage() {
  const store = await getStoreConfig()
  const isVendly = store.site_type === 'vendly-marketing'

  if (isVendly) return <VendlyPrivacidad />

  // Página genérica para cualquier tienda
  return (
    <div className="mx-auto max-w-3xl px-6 py-16" style={{ color: store.color_text }}>
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Política de Privacidad</h1>
      <div className="space-y-6 text-sm leading-relaxed opacity-80">
        <p>
          En {store.name} nos tomamos muy en serio la privacidad de nuestros clientes.
          Esta política describe qué datos recopilamos y cómo los usamos.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Datos que recopilamos</h2>
        <p>
          Al realizar una compra o crear una cuenta, recopilamos tu nombre, email, teléfono
          y dirección de entrega. Esta información es necesaria para procesar tu pedido.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Uso de los datos</h2>
        <p>
          Usamos tus datos para procesar pedidos, enviarte confirmaciones y, si lo aceptaste,
          informarte sobre novedades y promociones. No vendemos ni compartimos tu información
          con terceros, excepto los necesarios para procesar pagos (MercadoPago) y envíos.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Tus derechos</h2>
        <p>
          Podés solicitar el acceso, corrección o eliminación de tus datos en cualquier momento
          contactándonos por WhatsApp o al email {store.email ?? 'disponible en el sitio'}.
        </p>
        <h2 className="text-lg font-bold mt-8 mb-3 opacity-100">Cookies</h2>
        <p>
          Usamos cookies técnicas para mantener tu sesión y carrito activos.
          No usamos cookies de rastreo publicitario de terceros.
        </p>
      </div>
    </div>
  )
}

// ─── Versión Vendly ───────────────────────────────────────────────────────────

function VendlyPrivacidad() {
  const sections = [
    {
      title: 'Información que recopilamos',
      content: `Cuando contactás o contratás Vendly, recopilamos: nombre, email, teléfono y datos del negocio que nos proporcionás. También registramos datos de uso de los paneles de administración (acciones, timestamps) para garantizar la seguridad y el correcto funcionamiento.`,
    },
    {
      title: 'Cómo usamos tus datos',
      content: `Usamos tu información para: entregar y operar el servicio contratado, enviarte comunicaciones relacionadas con el servicio, brindarte soporte técnico, y mejorar nuestros productos. No usamos tu información para publicidad de terceros.`,
    },
    {
      title: 'Datos de compradores finales',
      content: `Los datos de los compradores de las tiendas de nuestros clientes (nombre, email, teléfono, dirección) son responsabilidad del titular de cada tienda. Vendly accede a estos datos solo en la medida necesaria para operar la infraestructura técnica.`,
    },
    {
      title: 'Compartir información',
      content: `No vendemos tu información a terceros. Podemos compartir datos con proveedores de infraestructura (Vercel, Supabase) que operan bajo sus propias políticas de privacidad, únicamente en la medida necesaria para prestar el servicio.`,
    },
    {
      title: 'Seguridad',
      content: `Implementamos medidas técnicas razonables para proteger tu información: autenticación segura, comunicaciones cifradas (HTTPS), y acceso restringido a datos sensibles. Las credenciales de MercadoPago se almacenan cifradas y nunca se exponen en el cliente.`,
    },
    {
      title: 'Retención de datos',
      content: `Conservamos tus datos mientras el servicio esté activo y por el período legalmente requerido después de la cancelación. Podés solicitar la eliminación anticipada de tus datos escribiéndonos directamente.`,
    },
    {
      title: 'Cookies',
      content: `Usamos cookies técnicas para mantener sesiones de admin activas y una cookie de caché de tienda (__vendly_store, 1h TTL) para optimizar el rendimiento. No usamos cookies de publicidad ni compartimos datos con redes de anuncios.`,
    },
    {
      title: 'Tus derechos',
      content: `Tenés derecho a acceder, corregir o eliminar tu información personal. Para ejercer estos derechos, escribinos por WhatsApp o email. Respondemos en un plazo máximo de 72 horas hábiles.`,
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
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4" style={{ color: '#8b5cf6' }}>Legal</p>
          <h1 className="text-4xl font-black tracking-tight mb-3">Política de Privacidad</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Última actualización: abril 2026</p>
        </div>

        <p className="text-sm leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Tu privacidad importa. Esta política explica de forma clara y directa
          qué información recopilamos, cómo la usamos y cuáles son tus derechos.
        </p>

        <div className="space-y-10">
          {sections.map(({ title, content }, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold mb-3">
                <span className="mr-3 text-sm font-mono" style={{ color: 'rgba(139,92,246,0.7)' }}>0{i + 1}</span>
                {title}
              </h2>
              <p className="text-sm leading-relaxed pl-9" style={{ color: 'rgba(255,255,255,0.6)' }}>{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            ¿Preguntas sobre privacidad?{' '}
            <a href="https://wa.me/5491100000000?text=Consulta sobre privacidad en Vendly"
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
