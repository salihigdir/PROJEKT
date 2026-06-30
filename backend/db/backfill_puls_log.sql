UPDATE puls_log
SET
  u_source = COALESCE(u_source, 'PRINTER-CHECK'),
  u_level = COALESCE(u_level, level),
  u_event = COALESCE(u_event,
    CASE event_type
      WHEN 'offline' THEN 'PRINTER_OFFLINE'
      WHEN 'summary' THEN 'PRINTER_STATUS'
      WHEN 'printer_status' THEN 'PRINTER_STATUS'
      ELSE 'PRINTER_CHECK'
    END
  ),
  u_logdate = COALESCE(u_logdate, (checked_at AT TIME ZONE 'Europe/Berlin')::date),
  u_logtime = COALESCE(u_logtime, to_char(checked_at AT TIME ZONE 'Europe/Berlin', 'HH24:MI:SS')),
  u_refkey = COALESCE(u_refkey,
    CASE
      WHEN printer_ip IS NOT NULL THEN 'PRINTER-CHECK|' || printer_ip
      ELSE 'PRINTER-CHECK|ALL_PRINTERS'
    END
  ),
  u_message = COALESCE(u_message, LEFT(message, 254)),
  u_detail = COALESCE(u_detail,
    LEFT(
      CONCAT_WS(';',
        CASE WHEN printer_name IS NOT NULL THEN 'name=' || printer_name END,
        CASE WHEN printer_ip IS NOT NULL THEN 'ip=' || printer_ip END,
        CASE WHEN printer_location IS NOT NULL THEN 'location=' || printer_location END,
        CASE WHEN online IS NOT NULL THEN 'online=' || CASE WHEN online THEN '1' ELSE '0' END END,
        CASE WHEN online IS NOT NULL THEN 'status=' || CASE WHEN online THEN 'ONLINE' ELSE 'OFFLINE' END END
      ),
      254
    )
  )
WHERE u_message IS NULL
  AND message IS NOT NULL;
