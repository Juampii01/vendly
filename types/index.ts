// ─── Store Config ────────────────────────────────────────────────────────────

export interface StoreConfig {
  id: string
  name: string
  slug: string
  logo_url: string | null
  favicon_url: string | null
  // Brand colours (hex)
  color_primary: string
  color_secondary: string
  color_accent: string
  color_background: string
  color_text: string
  // Hero
  hero_title: string
  hero_subtitle: string | null
  hero_cta_label: string
  hero_cta_url: string
  hero_image_url: string | null
  hero_cta_color: string | null   // color del botón CTA del hero; null = usa color_accent
  // Shipping
  free_shipping_threshold: number | null
  shipping_base_price: number
  // Contact
  whatsapp_number: string | null
  email: string | null
  instagram_url: string | null
  // Meta
  meta_title: string | null
  meta_description: string | null
  // Home page content (configurable por tienda)
  home_marquee_items: string[]
  home_split_image_url: string | null
  home_editorial_label: string | null
  home_editorial_title: string | null
  home_editorial_body: string | null
  // Localización
  currency: string                  // ISO 4217, ej: "ARS", "USD", "EUR"
  locale: string                    // BCP 47, ej: "es-AR", "en-US"
  // Multi-tenant
  base_url: string | null           // URL pública del store, ej: "https://ona.vendly.com"
  // Platform (Fase 3)
  status: 'active' | 'inactive' | 'suspended'
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  plan_expires_at: string | null
  template_id: string | null
  // Site type
  site_type: 'ecommerce' | 'landing' | 'portfolio' | 'restaurant' | 'services' | 'modo' | 'athletic' | 'dealership' | 'libreria' | 'vendly-marketing' | 'real-estate'
  sections: LandingSection[] | null
  // Config-driven home (nuevo sistema, ver HomeSection abajo)
  // Si null → page.tsx usa el dispatcher legacy según site_type.
  // Si set  → page.tsx usa HomeRenderer y renderiza sections en orden.
  home_layout: HomeSection[] | null
  theme_tokens: ThemeTokens
  created_at: string
  updated_at: string
}

// ─── Theme tokens ─────────────────────────────────────────────────────────────
//
// Tokens de diseño que no son colores. Los 5 colores siguen viviendo en
// color_primary/secondary/accent/background/text en store_config — no los
// movemos para no romper nada.
//
// Cualquier campo undefined → el renderer usa defaults sensatos (ver
// lib/theme.ts → DEFAULT_THEME_TOKENS).
export interface ThemeTokens {
  fontHeading?: string         // ej: "Inter", "Playfair Display"
  fontBody?: string            // ej: "Inter"
  headingWeight?: string       // ej: "900", "700"
  headingTransform?: 'uppercase' | 'none'
  headingTracking?: string     // CSS letter-spacing, ej: "-0.03em"
  radius?: {
    sm?: string                // ej: "4px"
    md?: string
    lg?: string
  }
  sectionPaddingY?: string     // tailwind classes, ej: "py-16 md:py-24"
  containerMaxWidth?: string   // ej: "1440px", "1280px"
}

// ─── Store Domain ─────────────────────────────────────────────────────────────

export interface StoreDomain {
  id: string
  store_id: string
  domain: string                    // ej: "ona.com" — sin protocolo, sin puerto
  is_primary: boolean
  created_at: string
}

