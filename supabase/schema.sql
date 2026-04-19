-- =============================================================================
-- VENDLY — Schema SQL
-- Pegar completo en Supabase → SQL Editor → Run
--
-- ⚠️  Este script es destructivo: elimina y recrea todas las tablas.
--     Usarlo solo en instancias nuevas o para resetear completamente.
-- =============================================================================

-- Habilitar extensión para UUIDs
create extension if not exists "pgcrypto";

-- =============================================================================
-- 0. DROP (en orden inverso a las dependencias FK)
-- =============================================================================
drop table if exists abandoned_carts   cascade;
drop table if exists order_items       cascade;
drop table if exists orders            cascade;
drop table if exists customers         cascade;
drop table if exists coupons           cascade;
drop table if exists product_variants  cascade;
drop table if exists products          cascade;
drop table if exists categories        cascade;
drop table if exists store_config      cascade;

drop function if exists decrement_variant_stock(uuid, integer);
drop function if exists update_customer_totals();
drop function if exists set_updated_at();

-- =============================================================================
-- 1. STORE CONFIG
-- =============================================================================
create table if not exists store_config (
  id                      uuid primary key default gen_random_uuid(),
  name                    text not null,
  slug                    text not null unique,
  logo_url                text,
  favicon_url             text,

  -- Brand colours (hex, ej: #1a1a2e)
  color_primary           text not null default '#1a1a2e',
  color_secondary         text not null default '#16213e',
  color_accent            text not null default '#e94560',
  color_background        text not null default '#ffffff',
  color_text              text not null default '#1a1a2e',

  -- Hero
  hero_title              text not null default 'Bienvenidos a nuestra tienda',
  hero_subtitle           text,
  hero_cta_label          text not null default 'Ver productos',
  hero_cta_url            text not null default '/productos',
  hero_image_url          text,

  -- Shipping
  free_shipping_threshold numeric(10,2),
  shipping_base_price     numeric(10,2) not null default 0,

  -- Contact
  whatsapp_number         text,
  email                   text,
  instagram_url           text,

  -- SEO
  meta_title              text,
  meta_description        text,

  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Seed de ejemplo — reemplazar con los datos de tu tienda
insert into store_config (
  id, name, slug,
  color_primary, color_secondary, color_accent, color_background, color_text,
  hero_title, hero_subtitle, hero_cta_label, hero_cta_url,
  free_shipping_threshold, shipping_base_price,
  whatsapp_number, email,
  meta_title, meta_description
) values (
  gen_random_uuid(),
  'Mi Tienda',
  'mi-tienda',
  '#1a1a2e', '#16213e', '#e94560', '#ffffff', '#1a1a2e',
  '¡Bienvenidos!', 'Encontrá todo lo que necesitás', 'Ver productos', '/productos',
  50000, 3500,
  '5491100000000', 'hola@mitienda.com',
  'Mi Tienda', 'La mejor tienda online'
)
on conflict (slug) do nothing;

-- =============================================================================
-- 2. CATEGORIES
-- =============================================================================
create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  store_id    uuid not null references store_config(id) on delete cascade,
  name        text not null,
  slug        text not null,
  description text,
  image_url   text,
  position    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  unique(store_id, slug)
);

create index if not exists idx_categories_store on categories(store_id, is_active, position);

-- =============================================================================
-- 3. PRODUCTS
-- =============================================================================
create table if not exists products (
  id                uuid primary key default gen_random_uuid(),
  store_id          uuid not null references store_config(id) on delete cascade,
  category_id       uuid references categories(id) on delete set null,
  name              text not null,
  slug              text not null,
  description       text,
  price             numeric(10,2) not null,
  compare_at_price  numeric(10,2),
  images            text[] not null default '{}',
  is_active         boolean not null default true,
  is_featured       boolean not null default false,
  tags              text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique(store_id, slug)
);

create index if not exists idx_products_store        on products(store_id, is_active);
create index if not exists idx_products_featured     on products(store_id, is_featured) where is_featured = true;
create index if not exists idx_products_category     on products(category_id);
create index if not exists idx_products_search       on products using gin(to_tsvector('spanish', name));

-- =============================================================================
-- 4. PRODUCT VARIANTS
-- =============================================================================
create table if not exists product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references products(id) on delete cascade,
  -- JSON con atributos: { "talle": "M", "color": "Negro" }
  attributes     jsonb not null default '{}',
  sku            text,
  stock          integer not null default 0,
  price_override numeric(10,2),
  is_active      boolean not null default true
);

create index if not exists idx_variants_product on product_variants(product_id, is_active);

-- RPC para descontar stock de forma atómica
create or replace function decrement_variant_stock(variant_id uuid, qty integer)
returns void language plpgsql as $$
begin
  update product_variants
  set stock = greatest(0, stock - qty)
  where id = variant_id;
end;
$$;

-- =============================================================================
-- 5. COUPONS
-- =============================================================================
create table if not exists coupons (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references store_config(id) on delete cascade,
  code             text not null,
  type             text not null check (type in ('percentage', 'fixed')),
  value            numeric(10,2) not null,
  min_order_amount numeric(10,2),
  max_uses         integer,
  uses_count       integer not null default 0,
  expires_at       timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  unique(store_id, code)
);

-- =============================================================================
-- 6. CUSTOMERS
-- =============================================================================
create table if not exists customers (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references store_config(id) on delete cascade,
  email            text not null,
  full_name        text not null,
  phone            text,
  address_street   text,
  address_city     text,
  address_state    text,
  address_zip      text,
  address_country  text not null default 'Argentina',
  total_orders     integer not null default 0,
  total_spent      numeric(10,2) not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(store_id, email)
);

create index if not exists idx_customers_store on customers(store_id);
create index if not exists idx_customers_email on customers(store_id, email);

-- =============================================================================
-- 7. ORDERS
-- =============================================================================
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references store_config(id) on delete cascade,
  customer_id      uuid references customers(id) on delete set null,

  -- Snapshot del comprador
  buyer_name       text not null,
  buyer_email      text not null,
  buyer_phone      text,

  -- Dirección de envío (snapshot)
  shipping_street  text not null,
  shipping_city    text not null,
  shipping_state   text not null,
  shipping_zip     text not null,
  shipping_country text not null default 'Argentina',

  -- Totales
  subtotal         numeric(10,2) not null,
  discount_amount  numeric(10,2) not null default 0,
  shipping_amount  numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  coupon_code      text,

  -- Estado
  status           text not null default 'pending'
                   check (status in ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_status   text not null default 'pending'
                   check (payment_status in ('pending','approved','rejected','cancelled','refunded','in_process','in_mediation')),
  payment_method   text,

  -- MercadoPago
  mp_preference_id text,
  mp_payment_id    text,

  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_orders_store          on orders(store_id, created_at desc);
create index if not exists idx_orders_customer       on orders(customer_id);
create index if not exists idx_orders_payment_status on orders(store_id, payment_status);
create index if not exists idx_orders_mp_preference  on orders(mp_preference_id);

-- =============================================================================
-- 8. ORDER ITEMS
-- =============================================================================
create table if not exists order_items (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references orders(id) on delete cascade,
  product_id      uuid references products(id) on delete set null,
  variant_id      uuid references product_variants(id) on delete set null,
  -- Snapshots en el momento de la compra
  product_name    text not null,
  variant_label   text,
  product_image   text,
  quantity        integer not null,
  unit_price      numeric(10,2) not null,
  subtotal        numeric(10,2) not null
);

create index if not exists idx_order_items_order on order_items(order_id);

-- =============================================================================
-- 9. ABANDONED CARTS
-- =============================================================================
create table if not exists abandoned_carts (
  id               uuid primary key default gen_random_uuid(),
  store_id         uuid not null references store_config(id) on delete cascade,
  session_id       text not null,
  email            text,
  phone            text,
  buyer_name       text,
  -- Snapshot del carrito (array de CartItem)
  cart_data        jsonb not null default '[]',
  subtotal         numeric(10,2) not null default 0,

  -- Estado de recuperación
  recovered        boolean not null default false,
  recovery_token   uuid not null default gen_random_uuid(),

  -- Drip de email
  email_count      integer not null default 0,
  email_sent_at    timestamptz,

  -- Drip de WhatsApp
  whatsapp_count   integer not null default 0,
  whatsapp_sent_at timestamptz,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(session_id)
);

create index if not exists idx_abandoned_carts_store     on abandoned_carts(store_id, recovered, created_at);
create index if not exists idx_abandoned_carts_email     on abandoned_carts(store_id, email) where email is not null;
create index if not exists idx_abandoned_carts_recovery  on abandoned_carts(recovery_token);

-- =============================================================================
-- 10. TRIGGERS — updated_at automático
-- =============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger trg_store_config_updated_at
  before update on store_config
  for each row execute function set_updated_at();

create or replace trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

create or replace trigger trg_customers_updated_at
  before update on customers
  for each row execute function set_updated_at();

create or replace trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

create or replace trigger trg_abandoned_carts_updated_at
  before update on abandoned_carts
  for each row execute function set_updated_at();

-- =============================================================================
-- 11. TRIGGER — actualizar totales del cliente al aprobar orden
-- =============================================================================
create or replace function update_customer_totals()
returns trigger language plpgsql as $$
begin
  -- Solo actuar cuando payment_status pasa a 'approved'
  if new.payment_status = 'approved' and
     (old.payment_status is distinct from 'approved') and
     new.customer_id is not null then
    update customers
    set
      total_orders = total_orders + 1,
      total_spent  = total_spent + new.total,
      updated_at   = now()
    where id = new.customer_id;
  end if;
  return new;
end;
$$;

create or replace trigger trg_orders_customer_totals
  after update of payment_status on orders
  for each row execute function update_customer_totals();

-- =============================================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Habilitar RLS en tablas expuestas al anon key
alter table store_config       enable row level security;
alter table categories         enable row level security;
alter table products           enable row level security;
alter table product_variants   enable row level security;
alter table coupons            enable row level security;
alter table customers          enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table abandoned_carts    enable row level security;

-- Lectura pública (anon) para datos del catálogo
create policy "Public read store_config"
  on store_config for select using (true);

create policy "Public read categories"
  on categories for select using (is_active = true);

create policy "Public read products"
  on products for select using (is_active = true);

create policy "Public read product_variants"
  on product_variants for select using (is_active = true);

-- Cupones: solo validación (no listar todos)
create policy "Public read coupons"
  on coupons for select using (is_active = true);

-- Escritura pública para flujo de compra (se securitiza a nivel app con service_role)
create policy "Service role full access customers"
  on customers using (true) with check (true);

create policy "Service role full access orders"
  on orders using (true) with check (true);

create policy "Service role full access order_items"
  on order_items using (true) with check (true);

create policy "Service role full access abandoned_carts"
  on abandoned_carts using (true) with check (true);

-- =============================================================================
-- 13. SUPABASE STORAGE — bucket 'products'
-- =============================================================================
-- Ejecutar en SQL Editor (requiere permisos de storage):
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

create policy "Public read products bucket"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "Auth upload products bucket"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products');

create policy "Auth delete products bucket"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products');
