-- =============================================================================
-- VENDLY — Migración: contenido configurable del home
-- Correr en Supabase → SQL Editor → Run
--
-- No es destructiva: solo agrega columnas a store_config.
-- Las columnas usan DEFAULT para que los stores existentes sigan funcionando.
-- =============================================================================

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS home_marquee_items   text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS home_split_image_url text,
  ADD COLUMN IF NOT EXISTS home_editorial_label text,
  ADD COLUMN IF NOT EXISTS home_editorial_title text,
  ADD COLUMN IF NOT EXISTS home_editorial_body  text;

-- Comentarios de documentación
COMMENT ON COLUMN store_config.home_marquee_items   IS 'Textos del ticker/marquee del home. Array de strings. Si está vacío se usan los textos por defecto.';
COMMENT ON COLUMN store_config.home_split_image_url IS 'URL de la imagen en la sección editorial (split) del home.';
COMMENT ON COLUMN store_config.home_editorial_label IS 'Etiqueta de temporada en el editorial (ej: "Colección Otoño 2025").';
COMMENT ON COLUMN store_config.home_editorial_title IS 'Titular del editorial del home (ej: "Menos ruido.\nMás estilo.").';
COMMENT ON COLUMN store_config.home_editorial_body  IS 'Párrafo descriptivo del editorial del home.';
