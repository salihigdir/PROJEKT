-- Alte Tabelle durch puls_log ersetzt
DROP TABLE IF EXISTS printer_statuses;

CREATE TABLE IF NOT EXISTS puls_log (
  id SERIAL PRIMARY KEY,

  -- Alte lokale Felder für Dashboard / History
  message TEXT,
  level TEXT NOT NULL DEFAULT 'INFO',
  event_type TEXT,
  printer_name TEXT,
  printer_ip TEXT,
  printer_location TEXT,
  online BOOLEAN,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- PULS_LOG-Felder nach Vorgabe
  u_source VARCHAR(30),
  u_level VARCHAR(10),
  u_event VARCHAR(20),
  u_logdate DATE,
  u_logtime VARCHAR(8),
  u_ordernum VARCHAR(20),
  u_refkey VARCHAR(50),
  u_message VARCHAR(254),
  u_detail VARCHAR(254)
);

-- Falls die Tabelle schon mit der alten Struktur existiert,
-- werden die neuen PULS-Felder nachträglich ergänzt.
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_source VARCHAR(30);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_level VARCHAR(10);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_event VARCHAR(20);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_logdate DATE;
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_logtime VARCHAR(8);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_ordernum VARCHAR(20);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_refkey VARCHAR(50);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_message VARCHAR(254);
ALTER TABLE puls_log ADD COLUMN IF NOT EXISTS u_detail VARCHAR(254);

-- Alte Indizes für Dashboard / History
CREATE INDEX IF NOT EXISTS idx_puls_log_ip_checked
  ON puls_log (printer_ip, checked_at DESC);

CREATE INDEX IF NOT EXISTS idx_puls_log_event_type
  ON puls_log (event_type, checked_at DESC);

-- Neue Indizes für PULS_LOG-Struktur
CREATE INDEX IF NOT EXISTS idx_puls_log_refkey_date_time
  ON puls_log (u_refkey, u_logdate DESC, u_logtime DESC);

CREATE INDEX IF NOT EXISTS idx_puls_log_event_date_time
  ON puls_log (u_event, u_logdate DESC, u_logtime DESC);

CREATE INDEX IF NOT EXISTS idx_puls_log_level_date_time
  ON puls_log (u_level, u_logdate DESC, u_logtime DESC);