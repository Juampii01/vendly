-- ─────────────────────────────────────────────────────────────────────────────
-- migration_store_customers_patch.sql
--
-- Patch idempotente para `store_customers`. La migration original tenía
-- `create table if not exists` que NO modifica la tabla si ya existe — esto
-- dejaba la columna `phone` y el constraint UNIQUE(auth_user_id) sin aplicar
-- en deploys donde la tabla había sido creada antes con schema viejo.
--
-- Este script usa ALTER TABLE explícito y se puede correr varias veces sin
-- romper.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Agregar columnas opcionales si faltan
alter table store_customers
  add column if not exists phone text,
  add column if not exists full_name text,
  add column if not exists updated_at timestamptz default now();

-- 2. Trigger updated_at (sólo si la función existe — viene de
-- migration_security_hardening). Si no existe la creamos.
create or replace function set_updated_at_now()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists trg_store_customers_updated on store_customers;
create trigger trg_store_customers_updated
  before update on store_customers
  for each row execute function set_updated_at_now();

-- 3. UNIQUE(auth_user_id) standalone — un auth.users pertenece a UN solo store.
-- Si Juan se registra en Adidas, ese auth_user_id NO se puede reusar para Nike;
-- Nike crea uno nuevo con email interno distinto.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'store_customers_auth_user_id_unique'
  ) then
    -- Limpieza preventiva: si por algún error hay duplicados, dejamos solo
    -- el más reciente.
    delete from store_customers a
    using store_customers b
    where a.id < b.id and a.auth_user_id = b.auth_user_id;

    alter table store_customers
      add constraint store_customers_auth_user_id_unique unique (auth_user_id);
  end if;
end$$;

-- 4. NOT NULL en auth_user_id (por si quedó nullable)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'store_customers'
      and column_name = 'auth_user_id'
      and is_nullable = 'YES'
  ) then
    update store_customers set auth_user_id = gen_random_uuid()
      where auth_user_id is null;
    alter table store_customers
      alter column auth_user_id set not null;
  end if;
end$$;

-- 5. Verificación rápida (output via NOTICE)
do $$
declare
  has_phone boolean;
  has_unique_auth boolean;
begin
  select exists (
    select 1 from information_schema.columns
    where table_name = 'store_customers' and column_name = 'phone'
  ) into has_phone;
  select exists (
    select 1 from pg_constraint where conname = 'store_customers_auth_user_id_unique'
  ) into has_unique_auth;
  raise notice 'phone column: %', has_phone;
  raise notice 'UNIQUE(auth_user_id): %', has_unique_auth;
end$$;
