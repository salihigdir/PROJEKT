-- u_logdate und u_logtime aus checked_at (Europe/Berlin) neu berechnen
UPDATE puls_log
SET
  u_logdate = (checked_at AT TIME ZONE 'Europe/Berlin')::date,
  u_logtime = to_char(checked_at AT TIME ZONE 'Europe/Berlin', 'HH24:MI:SS')
WHERE checked_at IS NOT NULL;
