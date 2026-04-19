-- =============================================================================
-- VENDLY — Seed de ropa
-- Pegar en Supabase → SQL Editor → Run
-- =============================================================================

-- Variables
DO $$
DECLARE
  sid uuid := '30ea383a-adbe-4c30-bff8-aa733efd40ec';

  -- Categorías
  cat_remeras    uuid;
  cat_pantalones uuid;
  cat_camperas   uuid;
  cat_vestidos   uuid;
  cat_accesorios uuid;

  -- Productos
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid;
  p6 uuid; p7 uuid; p8 uuid; p9 uuid; p10 uuid;
  p11 uuid; p12 uuid;

BEGIN

-- =============================================================================
-- 1. ACTUALIZAR STORE CONFIG
-- =============================================================================
UPDATE store_config SET
  name                    = 'Ona Store',
  slug                    = 'ona-store',
  color_primary           = '#1c1c1c',
  color_secondary         = '#2d2d2d',
  color_accent            = '#c9a96e',
  color_background        = '#fafafa',
  color_text              = '#1c1c1c',
  hero_title              = 'Nueva colección otoño',
  hero_subtitle           = 'Piezas atemporales diseñadas para durar. Calidad premium a tu alcance.',
  hero_cta_label          = 'Ver colección',
  hero_cta_url            = '/productos',
  free_shipping_threshold = 60000,
  shipping_base_price     = 5500,
  whatsapp_number         = '5491100000000',
  email                   = 'hola@onastore.com',
  meta_title              = 'Ona Store — Ropa femenina',
  meta_description        = 'Tienda de ropa femenina con piezas atemporales y calidad premium.'
WHERE id = sid;

-- =============================================================================
-- 2. CATEGORÍAS
-- =============================================================================
INSERT INTO categories (store_id, name, slug, description, image_url, position, is_active)
VALUES (sid, 'Remeras', 'remeras', 'Básicos y diseños únicos en telas premium', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80', 1, true)
ON CONFLICT (store_id, slug) DO NOTHING;

INSERT INTO categories (store_id, name, slug, description, image_url, position, is_active)
VALUES (sid, 'Pantalones', 'pantalones', 'Jeans, cargo y pantalones de vestir', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80', 2, true)
ON CONFLICT (store_id, slug) DO NOTHING;

INSERT INTO categories (store_id, name, slug, description, image_url, position, is_active)
VALUES (sid, 'Camperas', 'camperas', 'Para el frío con estilo', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', 3, true)
ON CONFLICT (store_id, slug) DO NOTHING;

INSERT INTO categories (store_id, name, slug, description, image_url, position, is_active)
VALUES (sid, 'Vestidos', 'vestidos', 'De día y de noche', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80', 4, true)
ON CONFLICT (store_id, slug) DO NOTHING;

INSERT INTO categories (store_id, name, slug, description, image_url, position, is_active)
VALUES (sid, 'Accesorios', 'accesorios', 'Bolsos, gorras y más', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80', 5, true)
ON CONFLICT (store_id, slug) DO NOTHING;

SELECT id INTO cat_remeras    FROM categories WHERE store_id = sid AND slug = 'remeras';
SELECT id INTO cat_pantalones FROM categories WHERE store_id = sid AND slug = 'pantalones';
SELECT id INTO cat_camperas   FROM categories WHERE store_id = sid AND slug = 'camperas';
SELECT id INTO cat_vestidos   FROM categories WHERE store_id = sid AND slug = 'vestidos';
SELECT id INTO cat_accesorios FROM categories WHERE store_id = sid AND slug = 'accesorios';

-- =============================================================================
-- 3. PRODUCTOS
-- =============================================================================

-- REMERA 1
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_remeras, 'Remera Oversize Essential', 'remera-oversize-essential',
  'Corte oversize en 100% algodón pesado. Una pieza básica que nunca pasa de moda. Disponible en colores neutros para combinar con todo.',
  18500, 24000,
  ARRAY['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80',
        'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80'],
  true, true, ARRAY['remera','oversize','basico','algodón'])
RETURNING id INTO p1;

-- REMERA 2
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_remeras, 'Remera Crop Ribeteada', 'remera-crop-ribeteada',
  'Corte crop ajustado con terminaciones ribeteadas. Perfect para combinar con jeans de tiro alto o faldas midi.',
  14500, NULL,
  ARRAY['https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80',
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&q=80'],
  true, false, ARRAY['remera','crop','ajustado'])
RETURNING id INTO p2;

-- REMERA 3
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_remeras, 'Remera Manga Larga Acanalada', 'remera-manga-larga-acanalada',
  'Tejido acanalado elastizado con corte body. Ideal para usar sola o como base bajo camperas y sacos.',
  16900, 21000,
  ARRAY['https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80'],
  true, true, ARRAY['remera','manga larga','acanalado','basico'])
RETURNING id INTO p3;

-- PANTALON 1
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_pantalones, 'Jean Recto Clásico', 'jean-recto-clasico',
  'Jean de tiro medio con corte recto. Denim de 12 oz con mínimo stretch para mantener la forma todo el día.',
  42000, 55000,
  ARRAY['https://images.unsplash.com/photo-1542574271-7f3b92e6c821?w=800&q=80',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80'],
  true, true, ARRAY['jean','recto','denim','clasico'])
RETURNING id INTO p4;

-- PANTALON 2
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_pantalones, 'Pantalón Cargo Wide Leg', 'pantalon-cargo-wide-leg',
  'Pantalón cargo de pierna ancha en gabardina resistente. 6 bolsillos funcionales. Corte relajado con pretina elástica.',
  38500, NULL,
  ARRAY['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80',
        'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&q=80'],
  true, false, ARRAY['pantalon','cargo','wide leg'])
RETURNING id INTO p5;

-- PANTALON 3
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_pantalones, 'Jean Mom Fit Vintage', 'jean-mom-fit-vintage',
  'Jean de tiro alto con corte mom. Lavado vintage con efecto desgastado natural. El must-have de la temporada.',
  45000, 58000,
  ARRAY['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=800&q=80',
        'https://images.unsplash.com/photo-1555689502-c4b22d76c56f?w=800&q=80'],
  true, true, ARRAY['jean','mom fit','vintage','tiro alto'])
RETURNING id INTO p6;

-- CAMPERA 1
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_camperas, 'Campera Bomber Satinada', 'campera-bomber-satinada',
  'Bomber en tela satinada con interior acolchado. Elásticos en puños y cintura. El statement piece de la temporada.',
  72000, 89000,
  ARRAY['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80',
        'https://images.unsplash.com/photo-1608063615781-e2ef8c73d114?w=800&q=80'],
  true, true, ARRAY['campera','bomber','satinado'])
