-- ════════════════════════════════════════════════════════════════════════════
-- migration_image_focal_point.sql — Focal point per imagen de hero/split
-- ════════════════════════════════════════════════════════════════════════════
--
-- Problema:
--   Las imágenes de hero y split se renderizan con `object-fit: cover` y
--   `object-position: center` (default). Para fotos verticales de personas
--   o productos altos, eso recorta a la altura de la cintura → "cortadas
--   raras". El cliente reportó: "me quedan la mayoria enfocando las cinturas
--   para abajo".
--
-- Solución:
--   Permitir que el admin elija el punto focal de cada imagen via
--   click-to-set en la UI. Se guarda como string CSS object-position
--   (ej: "50% 30%" o "center" o "top").
--
--   Default 'center' = comportamiento actual, no rompe nada.

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS hero_image_position text NOT NULL DEFAULT 'center';

ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS home_split_image_position text NOT NULL DEFAULT 'center';

COMMENT ON COLUMN store_config.hero_image_position IS
  'CSS object-position para hero_image_url. Default "center". Acepta "top", "bottom", "left", "right" o "X% Y%" (ej: "50% 30%").';

COMMENT ON COLUMN store_config.home_split_image_position IS
  'CSS object-position para home_split_image_url. Default "center".';
