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
}

const FEATURES_BY_SITE_TYPE: Record<StoreConfig['site_type'], SiteFeatures> = {
  // ── Tiendas ecommerce estándar ───────────────────────────────────────────
  ecommerce: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
  },
  // ── Templates de tienda con carrito ─────────────────────────────────────
  modo: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
  },
  athletic: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
  },
  // ── Concesionaria — usa "consultas guardadas" en lugar de carrito real ──
  // hasCart: true conserva el sidebar de consultas (reutiliza Zustand)
  // hasCheckout: false bloquea /carrito y /checkout
  dealership: {
    hasCart: true,
    hasCheckout: false,
    hasWhatsappCTA: true,
    hasProductCatalog: true,
  },
  // ── Páginas sin ecommerce ────────────────────────────────────────────────
  landing: {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: false,
    hasProductCatalog: false,
  },
  portfolio: {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: false,
    hasProductCatalog: false,
  },
  // ── Servicios — contacto por WhatsApp, sin catálogo de productos ─────────
  services: {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: true,
    hasProductCatalog: false,
  },
  // ── Restaurant — pedidos con carrito ────────────────────────────────────
  restaurant: {
    hasCart: true,
    hasCheckout: true,
    hasWhatsappCTA: false,
    hasProductCatalog: true,
  },
  // ── Marketing page de Vendly ─────────────────────────────────────────────
  'vendly-marketing': {
    hasCart: false,
    hasCheckout: false,
    hasWhatsappCTA: false,
    hasProductCatalog: false,
  },
}

/**
 * Devuelve las features habilitadas para el site_type dado.
 * Fallback a 'ecommerce' para tipos no reconocidos (safe default).
 */
export function getSiteFeatures(siteType: StoreConfig['site_type']): SiteFeatures {
  return FEATURES_BY_SITE_TYPE[siteType] ?? FEATURES_BY_SITE_TYPE['ecommerce']
}
