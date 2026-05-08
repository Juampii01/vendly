import type { HomeSection } from '@/types'

/**
 * Presets de home_layout para distintos verticales.
 *
 * Uso:
 *   - Al crear un store nuevo, copiá uno de estos presets en store_config.home_layout
 *   - El usuario puede después editarlo (orden de secciones, content de cada una)
 *   - Cualquier campo `content` vacío usa los valores de store_config (back-compat)
 *
 * Para agregar un preset:
 *   - Definí un array de HomeSection y exportalo
 *   - Documentá cuándo conviene (qué tipo de tienda)
 */

// ─── ATHLETIC ──────────────────────────────────────────────────────────────
// Preset estilo Adidas/Nike: hero full-bleed, marquee, categorías bento,
// destacados, editorial split, productos en scroll, trust, newsletter.
// Para: ropa deportiva, gym wear, indumentaria urbana, marcas con estética
// editorial fuerte.
export const ATHLETIC_PRESET: HomeSection[] = [
  { id: 'hero',         type: 'hero',             active: true, content: { height: 'screen', overlay: 'gradient-left' } },
  { id: 'marquee',      type: 'marquee',          active: true, content: { background: 'primary', speed: 'medium' } },
  { id: 'categories',   type: 'categoryGrid',     active: true, content: { title: 'Colecciones', layout: 'bento' } },
  { id: 'featured',     type: 'featuredProducts', active: true, content: { eyebrow: 'Selección', title: 'Destacados', columns: 4, source: 'featured' } },
  { id: 'editorial',    type: 'editorialSplit',   active: true, content: { imagePosition: 'left' } },
  { id: 'new-season',   type: 'productScroll',    active: true, content: { title: 'Nueva temporada', desktopColumns: 3, source: 'all', background: 'transparent' } },
  { id: 'trust',        type: 'trustBar',         active: true, content: { layout: 'border' } },
  { id: 'newsletter',   type: 'newsletter',       active: true, content: { background: 'primary' } },
]

// ─── DEFAULT (ecommerce general) ───────────────────────────────────────────
// Preset universal: hero, marquee, categorías, destacados, editorial,
// más vendidos, instagram, newsletter, trust. Es el preset por defecto que
// armó la home original de page.tsx.
export const DEFAULT_PRESET: HomeSection[] = [
  { id: 'hero',         type: 'hero',             active: true, content: { height: 'screen', overlay: 'gradient-bottom' } },
  { id: 'marquee',      type: 'marquee',          active: true, content: { background: 'accent', speed: 'medium' } },
  { id: 'categories',   type: 'categoryGrid',     active: true, content: { layout: 'bento' } },
  { id: 'editorial',    type: 'editorialSplit',   active: true, content: { imagePosition: 'left' } },
  { id: 'featured',     type: 'featuredProducts', active: true, content: { columns: 4, source: 'featured' } },
  { id: 'best-sellers', type: 'productScroll',    active: true, content: { source: 'all' } },
  { id: 'gallery',      type: 'instagramGallery', active: true, content: {} },
  { id: 'newsletter',   type: 'newsletter',       active: true, content: { background: 'primary' } },
  { id: 'trust',        type: 'trustBar',         active: true, content: { layout: 'border' } },
]

// ─── MINIMAL (landing rápida) ──────────────────────────────────────────────
// Preset corto: hero + featured + trust + newsletter. Útil para tiendas
// con poco catálogo, o como home temporal mientras se carga catálogo.
export const MINIMAL_PRESET: HomeSection[] = [
  { id: 'hero',       type: 'hero',             active: true, content: { height: 'tall', overlay: 'gradient-bottom' } },
  { id: 'featured',   type: 'featuredProducts', active: true, content: { columns: 3, source: 'all', maxItems: 6 } },
  { id: 'trust',      type: 'trustBar',         active: true, content: { layout: 'cards' } },
  { id: 'newsletter', type: 'newsletter',       active: true, content: { background: 'subtle' } },
]

export const HOME_PRESETS = {
  athletic: ATHLETIC_PRESET,
  default: DEFAULT_PRESET,
  minimal: MINIMAL_PRESET,
} as const

export type HomePresetName = keyof typeof HOME_PRESETS
