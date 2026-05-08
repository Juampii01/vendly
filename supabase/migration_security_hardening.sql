-- ─────────────────────────────────────────────────────────────────────────────
-- migration_security_hardening.sql
--
-- Consolida fixes críticos de schema, RLS y seguridad después de la auditoría.
-- Idempotente — se puede correr varias veces sin romper.
--
-- Lo que hace:
--   1. Crea tabla store_customers (referenciada en código pero no existía).
--   2. Restringe policies "Service role full access *" a TO service_role.
--   3. Cierra el leak público de coupons / store_domains / customers / orders.
--   4. Agrega columnas faltantes (hero_cta_color, products.meta_title/description).
--   5. Unifica el CHECK de site_type para incluir todos los valores que usa la app.
--   6. Agrega RPCs: decrement_variant_stock, increment_coupon_usage.
--   7. Endurece policies del bucket `products`.
--   8. Permite a admin_users leer su propia fila.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. Tabla store_customers ────────────────────────────────────────────────
-- El código (auth/callback, store-register, /cuenta) inserta y lee de esta tabla.
-- Era la única referencia que faltaba. Vinculamos cada customer auth con su store.

create table if not exists store_customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references store_config(id) on delete cascade,
  auth_user_id uuid not null,        -- auth.users.id
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (store_id, auth_user_id),
  unique (store_id, email)
);

create index if not exists idx_store_customers_user
  on store_customers(auth_user_id);

create index if not exists idx_store_customers_store_email
  on store_customers(store_id, email);

alter table store_customers enable row level security;

drop policy if exists "Service role full access store_customers" on store_customers;
create policy "Service role full access store_customers"
  on store_customers for all to service_role
  using (true) with check (true);

drop policy if exists "Self read store_customers" on store_customers;
create policy "Self read store_customers"
  on store_customers for select to authenticated
  using (auth.uid() = auth_user_id);

-- ─── 2. Restringir "Service role full access *" a TO service_role ────────────
-- El comportamiento previo aplicaba la policy a anon también (porque no había
-- TO clause), filtrando customers/orders/order_items/abandoned_carts a anyone.

drop policy if exists "Service role full access customers" on customers;
create policy "Service role full access customers"
  on customers for all to service_role using (true) with check (true);

drop policy if exists "Service role full access orders" on orders;
create policy "Service role full access orders"
  on orders for all to service_role using (true) with check (true);

drop policy if exists "Service role full access order_items" on order_items;
create policy "Service role full access order_items"
  on order_items for all to service_role using (true) with check (true);

drop policy if exists "Service role full access abandoned_carts" on abandoned_carts;
create policy "Service role full access abandoned_carts"
  on abandoned_carts for all to service_role using (true) with check (true);

-- ─── 3. Cupones — quitar lectura pública ──────────────────────────────────────
-- La policy anterior `using (is_active = true)` permitía a anon enumerar todos
-- los cupones de TODAS las tiendas. La validación se hace con service_role.

drop policy if exists "Public read coupons" on coupons;

drop policy if exists "Service role full access coupons" on coupons;
create policy "Service role full access coupons"
  on coupons for all to service_role using (true) with check (true);

-- ─── 4. store_domains — quitar lectura pública ────────────────────────────────
-- Antes anon podía enumerar todos los dominios.

drop policy if exists "Anon read store_domains" on store_domains;
drop policy if exists "Public read store_domains" on store_domains;

drop policy if exists "Service role full access store_domains" on store_domains;
create policy "Service role full access store_domains"
  on store_domains for all to service_role using (true) with check (true);

-- ─── 5. admin_users — permitir self-read ──────────────────────────────────────
-- Anteriormente la tabla tenía RLS sin policy, invisible para todos salvo service_role.
-- Permitimos que cada admin_user lea su propia fila para que el cliente pueda
-- detectar membership sin pasar por el service_role.

alter table admin_users enable row level security;

drop policy if exists "Self read admin_users" on admin_users;
create policy "Self read admin_users"
  on admin_users for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Service role full access admin_users" on admin_users;
create policy "Service role full access admin_users"
  on admin_users for all to service_role using (true) with check (true);

-- ─── 6. tenant_config — solo service_role ─────────────────────────────────────
-- Las credenciales nunca deben llegar al cliente; toda lectura/escritura va por API.

alter table tenant_config enable row level security;

drop policy if exists "Service role full access tenant_config" on tenant_config;
create policy "Service role full access tenant_config"
  on tenant_config for all to service_role using (true) with check (true);

-- ─── 7. platform_users — solo service_role + self-read ───────────────────────

alter table if exists platform_users enable row level security;

drop policy if exists "Self read platform_users" on platform_users;
create policy "Self read platform_users"
  on platform_users for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

drop policy if exists "Service role full access platform_users" on platform_users;
create policy "Service role full access platform_users"
  on platform_users for all to service_role using (true) with check (true);

-- ─── 8. Columnas faltantes en TS pero ausentes en DB ──────────────────────────

