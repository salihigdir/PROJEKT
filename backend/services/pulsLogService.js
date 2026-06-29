const { query } = require("../db/db");

function formatLogDate(date) {
  return new Date(date).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function getLastOnlineTime(ip, beforeTime) {
  const result = await query(
    `SELECT checked_at
     FROM puls_log
     WHERE printer_ip = $1
       AND online = true
       AND event_type = 'printer_status'
       AND checked_at < $2
     ORDER BY checked_at DESC
     LIMIT 1`,
    [ip, beforeTime]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0].checked_at;
}

async function insertLogEntry(entry) {
  await query(
    `INSERT INTO puls_log (
      message, level, event_type,
      printer_name, printer_ip, printer_location,
      online, checked_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      entry.message,
      entry.level,
      entry.event_type,
      entry.printer_name || null,
      entry.printer_ip || null,
      entry.printer_location || null,
      entry.online ?? null,
      new Date(entry.checked_at)
    ]
  );
}

async function writePulsLogs(results) {
  const onlineCount = results.filter((printer) => printer.online).length;
  const total = results.length;
  const checkedAt = results[0]?.checkedAt || new Date().toISOString();

  const summaryMessage =
    onlineCount === total
      ? `${total} Drucker, alle online.`
      : `${onlineCount} von ${total} Druckern online.`;

  await insertLogEntry({
    message: summaryMessage,
    level: onlineCount === total ? "INFO" : "WARNING",
    event_type: "summary",
    checked_at: checkedAt
  });

  const logs = [
    {
      message: summaryMessage,
      level: onlineCount === total ? "INFO" : "WARNING",
      event_type: "summary"
    }
  ];

  for (const printer of results) {
    const statusMessage = `${printer.name} (${printer.location}): ${printer.status}`;

    await insertLogEntry({
      message: statusMessage,
      level: printer.online ? "INFO" : "WARNING",
      event_type: "printer_status",
      printer_name: printer.name,
      printer_ip: printer.ip,
      printer_location: printer.location,
      online: printer.online,
      checked_at: printer.checkedAt
    });

    if (!printer.online) {
      const lastOnline = await getLastOnlineTime(printer.ip, printer.checkedAt);
      const lastOnlineText = lastOnline
        ? formatLogDate(lastOnline)
        : "unbekannt";

      const offlineMessage = `Drucker mit IP ${printer.ip} (${printer.location}) offline. Zuletzt online: ${lastOnlineText}.`;

      await insertLogEntry({
        message: offlineMessage,
        level: "WARNING",
        event_type: "offline",
        printer_name: printer.name,
        printer_ip: printer.ip,
        printer_location: printer.location,
        online: false,
        checked_at: printer.checkedAt
      });

      logs.push({
        message: offlineMessage,
        level: "WARNING",
        event_type: "offline",
        printer_ip: printer.ip
      });
    }
  }

  return {
    summary: summaryMessage,
    onlineCount,
    total,
    offlineCount: total - onlineCount,
    logs
  };
}

module.exports = {
  writePulsLogs,
  formatLogDate
};