RETURNING id INTO p7;

-- CAMPERA 2
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_camperas, 'Sobretodo Oversize Lana', 'sobretodo-oversize-lana',
  'Sobretodo largo en mezcla de lana con corte oversize. Botones forrados. La pieza de inversión que usarás por años.',
  125000, 160000,
  ARRAY['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80',
        'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=800&q=80'],
  true, true, ARRAY['sobretodo','lana','oversize','abrigo'])
RETURNING id INTO p8;

-- VESTIDO 1
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_vestidos, 'Vestido Midi Floral', 'vestido-midi-floral',
  'Vestido midi en tela fluida con estampado floral. Escote en V y mangas globo. Perfecto para el día y la noche con los accesorios correctos.',
  35000, 45000,
  ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80'],
  true, true, ARRAY['vestido','midi','floral','flowy'])
RETURNING id INTO p9;

-- VESTIDO 2
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_vestidos, 'Vestido Negro Mini Ajustado', 'vestido-negro-mini-ajustado',
  'El clásico LBD (little black dress) reinventado. Corte mini con escote cruzado y tela crepé de alta costura.',
  41000, NULL,
  ARRAY['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'],
  true, false, ARRAY['vestido','mini','negro','ajustado'])
RETURNING id INTO p10;

-- ACCESORIO 1
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_accesorios, 'Bolso Tote de Cuero Vegano', 'bolso-tote-cuero-vegano',
  'Tote bag espaciosa en cuero vegano premium. Cierre magnético y bolsillo interior. Asa larga desmontable.',
  48000, 62000,
  ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
  true, true, ARRAY['bolso','tote','cuero','accesorio'])
RETURNING id INTO p11;

-- ACCESORIO 2
INSERT INTO products (store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
VALUES (sid, cat_accesorios, 'Gorra Dad Hat Bordada', 'gorra-dad-hat-bordada',
  'Gorra dad hat non-structured en drill de algodón. Bordado tonal en el frente. Cierre ajustable metálico.',
  12500, NULL,
  ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80',
        'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800&q=80'],
  true, false, ARRAY['gorra','accesorio','dad hat'])
RETURNING id INTO p12;

-- =============================================================================
-- 4. VARIANTES
-- =============================================================================