// ─── Tenant Config ────────────────────────────────────────────────────────────
//
// Credenciales de infraestructura por store.
// Cualquier campo null → se usa la variable de entorno global como fallback.
//
export interface TenantConfig {
  id: string
  store_id: string
  // MercadoPago
  mp_access_token: string | null
  mp_public_key: string | null
  mp_webhook_secret: string | null
  // Resend
  resend_api_key: string | null
  resend_from_domain: string | null
  // WhatsApp 360dialog
  wa_api_key: string | null
  wa_from_number: string | null
  created_at: string
  updated_at: string
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  store_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  position: number
  is_active: boolean
  created_at: string
  // Populated when fetching with product images fallback
  products?: { images: string[] | null }[]
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  store_id: string
  category_id: string | null
  category?: Category
  name: string
  slug: string
  description: string | null
  price: number
  compare_at_price: number | null       // precio tachado
  images: string[]                      // array de URLs en Supabase Storage
  is_active: boolean
  is_featured: boolean
  tags: string[]
  meta_title: string | null
  meta_description: string | null
  variants?: ProductVariant[]
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  // Combination of attributes, e.g. { talle: "M", color: "Negro" }
  attributes: Record<string, string>
  sku: string | null
  stock: number
  price_override: number | null         // si es null, usa el precio del producto
  is_active: boolean
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  product_id: string
  variant_id: string | null
  product: Pick<Product, 'id' | 'name' | 'slug' | 'images' | 'price'>
  variant: ProductVariant | null
  quantity: number
  unit_price: number                    // precio vigente al momento de agregar
}

