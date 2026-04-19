-- ─── Setup del template "Modo" para la tienda pagina-prueba ─────────────────
--
-- Usa site_type = 'modo' como identificador de template (TEXT, sin restricción UUID)
-- Ejecutar en Supabase SQL Editor

UPDATE store_config SET
  -- Template: usa site_type como selector de diseño
  site_type           = 'modo',

  -- Paleta completamente nueva (crema / negro / rojo fuego)
  color_primary       = '#111111',
  color_secondary     = '#2a2a2a',
  color_accent        = '#E63329',
  color_background    = '#FAF7F2',
  color_text          = '#111111',

  -- Hero
  hero_title          = 'MODO',
  hero_subtitle       = 'Colección — Otoño 2025',
  hero_cta_label      = 'Ver la colección',
  hero_cta_url        = '/productos',
  hero_image_url      = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1400&q=85',
  hero_cta_color      = '#E63329',

  -- Home
  home_marquee_items  = ARRAY['NUEVA COLECCIÓN', 'ENVÍO A TODO EL PAÍS', 'PIEZAS ÚNICAS', 'MODO — AW 2025'],
  home_split_image_url = 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=85',
  home_editorial_label = 'Nuestra filosofía',
  home_editorial_title = 'Menos tendencia. Más carácter.',
  home_editorial_body  = 'Prendas pensadas para durar más que una temporada. Diseño que dice algo antes de que abras la boca.',

  -- SEO
  meta_title          = 'Modo — Indumentaria de autor',
  meta_description    = 'Moda con carácter. Piezas únicas, diseño editorial, envío a todo el país.',

  -- Envío
  free_shipping_threshold = 60000,
  shipping_base_price     = 3500

WHERE slug = 'pagina-prueba';

-- Verificar resultado
SELECT slug, site_type, color_primary, color_background, color_accent
FROM store_config
WHERE slug = 'pagina-prueba';