-- Remera Oversize Essential (S/M/L/XL — Negro, Blanco, Arena)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p1, '{"talle":"S","color":"Negro"}',  'ROE-S-NEG', 8,  NULL, true),
  (p1, '{"talle":"M","color":"Negro"}',  'ROE-M-NEG', 12, NULL, true),
  (p1, '{"talle":"L","color":"Negro"}',  'ROE-L-NEG', 10, NULL, true),
  (p1, '{"talle":"XL","color":"Negro"}', 'ROE-XL-NEG',5,  NULL, true),
  (p1, '{"talle":"S","color":"Blanco"}', 'ROE-S-BLA', 7,  NULL, true),
  (p1, '{"talle":"M","color":"Blanco"}', 'ROE-M-BLA', 10, NULL, true),
  (p1, '{"talle":"L","color":"Blanco"}', 'ROE-L-BLA', 8,  NULL, true),
  (p1, '{"talle":"S","color":"Arena"}',  'ROE-S-ARE', 6,  NULL, true),
  (p1, '{"talle":"M","color":"Arena"}',  'ROE-M-ARE', 9,  NULL, true);

-- Remera Crop Ribeteada (XS/S/M/L — Negro, Crema)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p2, '{"talle":"XS","color":"Negro"}', 'RCR-XS-NEG', 6, NULL, true),
  (p2, '{"talle":"S","color":"Negro"}',  'RCR-S-NEG',  9, NULL, true),
  (p2, '{"talle":"M","color":"Negro"}',  'RCR-M-NEG', 11, NULL, true),
  (p2, '{"talle":"L","color":"Negro"}',  'RCR-L-NEG',  5, NULL, true),
  (p2, '{"talle":"XS","color":"Crema"}', 'RCR-XS-CRE', 4, NULL, true),
  (p2, '{"talle":"S","color":"Crema"}',  'RCR-S-CRE',  8, NULL, true),
  (p2, '{"talle":"M","color":"Crema"}',  'RCR-M-CRE', 10, NULL, true);

-- Remera Manga Larga Acanalada (XS/S/M/L/XL)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p3, '{"talle":"XS","color":"Negro"}',   'RMLA-XS-NEG', 5,  NULL, true),
  (p3, '{"talle":"S","color":"Negro"}',    'RMLA-S-NEG', 10,  NULL, true),
  (p3, '{"talle":"M","color":"Negro"}',    'RMLA-M-NEG', 12,  NULL, true),
  (p3, '{"talle":"L","color":"Negro"}',    'RMLA-L-NEG',  8,  NULL, true),
  (p3, '{"talle":"S","color":"Camel"}',    'RMLA-S-CAM',  7,  NULL, true),
  (p3, '{"talle":"M","color":"Camel"}',    'RMLA-M-CAM',  9,  NULL, true),
  (p3, '{"talle":"L","color":"Camel"}',    'RMLA-L-CAM',  6,  NULL, true),
  (p3, '{"talle":"S","color":"Bordo"}',    'RMLA-S-BOR',  8,  NULL, true),
  (p3, '{"talle":"M","color":"Bordo"}',    'RMLA-M-BOR', 11,  NULL, true);

-- Jean Recto Clásico (34/36/38/40/42 — Azul, Negro)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p4, '{"talle":"34","color":"Azul"}',  'JRC-34-AZU', 5, NULL, true),
  (p4, '{"talle":"36","color":"Azul"}',  'JRC-36-AZU', 8, NULL, true),
  (p4, '{"talle":"38","color":"Azul"}',  'JRC-38-AZU',10, NULL, true),
  (p4, '{"talle":"40","color":"Azul"}',  'JRC-40-AZU', 7, NULL, true),
  (p4, '{"talle":"42","color":"Azul"}',  'JRC-42-AZU', 4, NULL, true),
  (p4, '{"talle":"34","color":"Negro"}', 'JRC-34-NEG', 4, NULL, true),
  (p4, '{"talle":"36","color":"Negro"}', 'JRC-36-NEG', 6, NULL, true),
  (p4, '{"talle":"38","color":"Negro"}', 'JRC-38-NEG', 9, NULL, true),
  (p4, '{"talle":"40","color":"Negro"}', 'JRC-40-NEG', 5, NULL, true);

-- Pantalón Cargo Wide Leg (S/M/L/XL)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p5, '{"talle":"S","color":"Verde"}',  'PCW-S-VER', 7, NULL, true),
  (p5, '{"talle":"M","color":"Verde"}',  'PCW-M-VER',10, NULL, true),
  (p5, '{"talle":"L","color":"Verde"}',  'PCW-L-VER', 8, NULL, true),
  (p5, '{"talle":"XL","color":"Verde"}', 'PCW-XL-VER',4, NULL, true),
  (p5, '{"talle":"S","color":"Negro"}',  'PCW-S-NEG', 6, NULL, true),
  (p5, '{"talle":"M","color":"Negro"}',  'PCW-M-NEG', 9, NULL, true),
  (p5, '{"talle":"L","color":"Negro"}',  'PCW-L-NEG', 7, NULL, true);

