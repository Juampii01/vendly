-- ─── Monitor Incidents ────────────────────────────────────────────────────────
-- Correr en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS monitor_incidents (
  check_name      text PRIMARY KEY,
  label           text NOT NULL,
  category        text NOT NULL DEFAULT 'page',
  status          text NOT NULL DEFAULT 'unknown',   -- 'ok' | 'fail' | 'unknown'
  message         text,
  response_ms     integer,
  http_status     integer,
  fail_count      integer NOT NULL DEFAULT 0,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  last_ok_at      timestamptz,
  last_fail_at    timestamptz,
  last_alerted_at timestamptz
);

-- Solo el service role puede escribir
ALTER TABLE monitor_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON monitor_incidents
  FOR ALL USING (auth.role() = 'service_role');
