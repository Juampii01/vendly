-- =============================================================================
-- VENDLY — Migración Fase 3: Web Generation Engine
-- =============================================================================

-- ─── 1. store_templates — plantillas predefinidas para nuevos stores ──────────
--
-- Cada template define valores iniciales para store_config.
-- Los stores creados desde un template heredan estos valores y luego
-- pueden customizarlos desde el panel de admin.
--
CREATE TABLE IF NOT EXISTS store_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,           -- Screenshot o imagen de la plantilla
  -- Config heredada al crear el store
  color_primary    TEXT NOT NULL DEFAULT '#1a1a2e',
  color_secondary  TEXT NOT NULL DEFAULT '#16213e',
  color_accent     TEXT NOT NULL DEFAULT '#e94560',
  color_background TEXT NOT NULL DEFAULT '#ffffff',
  color_text       TEXT NOT NULL DEFAULT '#1a1a2e',
  -- Hero defaults
  hero_title     TEXT NOT NULL DEFAULT 'Bienvenidos',
  hero_cta_label TEXT NOT NULL DEFAULT 'Ver productos',
  hero_cta_url   TEXT NOT NULL DEFAULT '/productos',
  -- Meta
  is_active   BOOLEAN DEFAULT true,
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Plantillas iniciales
INSERT INTO store_templates (name, description, position, color_primary, color_secondary, color_accent, color_background, color_text, hero_title, hero_cta_label) VALUES
  ('Minimal Dark',  'Elegante y minimalista sobre fondo oscuro',                0, '#0a0a0a', '#1c1c1c', '#ffffff', '#0a0a0a', '#ffffff', 'Nueva Colección', 'Explorar'),
  ('Clean White',   'Moderno y limpio, ideal para moda y lifestyle',            1, '#1a1a1a', '#333333', '#ff4444', '#ffffff', '#1a1a1a', 'Descubrí nuestra colección', 'Ver todo'),
  ('Bold Accent',   'Colores vibrantes para marcas con personalidad fuerte',    2, '#6c63ff', '#4a47b0', '#ff6584', '#fafafa', '#1a1a1a', 'Estilo sin límites', 'Shop now'),
  ('Earth Tones',   'Paleta natural, ideal para marcas sustentables y orgánicas', 3, '#5c4033', '#8d6e63', '#a5d6a7', '#fdf6ec', '#3e2723', 'Natural y auténtico', 'Ver colección'),
  ('Luxury Gold',   'Sofisticado y premium, para marcas de lujo',              4, '#1a1200', '#3d2b00', '#c8a951', '#0a0900', '#f5e6c8', 'Exclusivo por diseño', 'Descubrí');

-- RLS: lectura pública (se muestran en el wizard de creación)
ALTER TABLE store_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_templates" ON store_templates FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "service_all_templates"  ON store_templates FOR ALL   TO service_role USING (true);

-- ─── 2. platform_users — admins de plataforma (no de store) ──────────────────
--
-- Separados de admin_users (que son admins de un store específico).
-- Los platform_users pueden crear, ver y desactivar stores.
--
CREATE TABLE IF NOT EXISTS platform_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_all_platform_users" ON platform_users FOR ALL TO service_role USING (true);

-- ─── 3. Campos adicionales en store_config ────────────────────────────────────

-- Estado del store (active/inactive/suspended)
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'suspended'));

-- Template del que fue creado (referencia informativa)
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES store_templates(id);

-- Fecha de plan/expiración (para billing futuro)
ALTER TABLE store_config ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
  CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));

ALTER TABLE store_config ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN store_config.status IS 'Estado operativo del store.';
COMMENT ON COLUMN store_config.plan IS 'Plan de pricing del store.';
