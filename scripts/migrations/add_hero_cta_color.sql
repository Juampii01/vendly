-- Agrega campo hero_cta_color a store_config
-- Permite controlar el color del botón CTA del hero independientemente del color_accent
-- NULL = usa color_accent como fallback

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS hero_cta_color TEXT DEFAULT NULL;
