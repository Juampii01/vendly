-- ─── Registrar templates en store_templates ──────────────────────────────────
--
-- Paso 1: agregar columna site_type a store_templates (si no existe)
-- Paso 2: actualizar CHECK constraint de store_config para permitir 'athletic'
-- Paso 3: insertar los templates Modo y Athletic
-- Ejecutar en Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Agregar site_type a store_templates
ALTER TABLE store_templates
  ADD COLUMN IF NOT EXISTS site_type TEXT NOT NULL DEFAULT 'ecommerce';

-- 2. Extender CHECK constraint de store_config para incluir 'athletic'
ALTER TABLE store_config DROP CONSTRAINT IF EXISTS store_config_site_type_check;
ALTER TABLE store_config ADD CONSTRAINT store_config_site_type_check
  CHECK (site_type IN ('ecommerce','landing','portfolio','restaurant','services','modo','athletic'));

-- 3. Insertar template MODO
INSERT INTO store_templates (name, description, color_primary, color_secondary, color_accent, color_background, color_text, hero_title, site_type, is_active, position)
VALUES (
  'Modo',
  'Editorial minimalista. Hero split, carrusel de imágenes, paleta crema y rojo fuego.',
  '#111111',
  '#2a2a2a',
  '#E63329',
  '#FAF7F2',
  '#111111',
  'MODO',
  'modo',
  true,
  10
)
ON CONFLICT DO NOTHING;

-- 4. Insertar template ATHLETIC (estilo Adidas)
INSERT INTO store_templates (name, description, color_primary, color_secondary, color_accent, color_background, color_text, hero_title, site_type, is_active, position)
VALUES (
  'Athletic',
  'Diseño deportivo bold. Hero full-screen, tipografía de impacto, paleta negro y blanco.',
  '#000000',
  '#111111',
  '#FF3A20',
  '#FFFFFF',
  '#000000',
  'SPORT',
  'athletic',
  true,
  20
)
ON CONFLICT DO NOTHING;

-- Verificar resultado
SELECT id, name, site_type, color_primary, color_accent, is_active, position
FROM store_templates
ORDER BY position;
