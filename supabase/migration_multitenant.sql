-- =============================================================================
-- VENDLY — Migración: infraestructura multi-tenant
-- Correr en Supabase → SQL Editor → Run
--
-- No es destructiva: agrega tabla nueva y columnas con defaults seguros.
-- =============================================================================

-- ─── 1. store_domains — mapea dominios/subdominios a store_id ────────────────
--
-- Permite dos patrones de routing:
--   a) Subdominio de la plataforma: ona.vendly.com  (inferido por middleware)
--   b) Dominio propio: ona.com                      (registrado en esta tabla)
--
CREATE TABLE IF NOT EXISTS store_domains (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES store_config(id) ON DELETE CASCADE,
  domain     TEXT NOT NULL UNIQUE,    -- ej: "ona.com" — sin protocolo, sin puerto
  is_primary BOOLEAN DEFAULT false,   -- dominio canónico del store
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_domains_domain_idx ON store_domains (domain);

-- RLS
ALTER TABLE store_domains ENABLE ROW LEVEL SECURITY;

-- Lectura pública: el middleware (anon key) necesita resolver hostname → store_id
CREATE POLICY "anon_read_domains"
  ON store_domains FOR SELECT
  TO anon, authenticated
  USING (true);

-- Solo service role puede insertar/actualizar (desde el panel de admin interno)
CREATE POLICY "service_write_domains"
  ON store_domains FOR ALL
  TO service_role
  USING (true);

COMMENT ON TABLE store_domains IS
  'Mapea dominios propios a store_id. Los subdominios de la plataforma '
  '(slug.vendly.com) se resuelven directamente por middleware via store_config.slug.';

-- ─── 2. base_url en store_config — necesario para monitor multi-sitio ─────────
--
-- URL pública completa del store, ej: "https://ona.vendly.com"
-- El cron de monitoreo itera todos los stores que tengan base_url configurada.
--
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS base_url TEXT;

COMMENT ON COLUMN store_config.base_url IS
  'URL base pública del store (ej: https://ona.vendly.com). '
  'Si está configurada, el monitor multi-sitio incluye este store en sus checks.';

-- ─── 3. store_id en monitor_incidents — scoping por store ─────────────────────
--
-- Agrega una columna informativa store_id. El monitor multi-sitio la setea
-- en cada fila. No modifica el unique constraint existente en check_name:
-- los checks multi-tenant usan el formato "{store_id}:{check_name}" como clave.
--
ALTER TABLE monitor_incidents
  ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES store_config(id);

CREATE INDEX IF NOT EXISTS monitor_incidents_store_idx ON monitor_incidents (store_id);

COMMENT ON COLUMN monitor_incidents.store_id IS
  'Store al que pertenece este incident. NULL = datos pre-migración (single-tenant). '
  'En modo multi-tenant, check_name tiene formato "{store_id}:{nombre}" para mantener unicidad.';
