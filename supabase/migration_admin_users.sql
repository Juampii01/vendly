-- Tabla de usuarios administradores por tienda
CREATE TABLE IF NOT EXISTS admin_users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id    UUID        NOT NULL REFERENCES store_config(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'admin'
                          CHECK (role IN ('owner', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (store_id, email)
);

-- Solo el service_role puede leer/escribir (admin API usa service_role)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- No hay políticas públicas — todo acceso es via service_role desde el servidor

-- ─── Para bootstrappear el primer owner ───────────────────────────────────────
-- Reemplazá 'TU_STORE_ID' y 'tu@email.com' con los valores reales y ejecutá esto
-- en el SQL Editor de Supabase:
--
-- INSERT INTO admin_users (store_id, email, role)
-- VALUES ('TU_STORE_ID', 'tu@email.com', 'owner')
-- ON CONFLICT (store_id, email) DO NOTHING;
