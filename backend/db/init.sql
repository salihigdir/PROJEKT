-- Legacy table replaced by puls_log
DROP TABLE IF EXISTS printer_statuses;

CREATE TABLE IF NOT EXISTS puls_log (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'INFO',
  event_type TEXT NOT NULL,
  printer_name TEXT,
  printer_ip TEXT,
  printer_location TEXT,
  online BOOLEAN,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate legacy TIMESTAMP column to TIMESTAMPTZ (UTC storage)
ALTER TABLE puls_log
  ALTER COLUMN checked_at TYPE TIMESTAMPTZ
  USING checked_at AT TIME ZONE 'UTC';

CREATE INDEX IF NOT EXISTS idx_puls_log_ip_checked
  ON puls_log (printer_ip, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_puls_log_event_type
  ON puls_log (event_type, checked_at DESC);
