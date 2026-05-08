-- ─────────────────────────────────────────────────────────────────────────────
-- migration_tenant_isolated_auth.sql
--
-- Aisla los usuarios por tienda. Un email real puede repetirse entre stores,
-- pero cada (store_id, email) crea un auth.users distinto con un email
-- "interno" opaco. La tabla store_customers traduce email real ↔ auth_user_id.
--
-- Idempotente — se puede correr varias veces sin romper.
-- Pre-requisito: migration_security_hardening.sql (que crea store_customers
-- con auth_user_id, store_id, email, full_name, phone y UNIQUE(store_id, email)).
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── 1. NOT NULL en auth_user_id ──────────────────────────────────────────────
-- Antes podía ser null para perfiles "huérfanos"; ya no lo permitimos.
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

-- ─── 2. UNIQUE(auth_user_id) ──────────────────────────────────────────────────
-- Cada auth.users pertenece a UN solo store. Si Juan se registra en Adidas,
-- el auth_user creado para "juan en Adidas" no se reusa para Nike — Nike
-- crea uno NUEVO con email interno distinto.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'store_customers_auth_user_id_unique'
  ) then
    -- Limpieza preventiva de duplicados antes del constraint
    delete from store_customers a using store_customers b
      where a.id < b.id and a.auth_user_id = b.auth_user_id;

    alter table store_customers
      add constraint store_customers_auth_user_id_unique unique (auth_user_id);
  end if;
end$$;

-- ─── 3. Marcador de email "real" vs "interno" ─────────────────────────────────
-- En auth.users guardamos un email opaco (ej: t-{storeShortId}-{token}@vendly.internal).
-- En store_customers.email guardamos el email REAL del usuario.
-- Esta función ayuda a distinguir si un email es interno (no se debe mostrar al usuario).
create or replace function is_internal_tenant_email(email text)
returns boolean
language sql immutable as $$
  select email like 't-%-%@vendly.internal';
$$;

-- ─── 4. Índice de lookup email→user ──────────────────────────────────────────
-- Endpoint de login hace 50% del trabajo en este index.
create index if not exists idx_store_customers_login_lookup
  on store_customers(store_id, lower(email));

-- ─── 5. Tabla auxiliar para tokens de password reset ──────────────────────────
-- Como no usamos el flujo nativo de Supabase password reset (porque mandaría email
-- al email interno opaco, no al real), implementamos uno propio.
create table if not exists store_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references store_config(id) on delete cascade,
  auth_user_id uuid not null,
  token_hash text not null,           -- SHA-256 del token, nunca el plaintext
  expires_at timestamptz not null,
  used_at timestamptz,                 -- null = aún no usado
  created_at timestamptz default now()
);

create index if not exists idx_password_reset_tokens_lookup
  on store_password_reset_tokens(token_hash) where used_at is null;

create index if not exists idx_password_reset_tokens_cleanup
  on store_password_reset_tokens(expires_at);

alter table store_password_reset_tokens enable row level security;

drop policy if exists "Service role full access password_reset_tokens" on store_password_reset_tokens;
create policy "Service role full access password_reset_tokens"
  on store_password_reset_tokens for all to service_role
  using (true) with check (true);

-- ─── 6. Cleanup function para tokens expirados ────────────────────────────────
create or replace function cleanup_expired_reset_tokens()
returns void
language sql security definer as $$
  delete from store_password_reset_tokens
    where expires_at < now() - interval '7 days'
       or (used_at is not null and used_at < now() - interval '7 days');
$$;
revoke all on function cleanup_expired_reset_tokens() from public;
grant execute on function cleanup_expired_reset_tokens() to service_role;
