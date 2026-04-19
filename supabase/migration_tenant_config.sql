-- =============================================================================
-- VENDLY — Migración: currency/locale + tenant_config
-- Correr en Supabase → SQL Editor → Run
-- =============================================================================

-- ─── 1. currency + locale en store_config ────────────────────────────────────
--
-- Permiten que cada store tenga su propio formato de moneda y localización.
-- formatPrice() toma estos valores en lugar de los hardcodeados 'ARS' / 'es-AR'.
--
ALTER TABLE store_config
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'ARS',
  ADD COLUMN IF NOT EXISTS locale   TEXT NOT NULL DEFAULT 'es-AR';

COMMENT ON COLUMN store_config.currency IS
  'Código de moneda ISO 4217 (ej: ARS, USD, EUR). Usado en formatPrice().';
COMMENT ON COLUMN store_config.locale IS
  'Locale BCP 47 para formateo de números (ej: es-AR, en-US). Usado en formatPrice().';

-- ─── 2. tenant_config — credenciales de infraestructura por store ─────────────
--
-- Desacopla la configuración de integraciones (claves de APIs de pago, email,
-- notificaciones) del store_config que es de presentación/negocio.
--
-- Patrón de uso:
--   - Si la columna es NULL → usar variable de entorno global (env var)
--   - Si tiene valor → usar la credencial del store (multi-tenant real)
--
-- Esto permite migrar gradualmente: empieza todo con env vars, y a medida
-- que cada store configura sus propias claves, deja de depender del entorno global.
--
CREATE TABLE IF NOT EXISTS tenant_config (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id  UUID NOT NULL UNIQUE REFERENCES store_config(id) ON DELETE CASCADE,

  -- MercadoPago
  mp_access_token    TEXT,   -- MP_ACCESS_TOKEN
  mp_public_key      TEXT,   -- MP_PUBLIC_KEY (usado en frontend)
  mp_webhook_secret  TEXT,   -- MP_WEBHOOK_SECRET

  -- Resend (email transaccional)
  resend_api_key     TEXT,   -- RESEND_API_KEY
  resend_from_domain TEXT,   -- RESEND_FROM_DOMAIN (ej: "Tienda <no-reply@tienda.com>")

  -- WhatsApp 360dialog
  wa_api_key         TEXT,   -- WHATSAPP_360DIALOG_API_KEY
  wa_from_number     TEXT,   -- WHATSAPP_FROM_NUMBER

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: solo service_role puede leer/escribir (son credenciales sensibles)
ALTER TABLE tenant_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_tenant_config"
  ON tenant_config FOR ALL
  TO service_role
  USING (true);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_config_updated_at
  BEFORE UPDATE ON tenant_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE tenant_config IS
  'Credenciales de infraestructura por store. '
  'NULL en cualquier campo = usar la variable de entorno global como fallback. '
  'Permite migración gradual de single-tenant a multi-tenant real.';