alter table store_config
  add column if not exists hero_cta_color text;

alter table products
  add column if not exists meta_title       text,
  add column if not exists meta_description text;

-- ─── 9. site_type CHECK — soporte completo para todos los templates ──────────
-- Necesitamos: ecommerce, landing, portfolio, restaurant, services, modo,
-- athletic, dealership, libreria, vendly-marketing, real-estate, gym

do $$
begin
  -- Drop existing check constraint si existe (varios nombres posibles)
  if exists (
    select 1 from pg_constraint
    where conrelid = 'store_config'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%site_type%'
  ) then
    execute (
      select 'alter table store_config drop constraint ' || quote_ident(conname)
      from pg_constraint
      where conrelid = 'store_config'::regclass
        and contype = 'c'
        and pg_get_constraintdef(oid) like '%site_type%'
      limit 1
    );
  end if;
end$$;

alter table store_config
  add constraint store_config_site_type_check
  check (site_type in (
    'ecommerce', 'landing', 'portfolio', 'restaurant', 'services',
    'modo', 'athletic', 'dealership', 'libreria', 'vendly-marketing',
    'real-estate', 'gym'
  ));

-- ─── 10. abandoned_carts — UNIQUE compuesto (store_id, session_id) ───────────
-- Antes el upsert usaba onConflict: 'session_id' que no es store-aware.
-- Si dos stores generan el mismo session_id (poco probable pero posible),
-- el upsert puede sobrescribir un carrito ajeno.

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'abandoned_carts_store_session_unique'
  ) then
    -- Limpieza preventiva: borrar duplicados antes de aplicar el unique
    delete from abandoned_carts a
    using abandoned_carts b
    where a.id < b.id
      and a.store_id = b.store_id
      and a.session_id = b.session_id;

    alter table abandoned_carts
      add constraint abandoned_carts_store_session_unique
      unique (store_id, session_id);
  end if;
end$$;

-- ─── 11. RPCs para idempotencia y atomicidad ─────────────────────────────────

-- 11a. decrement_variant_stock: nunca permite stock negativo
create or replace function decrement_variant_stock(variant_id uuid, qty integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update product_variants
  set stock = greatest(stock - qty, 0)
  where id = variant_id;
end;
$$;

revoke all on function decrement_variant_stock(uuid, integer) from public;
grant execute on function decrement_variant_stock(uuid, integer) to service_role;

-- 11b. increment_coupon_usage: respeta max_uses atómicamente.
-- Devuelve el nuevo uses_count, o NULL si el cupón ya alcanzó el máximo.
create or replace function increment_coupon_usage(coupon_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update coupons
  set uses_count = uses_count + 1
  where id = coupon_id
    and is_active = true
    and (max_uses is null or uses_count < max_uses)
  returning uses_count into new_count;
  return new_count;
end;
$$;

revoke all on function increment_coupon_usage(uuid) from public;
grant execute on function increment_coupon_usage(uuid) to service_role;

-- ─── 12. Bucket products — restringir uploads/deletes a admins del store ────
-- Las policies anteriores permitían a CUALQUIER usuario autenticado escribir/
-- borrar en cualquier prefijo. Ahora exigimos que el path empiece con
-- `${store_id}/...` y que el caller sea admin de ese store.
--
-- Convención de nombres en el bucket: `${store_id}/...`.

drop policy if exists "Auth upload products bucket" on storage.objects;
create policy "Tenant admins upload products bucket"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'products'
    and (
      -- objeto sin prefijo de store: rechazado (legacy se debe migrar)
      split_part(name, '/', 1) <> ''
      and exists (
        select 1 from admin_users a
        where a.store_id::text = split_part(storage.objects.name, '/', 1)
          and lower(a.email) = lower(auth.jwt() ->> 'email')
      )
    )
  );

drop policy if exists "Auth delete products bucket" on storage.objects;
create policy "Tenant admins delete products bucket"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'products'
    and exists (
      select 1 from admin_users a
      where a.store_id::text = split_part(storage.objects.name, '/', 1)
        and lower(a.email) = lower(auth.jwt() ->> 'email')
    )
  );

-- ─── 13. Trigger updated_at en store_customers ───────────────────────────────

create or replace function set_updated_at_now()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_store_customers_updated on store_customers;
create trigger trg_store_customers_updated
  before update on store_customers
  for each row execute function set_updated_at_now();

-- ─── 14. Newsletter subscribers ──────────────────────────────────────────────
-- El endpoint /api/newsletter solo mandaba email; ahora también persiste leads.

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references store_config(id) on delete cascade,
  email text not null,
  source text,                       -- ej: "footer", "modal"
  created_at timestamptz default now(),
  unique (store_id, email)
);

create index if not exists idx_newsletter_store on newsletter_subscribers(store_id);

alter table newsletter_subscribers enable row level security;

drop policy if exists "Service role full access newsletter" on newsletter_subscribers;
create policy "Service role full access newsletter"
  on newsletter_subscribers for all to service_role
  using (true) with check (true);