-- Jean Mom Fit Vintage (34/36/38/40)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p6, '{"talle":"34","color":"Celeste"}', 'JMF-34-CEL', 6, NULL, true),
  (p6, '{"talle":"36","color":"Celeste"}', 'JMF-36-CEL',10, NULL, true),
  (p6, '{"talle":"38","color":"Celeste"}', 'JMF-38-CEL', 9, NULL, true),
  (p6, '{"talle":"40","color":"Celeste"}', 'JMF-40-CEL', 5, NULL, true),
  (p6, '{"talle":"34","color":"Negro"}',   'JMF-34-NEG', 4, NULL, true),
  (p6, '{"talle":"36","color":"Negro"}',   'JMF-36-NEG', 7, NULL, true),
  (p6, '{"talle":"38","color":"Negro"}',   'JMF-38-NEG', 8, NULL, true);

-- Campera Bomber Satinada (S/M/L/XL — Negro, Champán)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p7, '{"talle":"S","color":"Negro"}',   'CBS-S-NEG', 4, NULL, true),
  (p7, '{"talle":"M","color":"Negro"}',   'CBS-M-NEG', 6, NULL, true),
  (p7, '{"talle":"L","color":"Negro"}',   'CBS-L-NEG', 5, NULL, true),
  (p7, '{"talle":"XL","color":"Negro"}',  'CBS-XL-NEG',3, NULL, true),
  (p7, '{"talle":"S","color":"Champán"}', 'CBS-S-CHA', 3, NULL, true),
  (p7, '{"talle":"M","color":"Champán"}', 'CBS-M-CHA', 5, NULL, true),
  (p7, '{"talle":"L","color":"Champán"}', 'CBS-L-CHA', 4, NULL, true);

-- Sobretodo Oversize Lana (S/M/L — Camel, Negro, Gris)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p8, '{"talle":"S","color":"Camel"}',  'SOL-S-CAM', 3, NULL, true),
  (p8, '{"talle":"M","color":"Camel"}',  'SOL-M-CAM', 5, NULL, true),
  (p8, '{"talle":"L","color":"Camel"}',  'SOL-L-CAM', 4, NULL, true),
  (p8, '{"talle":"S","color":"Negro"}',  'SOL-S-NEG', 2, NULL, true),
  (p8, '{"talle":"M","color":"Negro"}',  'SOL-M-NEG', 4, NULL, true),
  (p8, '{"talle":"L","color":"Negro"}',  'SOL-L-NEG', 3, NULL, true),
  (p8, '{"talle":"S","color":"Gris"}',   'SOL-S-GRI', 3, NULL, true),
  (p8, '{"talle":"M","color":"Gris"}',   'SOL-M-GRI', 4, NULL, true);

-- Vestido Midi Floral (XS/S/M/L)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p9, '{"talle":"XS"}', 'VMF-XS', 5, NULL, true),
  (p9, '{"talle":"S"}',  'VMF-S', 8,  NULL, true),
  (p9, '{"talle":"M"}',  'VMF-M', 9,  NULL, true),
  (p9, '{"talle":"L"}',  'VMF-L', 6,  NULL, true);

-- Vestido Negro Mini (XS/S/M/L)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p10, '{"talle":"XS"}', 'VNM-XS', 4, NULL, true),
  (p10, '{"talle":"S"}',  'VNM-S',  7, NULL, true),
  (p10, '{"talle":"M"}',  'VNM-M',  8, NULL, true),
  (p10, '{"talle":"L"}',  'VNM-L',  5, NULL, true);

-- Bolso Tote (Negro, Cognac, Arena)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p11, '{"color":"Negro"}',  'BTV-NEG', 8, NULL, true),
  (p11, '{"color":"Cognac"}', 'BTV-COG', 6, NULL, true),
  (p11, '{"color":"Arena"}',  'BTV-ARE', 5, NULL, true);

-- Gorra Dad Hat (Negro, Blanco, Verde)
INSERT INTO product_variants (product_id, attributes, sku, stock, price_override, is_active) VALUES
  (p12, '{"color":"Negro"}',  'GDH-NEG', 15, NULL, true),
  (p12, '{"color":"Blanco"}', 'GDH-BLA', 12, NULL, true),
  (p12, '{"color":"Verde"}',  'GDH-VER', 10, NULL, true);

-- =============================================================================
-- 5. CUPÓN DE BIENVENIDA
-- =============================================================================
INSERT INTO coupons (store_id, code, type, value, min_order_amount, max_uses, is_active)
VALUES
  (sid, 'BIENVENIDA10', 'percentage', 10, 20000, 100, true),
  (sid, 'ENVIOGRATIS',  'fixed',      5500, 30000, 50,  true)
ON CONFLICT (store_id, code) DO NOTHING;

RAISE NOTICE 'Seed completado: 5 categorías, 12 productos, variantes y cupones insertados.';

END $$;