export interface CartState {
  items: CartItem[]
  coupon: Coupon | null
  session_id: string
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export type CouponType = 'percentage' | 'fixed'

export interface Coupon {
  id: string
  store_id: string
  code: string
  type: CouponType
  value: number                         // % o monto fijo
  min_order_amount: number | null
  max_uses: number | null
  uses_count: number
  expires_at: string | null
  is_active: boolean
  description: string | null
  created_at: string
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  store_id: string
  email: string
  full_name: string
  phone: string | null
  // Dirección principal
  address_street: string | null
  address_city: string | null
  address_state: string | null
  address_zip: string | null
  address_country: string
  total_orders: number
  total_spent: number
  created_at: string
  updated_at: string
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refunded'
  | 'in_process'
  | 'in_mediation'

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  variant_label: string | null          // e.g. "Talle M / Color Negro"
  product_image: string | null
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Order {
  id: string
  store_id: string
  customer_id: string | null
  customer?: Customer
  items: OrderItem[]
  // Buyer snapshot (en caso de que el cliente no esté registrado)
  buyer_name: string
  buyer_email: string
  buyer_phone: string | null
  // Shipping address snapshot
  shipping_street: string
  shipping_city: string
  shipping_state: string
  shipping_zip: string
  shipping_country: string
  // Totals
  subtotal: number
  discount_amount: number
  shipping_amount: number
  total: number
  coupon_code: string | null
  // Payment
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: string | null
  mp_preference_id: string | null
  mp_payment_id: string | null
  // Meta
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Abandoned Cart ───────────────────────────────────────────────────────────

export interface AbandonedCart {
  id: string
  store_id: string
  session_id: string
  email: string | null
  phone: string | null
  buyer_name: string | null
  cart_data: CartItem[]
  subtotal: number
  // Recovery state
  recovered: boolean
  recovery_token: string
  // Email drip
  email_count: number
  email_sent_at: string | null
  // WhatsApp drip
  whatsapp_count: number
  whatsapp_sent_at: string | null
  created_at: string
  updated_at: string
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export interface CheckoutFormData {
  full_name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  zip: string
  country: string
  notes?: string
}

export interface CreateCheckoutPayload {
  items: CartItem[]
  buyer: CheckoutFormData
  coupon_code: string | null
  session_id: string
}

export interface CreateCheckoutResponse {
  init_point: string
  preference_id: string
  order_id: string
}

// ─── MercadoPago webhook ──────────────────────────────────────────────────────

export interface MPWebhookBody {
  id: number
  live_mode: boolean
  type: string
  date_created: string
  user_id: string
  api_version: string
  action: string
  data: {
    id: string
  }
}

// ─── Admin metrics ────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  orders_today: number
  revenue_today: number
  active_abandoned_carts: number
  conversion_rate: number              // 0–100 %
  recent_orders: Order[]
}

// ─── Landing page sections ────────────────────────────────────────────────────

export type SectionType = 'hero' | 'about' | 'services' | 'testimonials' | 'pricing' | 'gallery' | 'faq' | 'contact'

export interface HeroContent {
  title: string
  subtitle: string
  cta_label: string
  cta_url: string
  image_url: string
}
export interface AboutContent {
  label: string
  title: string
  body: string
  image_url: string
  cta_label: string
  cta_url: string
}
export interface ServiceItem { icon: string; title: string; description: string }
export interface ServicesContent { title: string; subtitle: string; items: ServiceItem[] }

export interface TestimonialItem { name: string; role: string; text: string; avatar_url?: string }
export interface TestimonialsContent { title: string; items: TestimonialItem[] }

export interface PricingPlan {
  name: string; price: string; period: string
  features: string[]; cta_label: string; cta_url: string; highlighted: boolean
}
export interface PricingContent { title: string; subtitle: string; plans: PricingPlan[] }

export interface GalleryContent { title: string; images: string[] }

export interface FaqItem { question: string; answer: string }
export interface FaqContent { title: string; items: FaqItem[] }

export interface ContactContent { title: string; subtitle: string }

export type SectionContent =
  | HeroContent | AboutContent | ServicesContent | TestimonialsContent
  | PricingContent | GalleryContent | FaqContent | ContactContent

export interface LandingSection {
  id: string
  type: SectionType
  active: boolean
  content: SectionContent
}

export const DEFAULT_SECTIONS: LandingSection[] = [
  {
    id: 'hero', type: 'hero', active: true,
    content: {
      title: 'Tu negocio, en un solo lugar',
      subtitle: 'Contá qué hacés en una línea',
      cta_label: 'Contactanos',
      cta_url: '#contact',
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1800&q=85',
    } as HeroContent,
  },
  {
    id: 'services', type: 'services', active: true,
    content: {
      title: '¿Qué hacemos?',
      subtitle: 'Nuestros servicios principales',
      items: [
        { icon: '⚡', title: 'Servicio 1', description: 'Descripción del primer servicio que ofrecés.' },
        { icon: '🎯', title: 'Servicio 2', description: 'Descripción del segundo servicio que ofrecés.' },
        { icon: '✨', title: 'Servicio 3', description: 'Descripción del tercer servicio que ofrecés.' },
      ],
    } as ServicesContent,
  },
  {
    id: 'about', type: 'about', active: true,
    content: {
      label: 'Sobre nosotros',
      title: 'Quiénes somos',
      body: 'Contá tu historia acá. ¿Qué hace especial a tu negocio? ¿Desde cuándo trabajás? ¿Qué te diferencia?',
      image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=85',
      cta_label: 'Contactanos',
      cta_url: '#contact',
    } as AboutContent,
  },
  {
    id: 'testimonials', type: 'testimonials', active: false,
    content: {
      title: 'Lo que dicen nuestros clientes',
      items: [
        { name: 'María González', role: 'Clienta', text: 'Excelente servicio, muy profesionales y atentos. Lo recomiendo sin dudarlo.' },
        { name: 'Carlos Rodríguez', role: 'Cliente', text: 'Resolvieron todo rápido y al mejor precio. Ya los contraté dos veces.' },
        { name: 'Laura Martínez', role: 'Clienta', text: 'Una experiencia increíble de principio a fin. Definitivamente vuelvo.' },
      ],
    } as TestimonialsContent,
  },
  {
    id: 'pricing', type: 'pricing', active: false,
    content: {
      title: 'Planes y precios',
      subtitle: 'Elegí la opción que mejor se adapta a vos',
      plans: [
        { name: 'Básico', price: '$5.000', period: 'por mes', highlighted: false, cta_label: 'Empezar', cta_url: '#contact', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        { name: 'Pro', price: '$12.000', period: 'por mes', highlighted: true, cta_label: 'Empezar', cta_url: '#contact', features: ['Todo el plan básico', 'Feature 4', 'Feature 5', 'Soporte prioritario'] },
      ],
    } as PricingContent,
  },
  {
    id: 'faq', type: 'faq', active: false,
    content: {
      title: 'Preguntas frecuentes',
      items: [
        { question: '¿Cómo puedo contactarlos?', answer: 'Podés escribirnos por WhatsApp o email. Respondemos en menos de 24 horas.' },
        { question: '¿En qué zonas trabajan?', answer: 'Trabajamos en todo el país y también de forma remota.' },
        { question: '¿Cuáles son los tiempos de entrega?', answer: 'Depende del servicio, pero siempre te damos un plazo estimado al inicio.' },
      ],
    } as FaqContent,
  },
  {
    id: 'contact', type: 'contact', active: true,
    content: {
      title: '¿Hablamos?',
      subtitle: 'Escribinos y te respondemos a la brevedad.',
    } as ContactContent,
  },
]

// ─── Home sections (config-driven home pages) ────────────────────────────────
//
// Sistema unificado para armar la home de cualquier ecommerce con secciones
// reusables. Cada vertical (athletic, modo, libreria, etc.) deja de ser un
// componente hardcoded y pasa a ser un preset de HomeSection[] + theme tokens.
//
// Reglas:
//   - section.id es estable (úsalo de key en React)
//   - section.active = false esconde la sección sin borrarla
//   - section.content es tipado por section.type (discriminated union)
//
// Para agregar un tipo nuevo:
//   1. Agregá la variante a HomeSectionType y a HomeSection
//   2. Definí el ContentXxx interface
//   3. Implementá el componente en components/store/sections/Xxx.tsx
//   4. Registralo en components/store/HomeRenderer.tsx

export type HomeSectionType =
  | 'hero'
  | 'marquee'
  | 'categoryGrid'
  | 'editorialSplit'
  | 'featuredProducts'
  | 'productScroll'
  | 'instagramGallery'
  | 'newsletter'
  | 'trustBar'

// ── Hero ────────────────────────────────────────────────────────────────────
// Imagen full-bleed con overlay, eyebrow opcional, título grande, 1-2 CTAs.
// Si imageUrl/title/cta vienen vacíos, usa los de store_config (back-compat).
export interface HeroSectionContent {
  imageUrl?: string                 // override; default = store.hero_image_url
  eyebrow?: string                  // pre-título, ej: "NUEVA COLECCIÓN"
  title?: string                    // override; default = store.hero_title
  primaryCta?: { label: string; url: string }
  secondaryCta?: { label: string; url: string }
  height?: 'screen' | 'tall' | 'medium'   // default: 'screen'
  align?: 'left' | 'center'         // default: 'left'
  overlay?: 'gradient-bottom' | 'gradient-left' | 'dark' | 'none'  // default: 'gradient-bottom'
}

// ── Marquee ─────────────────────────────────────────────────────────────────
// Banda de texto que se desplaza horizontal en loop.
export interface MarqueeSectionContent {
  items?: string[]                  // override; default = store.home_marquee_items
  background?: 'primary' | 'accent' | 'secondary' | 'text'   // default: 'accent'
  speed?: 'slow' | 'medium' | 'fast'   // default: 'medium' (~22s)
}

// ── CategoryGrid ────────────────────────────────────────────────────────────
// Grid de categorías. El layout se adapta a 1/2/3+ categorías ("smart bento").
export interface CategoryGridContent {
  title?: string                    // default: "Categorías"
  ctaLabel?: string                 // default: "Ver todo"
  ctaUrl?: string                   // default: "/productos"
  layout?: 'bento' | 'uniform'      // default: 'bento' (1 grande + resto chicos)
  maxItems?: number                 // default: 6
}

// ── EditorialSplit ──────────────────────────────────────────────────────────
// Split 50/50 imagen + panel de texto sobre fondo color_primary.
export interface EditorialSplitContent {
  imageUrl?: string                 // override; default = store.home_split_image_url
  imagePosition?: 'left' | 'right'  // default: 'left'
  eyebrow?: string                  // override; default = store.home_editorial_label
  title?: string                    // override; default = store.home_editorial_title
  body?: string                     // override; default = store.home_editorial_body
  ctaLabel?: string                 // default: "Explorar colección"
  ctaUrl?: string                   // default: "/productos"
}

// ── FeaturedProducts ────────────────────────────────────────────────────────
// Grid uniforme de productos destacados.
export interface FeaturedProductsContent {
  title?: string                    // default: "Destacados"
  eyebrow?: string                  // ej: "Selección"
  ctaLabel?: string                 // default: "Ver todos"
  ctaUrl?: string                   // default: "/productos"
  columns?: 2 | 3 | 4               // default: 4 (desktop)
  maxItems?: number                 // default: 8
  source?: 'featured' | 'all'       // default: 'featured'
}

// ── ProductScroll ───────────────────────────────────────────────────────────
// Scroll horizontal en mobile, grid en desktop. Para "Más vendidos", "Nueva
// temporada", etc.
export interface ProductScrollContent {
  title?: string                    // default: "Más vendidos"
  ctaLabel?: string                 // default: "Ver todos"
  ctaUrl?: string                   // default: "/productos"
  desktopColumns?: 3 | 4            // default: 4
  maxItems?: number                 // default: 8
  source?: 'featured' | 'all'       // default: 'all'
  background?: 'transparent' | 'subtle'  // default: 'subtle'
}

// ── InstagramGallery ────────────────────────────────────────────────────────
// 6 imágenes de productos en grid 6-col, con link a Instagram en el header.
export interface InstagramGalleryContent {
  title?: string                    // default: "Nuestras prendas" o "@usuario" si hay instagram_url
  eyebrow?: string                  // default: "Galería"
  maxItems?: number                 // default: 6
}

// ── Newsletter ──────────────────────────────────────────────────────────────
// Bloque grande con eyebrow + título + body + form de email.
export interface NewsletterSectionContent {
  eyebrow?: string                  // default: "Comunidad {store.name}"
  title?: string                    // default: "Primero te enterás vos"
  body?: string                     // default: "Lanzamientos, preventas y descuentos exclusivos. Sin spam."
  background?: 'primary' | 'accent' | 'subtle'   // default: 'primary'
}

// ── TrustBar ────────────────────────────────────────────────────────────────
// Fila de 3-4 ítems con icono + título + desc (envío, devoluciones, etc).
export interface TrustBarItem {
  icon: 'truck' | 'return' | 'lock' | 'ship' | 'star' | 'support' | 'gift'
  title: string
  desc: string
}
export interface TrustBarContent {
  items?: TrustBarItem[]            // default: 4 ítems estándar (envío/cambios/pago/freeship)
  layout?: 'border' | 'cards'       // default: 'border'
}

// ── Discriminated union ──────────────────────────────────────────────────────
export type HomeSection =
  | { id: string; type: 'hero';             active: boolean; content: HeroSectionContent }
  | { id: string; type: 'marquee';          active: boolean; content: MarqueeSectionContent }
  | { id: string; type: 'categoryGrid';     active: boolean; content: CategoryGridContent }
  | { id: string; type: 'editorialSplit';   active: boolean; content: EditorialSplitContent }
  | { id: string; type: 'featuredProducts'; active: boolean; content: FeaturedProductsContent }
  | { id: string; type: 'productScroll';    active: boolean; content: ProductScrollContent }
  | { id: string; type: 'instagramGallery'; active: boolean; content: InstagramGalleryContent }
  | { id: string; type: 'newsletter';       active: boolean; content: NewsletterSectionContent }
  | { id: string; type: 'trustBar';         active: boolean; content: TrustBarContent }

// ─── API responses (generic) ─────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: string
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError
