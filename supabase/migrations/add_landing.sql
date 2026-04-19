-- ─── Landing page support ────────────────────────────────────────────────────
-- Adds site_type and sections columns to store_config.
-- Run once. Idempotent.

SET search_path TO public;

-- 1. site_type
ALTER TABLE public.store_config
  ADD COLUMN IF NOT EXISTS site_type TEXT NOT NULL DEFAULT 'ecommerce'
    CHECK (site_type IN ('ecommerce','landing','portfolio','restaurant','services'));

-- 2. sections (JSONB array of landing sections)
ALTER TABLE public.store_config
  ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT NULL;

-- 3. Index for filtering by site_type
CREATE INDEX IF NOT EXISTS idx_store_config_site_type ON public.store_config (site_type);
