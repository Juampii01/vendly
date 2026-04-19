-- ============================================================
-- El Rincón del Libro — Librería Setup
-- Store ID: 96d630b9-e5da-4c38-a11e-26982c64437e
-- Ejecutar en Supabase SQL Editor
-- ============================================================

ALTER TABLE store_config DROP CONSTRAINT IF EXISTS store_config_site_type_check;
ALTER TABLE store_config ADD CONSTRAINT store_config_site_type_check
  CHECK (site_type IN (
    'ecommerce','landing','portfolio','restaurant','services',
    'modo','athletic','dealership','vendly-marketing','libreria'
  ));

UPDATE store_config SET
  site_type        = 'libreria',
  name             = 'El Rincón del Libro',
  color_primary    = '#2C1A0E',
  color_secondary  = '#4A2E1A',
  color_accent     = '#B5632A',
  color_background = '#FAF6EF',
  color_text       = '#1A0F08',
  hero_title       = 'El mundo cabe en un libro',
  hero_subtitle    = 'Tu próxima historia te espera',
  hero_cta_label   = 'Explorar catálogo',
  hero_cta_url     = '/productos',
  hero_image_url   = 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1800&q=85',
  home_split_image_url = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=85',
  home_editorial_label = 'Nuestra filosofía',
  home_editorial_title = 'Cada libro es una puerta a otro mundo',
  home_editorial_body  = 'En El Rincón del Libro seleccionamos cuidadosamente cada título de nuestro catálogo, pensando en lectores de todas las edades e intereses. Porque creemos que la lectura transforma.',
  home_marquee_items   = ARRAY['NOVEDADES SEMANALES', 'MÁS DE 10.000 TÍTULOS', 'ENVÍO A TODO EL PAÍS', 'RETIRO EN LIBRERÍA'],
  meta_title       = 'El Rincón del Libro — Librería Online',
  meta_description = 'Más de 10.000 títulos para todos los lectores. Ficción, no ficción, infantil, poesía y más.',
  free_shipping_threshold = 15000,
  shipping_base_price     = 1500
WHERE id = '96d630b9-e5da-4c38-a11e-26982c64437e';

DELETE FROM products   WHERE store_id = '96d630b9-e5da-4c38-a11e-26982c64437e';
DELETE FROM categories WHERE store_id = '96d630b9-e5da-4c38-a11e-26982c64437e';

