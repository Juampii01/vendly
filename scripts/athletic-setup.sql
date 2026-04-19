-- ─── Setup del template "Athletic" para la tienda adidas ─────────────────────
--
-- Cambia el slug si es diferente al que usaste
-- Ejecutar en Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE store_config SET
  -- Template
  site_type           = 'athletic',

  -- Paleta negro / blanco / rojo fuego
  color_primary       = '#000000',
  color_secondary     = '#111111',
  color_accent        = '#FF3A20',
  color_background    = '#FFFFFF',
  color_text          = '#000000',

  -- Hero
  hero_title          = 'IMPOSSIBLE IS NOTHING',
  hero_subtitle       = 'Colección AW 2025',
  hero_cta_label      = 'Comprar ahora',
  hero_cta_url        = '/productos',
  hero_image_url      = 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1800&q=85',
  hero_cta_color      = '#FF3A20',

  -- Home
  home_marquee_items  = ARRAY['NUEVA TEMPORADA', 'ENVÍO A TODO EL PAÍS', 'PERFORMANCE · STYLE', 'AW 2025'],
  home_split_image_url = 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=85',
  home_editorial_label = 'Nuestra filosofía',
  home_editorial_title = 'IMPOSSIBLE IS NOTHING',
  home_editorial_body  = 'Ropa diseñada para llevar tu rendimiento al límite. Cada prenda es el resultado de años de investigación y pasión por el deporte.',

  -- SEO
  meta_title          = 'Athletic — Ropa deportiva de alto rendimiento',
  meta_description    = 'Diseño deportivo bold. Nueva colección disponible. Envío a todo el país.',

  -- Envío
  free_shipping_threshold = 50000,
  shipping_base_price     = 2500

WHERE slug = 'adidas';  -- ← cambiá este slug si es diferente

-- Verificar resultado
SELECT slug, site_type, color_primary, color_background, color_accent
FROM store_config
WHERE slug = 'adidas';
