import type { StoreConfig } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// SITE FEATURES
// Define qué funcionalidades tiene cada tipo de sitio.
// Fuente única de verdad — los layouts y componentes lo leen para decidir
// qué renderizar. Agregar un feature nuevo: solo tocás este archivo.
// ─────────────────────────────────────────────────────────────────────────────

export interface SiteFeatures {
  /** Muestra ícono de carrito, CartSidebar y botones agregar-al-carrito / guardar-consulta */
  hasCart: boolean
  /** Habilita el flujo completo de checkout (/carrito, /checkout). Solo si hasCart === true */
  hasCheckout: boolean
  /** El CTA principal de producto apunta a WhatsApp en lugar de agregar al carrito */
  hasWhatsappCTA: boolean
  /** Tiene página /productos con catálogo */
  hasProductCatalog: boolean
  /** Muestra link de cuenta/login y permite registro de usuarios */
  hasUserAccount: boolean
}

const FEATURES_BY_SITE_TYPE: Record<StoreConfig['site_type'], SiteFeatures> = {
  // ── Tiendas ecommerce estándar ───────────────────────────────────────────
  ecommerce: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
    hasUserAccount: true,
  },
  // ── Templates de tienda con carrito ─────────────────────────────────────
  modo: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
    hasUserAccount: true,
  },
  athletic: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
    hasUserAccount: true,
  },
  // ── Concesionaria — consultas por WhatsApp, sin cuenta ni checkout real ──
  dealership: {
    hasCart: true,
    hasCheckout: false,
    hasWhatsappCTA: true,
    hasProductCatalog: true,
    hasUserAccount: false,
  },
  // ── Librería — ecommerce completo para venta de libros ──────────────────
  libreria: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
    hasUserAccount: true,
  },
  // ── Páginas sin ecommerce ────────────────────────────────────────────────
  landing: {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: false,
    hasProductCatalog: false,
    hasUserAccount: false,
  },
  portfolio: {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: false,
    hasProductCatalog: false,
    hasUserAccount: false,
  },
  // ── Servicios — contacto por WhatsApp, sin catálogo ni cuenta ───────────
  services: {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: true,
    hasProductCatalog: false,
    hasUserAccount: false,
  },
  // ── Restaurant — pedidos con carrito, cuenta para historial ─────────────
  restaurant: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
    hasUserAccount: true,
  },
  // ── Marketing page de Vendly ─────────────────────────────────────────────
  'vendly-marketing': {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: false,
    hasProductCatalog: false,
    hasUserAccount: false,
  },
  // ── Inmobiliaria — consultas por WhatsApp, sin carrito ni cuenta ──────────
  'real-estate': {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: true,
    hasProductCatalog: true,
    hasUserAccount: false,
  },
}

/**
 * Devuelve las features habilitadas para el site_type dado.
 * Fallback a 'ecommerce' para tipos no reconocidos (safe default).
 */
export function getSiteFeatures(siteType: StoreConfig['site_type']): SiteFeatures {
  return FEATURES_BY_SITE_TYPE[siteType] ?? FEATURES_BY_SITE_TYPE['ecommerce']
}