INSERT INTO categories (id, store_id, name, slug, description, image_url, position, is_active) VALUES
  (gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', 'Ficción', 'ficcion', 'Novelas, cuentos y relatos que despiertan la imaginación', 'https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=800&q=80', 1, true),
  (gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', 'No Ficción', 'no-ficcion', 'Ensayos, memorias y todo lo que expande tu conocimiento', 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&q=80', 2, true),
  (gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', 'Infantil', 'infantil', 'Libros para los más chicos, desde los primeros años hasta la adolescencia', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', 3, true),
  (gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', 'Poesía', 'poesia', 'Versos que dicen lo que las palabras solas no pueden', 'https://images.unsplash.com/photo-1455885661740-29cbf08a42fa?w=800&q=80', 4, true),
  (gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', 'Historia', 'historia', 'Relatos del pasado que explican el presente', 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&q=80', 5, true),
  (gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', 'Autoayuda', 'autoayuda', 'Herramientas para una vida más plena y consciente', 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&q=80', 6, true);

INSERT INTO products (id, store_id, category_id, name, slug, description, price, compare_at_price, images, is_active, is_featured, tags)
SELECT gen_random_uuid(), '96d630b9-e5da-4c38-a11e-26982c64437e', c.id,
  p.name, p.slug, p.description, p.price, p.compare_at_price, p.images, true, p.is_featured, p.tags
FROM (VALUES
  ('Ficción','Cien años de soledad','cien-anos-de-soledad','La obra cumbre del realismo mágico latinoamericano.',3200,3800::numeric,ARRAY['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'],true,ARRAY['autor:Gabriel García Márquez','bestseller','clásico','novela']),
  ('Ficción','El nombre del viento','el-nombre-del-viento','Una épica fantasía que redefine el género.',4100,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&q=80'],true,ARRAY['autor:Patrick Rothfuss','bestseller','novedad','fantasía']),
  ('Ficción','La sombra del viento','la-sombra-del-viento','Barcelona, 1945. Una novela de misterio y amor irresistible.',3600,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&q=80'],true,ARRAY['autor:Carlos Ruiz Zafón','bestseller','misterio']),
  ('Ficción','1984','mil-novecientos-ochenta-y-cuatro','La distopía que definió el siglo XX.',2900,3500::numeric,ARRAY['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'],true,ARRAY['autor:George Orwell','clásico','bestseller','distopía']),
  ('No Ficción','Sapiens: De animales a dioses','sapiens-de-animales-a-dioses','La historia de la humanidad contada de manera brillante.',5200,6000::numeric,ARRAY['https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80'],true,ARRAY['autor:Yuval Noah Harari','bestseller','novedad','ensayo']),
  ('No Ficción','El hombre en busca de sentido','el-hombre-en-busca-de-sentido','Viktor Frankl y la logoterapia. Un libro que cambia vidas.',2800,3400::numeric,ARRAY['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&q=80'],true,ARRAY['autor:Viktor Frankl','bestseller','clásico','psicología']),
  ('No Ficción','El mundo de Sofía','el-mundo-de-sofia','La historia de la filosofía occidental de manera amena.',3800,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&q=80'],false,ARRAY['autor:Jostein Gaarder','bestseller','filosofía']),
  ('Infantil','El Principito','el-principito','El clásico que habla del amor y la amistad. Para todas las edades.',2200,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&q=80'],true,ARRAY['autor:Antoine de Saint-Exupéry','clásico','bestseller']),
  ('Infantil','Harry Potter y la piedra filosofal','harry-potter-y-la-piedra-filosofal','El inicio de la saga más vendida de la historia.',4200,4900::numeric,ARRAY['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&q=80'],true,ARRAY['autor:J.K. Rowling','bestseller','novedad','fantasía']),
  ('Poesía','Veinte poemas de amor y una canción desesperada','veinte-poemas-de-amor','Neruda en su máxima expresión lírica.',1800,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80'],true,ARRAY['autor:Pablo Neruda','clásico','bestseller']),
  ('Poesía','Poeta en Nueva York','poeta-en-nueva-york','García Lorca en el epicentro de la modernidad.',2400,2900::numeric,ARRAY['https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80'],false,ARRAY['autor:Federico García Lorca','clásico']),
  ('Historia','Breve historia del tiempo','breve-historia-del-tiempo','Stephen Hawking explica los misterios del universo.',3900,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&q=80'],true,ARRAY['autor:Stephen Hawking','bestseller','novedad','ciencia']),
  ('Historia','La historia del arte','la-historia-del-arte','Gombrich guía al lector por 35.000 años de creación artística.',6800,7500::numeric,ARRAY['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80'],false,ARRAY['autor:E.H. Gombrich','clásico','arte']),
  ('Autoayuda','Los cuatro acuerdos','los-cuatro-acuerdos','Don Miguel Ruiz y la sabiduría tolteca para liberarse de creencias limitantes.',2600,3200::numeric,ARRAY['https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80'],true,ARRAY['autor:Don Miguel Ruiz','bestseller','novedad','espiritualidad']),
  ('Autoayuda','El poder del ahora','el-poder-del-ahora','Eckhart Tolle nos enseña a vivir en el presente.',3100,NULL::numeric,ARRAY['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400&q=80'],false,ARRAY['autor:Eckhart Tolle','bestseller','espiritualidad'])
) AS p(cat_name, name, slug, description, price, compare_at_price, images, is_featured, tags)
JOIN categories c ON c.name = p.cat_name AND c.store_id = '96d630b9-e5da-4c38-a11e-26982c64437e';

SELECT 'Categorías' as tipo, COUNT(*) as total FROM categories WHERE store_id = '96d630b9-e5da-4c38-a11e-26982c64437e'
UNION ALL
SELECT 'Productos', COUNT(*) FROM products WHERE store_id = '96d630b9-e5da-4c38-a11e-26982c64437e';
