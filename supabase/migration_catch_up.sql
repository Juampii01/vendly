-- =============================================================================
-- VENDLY — Migración catch-up (idempotente)
-- Incluye todas las migraciones pendientes. Podés correrla múltiples veces sin
-- romper nada — todos los cambios usan IF NOT EXISTS / DEFAULT seguros.
-- Correr en: Supabase → SQL Editor → Run
-- =============================================================================

-- ─── 1. store_config: currency + locale ──────────────────────────────────────
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS locale   TEXT NOT NULL DEFAULT 'es-AR';

-- ─── 2. store_config: base_url ───────────────────────────────────────────────
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS base_url TEXT;

-- ─── 3. store_config: status, plan, plan_expires_at, template_id ─────────────
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended'));

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'));

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- store_templates debe existir antes de agregar template_id
CREATE TABLE IF NOT EXISTS store_templates (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  color_primary    TEXT NOT NULL DEFAULT '#1a1a2e',
  color_secondary  TEXT NOT NULL DEFAULT '#16213e',
  color_accent     TEXT NOT NULL DEFAULT '#e94560',
  color_background TEXT NOT NULL DEFAULT '#ffffff',
  color_text       TEXT NOT NULL DEFAULT '#1a1a2e',
  hero_title     TEXT NOT NULL DEFAULT 'Bienvenidos',
  hero_cta_label TEXT NOT NULL DEFAULT 'Ver productos',
  hero_cta_url   TEXT NOT NULL DEFAULT '/productos',
  is_active   BOOLEAN DEFAULT true,
  position    INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_templates" ON store_templates;
DROP POLICY IF EXISTS "service_all_templates"  ON store_templates;
CREATE POLICY "public_read_templates" ON store_templates FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "service_all_templates"  ON store_templates FOR ALL   TO service_role USING (true);

-- Plantillas iniciales (no duplicar si ya existen)
INSERT INTO store_templates (name, description, position, color_primary, color_secondary, color_accent, color_background, color_text, hero_title, hero_cta_label)
SELECT * FROM (VALUES
  ('Minimal Dark',  'Elegante y minimalista sobre fondo oscuro',                0, '#0a0a0a', '#1c1c1c', '#ffffff', '#0a0a0a', '#ffffff', 'Nueva Colección', 'Explorar'),
  ('Clean White',   'Moderno y limpio, ideal para moda y lifestyle',            1, '#1a1a1a', '#333333', '#ff4444', '#ffffff', '#1a1a1a', 'Descubrí nuestra colección', 'Ver todo'),
  ('Bold Accent',   'Colores vibrantes para marcas con personalidad fuerte',    2, '#6c63ff', '#4a47b0', '#ff6584', '#fafafa', '#1a1a1a', 'Estilo sin límites', 'Shop now'),
  ('Earth Tones',   'Paleta natural, ideal para marcas sustentables',           3, '#5c4033', '#8d6e63', '#a5d6a7', '#fdf6ec', '#3e2723', 'Natural y auténtico', 'Ver colección'),
  ('Luxury Gold',   'Sofisticado y premium, para marcas de lujo',               4, '#1a1200', '#3d2b00', '#c8a951', '#0a0900', '#f5e6c8', 'Exclusivo por diseño', 'Descubrí')
) AS v(name, description, position, color_primary, color_secondary, color_accent, color_background, color_text, hero_title, hero_cta_label)
WHERE NOT EXISTS (SELECT 1 FROM store_templates LIMIT 1);

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES store_templates(id);

-- ─── 4. store_domains ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_domains (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES store_config(id) ON DELETE CASCADE,
  domain     TEXT NOT NULL UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_domains_domain_idx ON store_domains (domain);

ALTER TABLE store_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_read_domains"    ON store_domains;
DROP POLICY IF EXISTS "service_write_domains" ON store_domains;
CREATE POLICY "anon_read_domains"     ON store_domains FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "service_write_domains" ON store_domains FOR ALL    TO service_role         USING (true);

-- ─── 5. monitor_incidents: store_id ──────────────────────────────────────────
ALTER TABLE monitor_incidents
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES store_config(id);

CREATE INDEX IF NOT EXISTS monitor_incidents_store_idx ON monitor_incidents (store_id);

-- ─── 6. tenant_config ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenant_config (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id  UUID NOT NULL UNIQUE REFERENCES store_config(id) ON DELETE CASCADE,
  mp_access_token    TEXT,
  mp_public_key      TEXT,
  mp_webhook_secret  TEXT,
  resend_api_key     TEXT,
  resend_from_domain TEXT,
  wa_api_key         TEXT,
  wa_from_number     TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_all_tenant_config" ON tenant_config;
CREATE POLICY "service_all_tenant_config" ON tenant_config FOR ALL TO service_role USING (true);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tenant_config_updated_at ON tenant_config;
CREATE TRIGGER tenant_config_updated_at
  BEFORE UPDATE ON tenant_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── 7. platform_users ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE platform_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_all_platform_users" ON platform_users;
CREATE POLICY "service_all_platform_users" ON platform_users FOR ALL TO service_role USING (true);

-- ─── 8. store_config: home page content ──────────────────────────────────────
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS home_marquee_items   TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS home_split_image_url TEXT,
  ADD COLUMN IF NOT EXISTS home_editorial_label TEXT,
  ADD COLUMN IF NOT EXISTS home_editorial_title TEXT,
  ADD COLUMN IF NOT EXISTS home_editorial_body  TEXT;

-- =============================================================================
-- Listo. Todas las columnas y tablas están sincronizadas.
-- =============================================================================
