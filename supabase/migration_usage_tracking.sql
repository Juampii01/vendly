-- ════════════════════════════════════════════════════════════════════════════
-- migration_usage_tracking.sql — Foundation para plan limits + billing
-- ════════════════════════════════════════════════════════════════════════════
--
-- Problema:
--   Los `plan` (free/starter/pro/enterprise) en store_config son strings sin
--   enforcement. Cualquier store puede usar IA infinita, mandar emails sin
--   límite, etc. Para que el modelo de negocio cierre, necesitamos límites.
--
-- Solución:
--   Tabla de tracking por (store_id, periodo, key) con un RPC atómico para
--   incrementar. lib/plan-limits.ts define los límites por plan y consulta
--   esta tabla. Los API endpoints que consumen recursos (IA, emails) llaman
--   a check + track antes de procesar.
--
-- Esta es INFRA. El charging real (Stripe/MP suscripciones) se conecta arriba
-- después. Cuando billing land, esta tabla ya está reportando uso y los
-- enforcement points ya están en su lugar.

-- ─── usage_tracking ────────────────────────────────────────────────────────
-- Una fila por (store, periodo, métrica). period = 'YYYYMM' (e.g. '202605').
-- Mantenerlo numeric+sortable para queries por rango.
CREATE TABLE IF NOT EXISTS usage_tracking (
  store_id    uuid    NOT NULL REFERENCES store_config(id) ON DELETE CASCADE,
  period      text    NOT NULL CHECK (period ~ '^[0-9]{6}$'),
  key         text    NOT NULL,
  count       integer NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (store_id, period, key)
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period);

-- RLS: solo service_role puede leer/escribir. Los API endpoints siempre
-- usan service_role para tracking, y el admin-facing read va via API
-- protegida por requireStoreAdmin (que ya filtra por storeId del session).
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running migration
DROP POLICY IF EXISTS "service_role_all" ON usage_tracking;

CREATE POLICY "service_role_all" ON usage_tracking
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ─── increment_usage RPC (atomic) ──────────────────────────────────────────
-- Atomic UPSERT que incrementa o crea la fila. Devuelve el nuevo count para
-- que el caller pueda detectar overshoot inmediato.
--
-- Uso desde la app:
--   const { data, error } = await supabase.rpc('increment_usage', {
--     p_store_id: storeId, p_period: '202605', p_key: 'ai_generate', p_delta: 1
--   })
--
-- La función SECURITY DEFINER permite que cualquiera con permiso de execute
-- pueda llamarla — pero solo service_role tiene grant por default. No exponer
-- a anon/authenticated.
CREATE OR REPLACE FUNCTION increment_usage(
  p_store_id uuid,
  p_period   text,
  p_key      text,
  p_delta    integer DEFAULT 1
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  -- Validate period format
  IF p_period !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'period debe ser YYYYMM, recibido: %', p_period;
  END IF;
  IF p_delta < 0 THEN
    RAISE EXCEPTION 'delta no puede ser negativo';
  END IF;

  INSERT INTO usage_tracking (store_id, period, key, count, updated_at)
  VALUES (p_store_id, p_period, p_key, p_delta, now())
  ON CONFLICT (store_id, period, key) DO UPDATE
    SET count = usage_tracking.count + p_delta,
        updated_at = now()
  RETURNING count INTO v_new_count;

  RETURN v_new_count;
END;
$$;

-- Revoke from public (si el deploy anterior lo tenía abierto), grant solo a service_role
REVOKE ALL ON FUNCTION increment_usage(uuid, text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text, text, integer) TO service_role;

-- ─── Comments ──────────────────────────────────────────────────────────────
COMMENT ON TABLE usage_tracking IS
  'Tracking de uso por store por mes por métrica. Foundation de plan limits + billing. Se popula via RPC increment_usage() desde lib/plan-limits.ts.';

COMMENT ON COLUMN usage_tracking.period IS
  'Período en formato YYYYMM (ej: 202605). Permite queries por rango con ORDER BY.';

COMMENT ON COLUMN usage_tracking.key IS
  'Métrica trackeada. Convenciones: ai_generate, ai_design, ai_content, email_sent, whatsapp_sent. Mantener en sync con lib/plan-limits.ts → USAGE_KEYS.';
