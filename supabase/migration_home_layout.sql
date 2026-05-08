-- ════════════════════════════════════════════════════════════════════════════
-- migration_home_layout.sql — Sistema config-driven de homes
-- ════════════════════════════════════════════════════════════════════════════
--
-- Problema previo:
--   Cada vertical (athletic, modo, libreria, restaurant, dealership, real-estate)
--   tenía su propio HomePage.tsx hardcoded de 300-800 líneas. Cambiar algo en
--   común obligaba a tocar 7 archivos. Armar un store nuevo de un nuevo vertical
--   requería escribir un componente entero de cero.
--
-- Solución:
--   Cada store define su home como un array ordenado de secciones (JSON).
--   Las secciones son componentes reusables (Hero, CategoryGrid, EditorialSplit,
--   FeaturedProducts, ProductScroll, TrustBar, Newsletter, Marquee, Instagram).
--   Crear un store nuevo = elegir secciones + theme tokens en JSON.
--
-- Compatibilidad:
--   - Stores SIN home_layout setteado siguen usando los HomePage.tsx legacy
--     (back-compat — no rompemos los 7 templates existentes)
--   - Stores CON home_layout setteado usan el HomeRenderer nuevo
--   - Migración store-by-store, no big-bang

-- ─── theme_tokens ──────────────────────────────────────────────────────────
-- Bag extensible de tokens de diseño que NO son colores (los colores ya viven
-- en color_primary/secondary/accent/background/text — no los tocamos).
--
-- Estructura sugerida:
--   {
--     "fontHeading":       "Inter",
--     "fontBody":          "Inter",
--     "headingWeight":     "900",
--     "headingTransform":  "uppercase",
--     "headingTracking":   "-0.03em",
--     "radius":            { "sm": "4px", "md": "8px", "lg": "16px" },
--     "sectionPaddingY":   "py-16 md:py-24",
--     "containerMaxWidth": "1440px"
--   }
--
-- Cualquier campo ausente → el SectionRenderer usa defaults sensatos.
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS theme_tokens jsonb NOT NULL DEFAULT '{}'::jsonb;

-- ─── home_layout ────────────────────────────────────────────────────────────
-- Array ordenado de secciones. Si NULL, page.tsx usa el dispatcher legacy.
--
-- Estructura: HomeSection[] (ver types/index.ts → HomeSection)
--   [
--     { "id": "hero-1",      "type": "hero",            "active": true, "content": {...} },
--     { "id": "marquee-1",   "type": "marquee",         "active": true, "content": {...} },
--     { "id": "categories-1","type": "categoryGrid",    "active": true, "content": {...} },
--     ...
--   ]
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS home_layout jsonb DEFAULT NULL;

-- ─── Comentarios para humanos ──────────────────────────────────────────────
COMMENT ON COLUMN store_config.theme_tokens IS
  'Theme tokens (typography, radius, spacing). Colores van en color_*. Ausencias usan defaults del renderer.';

COMMENT ON COLUMN store_config.home_layout IS
  'HomeSection[] ordenado. NULL = usa el HomePage legacy según site_type. Set = usa HomeRenderer nuevo.';
