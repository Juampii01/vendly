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
  site_type: 'ecommerce' | 'landing' | 'portfolio' | 'restaurant' | 'services'
  sections: LandingSection[] | null
  created_at: string
  updated_at: string
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
