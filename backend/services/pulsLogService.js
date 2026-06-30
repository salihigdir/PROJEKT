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

function getGermanDateParts(dateInput) {
  const date = new Date(dateInput);

  const berlinDate = date.toLocaleDateString("en-CA", {
    timeZone: "Europe/Berlin"
  });

  const berlinTime = date.toLocaleTimeString("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  return {
    logDate: berlinDate,
    logTime: berlinTime
  };
}

function buildPulsRefKey(entry) {
  if (entry.u_refkey) {
    return String(entry.u_refkey).slice(0, 50);
  }

  if (entry.printer_ip) {
    return `PRINTER-CHECK|${entry.printer_ip}`.slice(0, 50);
  }

  return "PRINTER-CHECK|ALL_PRINTERS";
}

function mapEventToPulsEvent(eventType) {
  if (eventType === "summary") {
    return "PRINTER_STATUS";
  }

  if (eventType === "printer_status") {
    return "PRINTER_STATUS";
  }

  if (eventType === "offline") {
    return "PRINTER_OFFLINE";
  }

  return "PRINTER_CHECK";
}

function buildPulsDetail(entry) {
  const details = [];

  if (entry.printer_name) {
    details.push(`name=${entry.printer_name}`);
  }

  if (entry.printer_ip) {
    details.push(`ip=${entry.printer_ip}`);
  }

  if (entry.printer_location) {
    details.push(`location=${entry.printer_location}`);
  }

  if (entry.online !== undefined && entry.online !== null) {
    details.push(`online=${entry.online ? 1 : 0}`);
    details.push(`status=${entry.online ? "ONLINE" : "OFFLINE"}`);
  }

  if (entry.total !== undefined) {
    details.push(`total=${entry.total}`);
  }

  if (entry.onlineCount !== undefined) {
    details.push(`onlineCount=${entry.onlineCount}`);
  }

  if (entry.offlineCount !== undefined) {
    details.push(`offlineCount=${entry.offlineCount}`);
  }

  return details.join(";").slice(0, 254);
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
  const checkedAt = new Date(entry.checked_at);
  const { logDate, logTime } = getGermanDateParts(checkedAt);

  const uSource = "PRINTER-CHECK";
  const uLevel = entry.level || "INFO";
  const uEvent = mapEventToPulsEvent(entry.event_type);
  const uOrderNum = null;
  const uRefKey = buildPulsRefKey(entry);
  const uMessage = entry.message.slice(0, 254);
  const uDetail = buildPulsDetail(entry);

  await query(
    `INSERT INTO puls_log (
      message,
      level,
      event_type,
      printer_name,
      printer_ip,
      printer_location,
      online,
      checked_at,

      u_source,
      u_level,
      u_event,
      u_logdate,
      u_logtime,
      u_ordernum,
      u_refkey,
      u_message,
      u_detail
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15, $16, $17
    )`,
    [
      entry.message,
      entry.level,
      entry.event_type,
      entry.printer_name || null,
      entry.printer_ip || null,
      entry.printer_location || null,
      entry.online ?? null,
      checkedAt,

      uSource,
      uLevel,
      uEvent,
      logDate,
      logTime,
      uOrderNum,
      uRefKey,
      uMessage,
      uDetail
    ]
  );
}

async function writePulsLogs(results) {
  const onlineCount = results.filter((printer) => printer.online).length;
  const total = results.length;
  const offlineCount = total - onlineCount;
  const checkedAt = results[0]?.checkedAt || new Date().toISOString();

  const summaryMessage =
    onlineCount === total
      ? `${total} von ${total} Druckern sind online.`
      : `${onlineCount} von ${total} Druckern sind online. ${offlineCount} Drucker offline.`;

  await insertLogEntry({
    message: summaryMessage,
    level: onlineCount === total ? "INFO" : "WARNING",
    event_type: "summary",
    checked_at: checkedAt,
    u_refkey: "PRINTER-CHECK|ALL_PRINTERS",
    total,
    onlineCount,
    offlineCount
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
    offlineCount,
    logs
  };
}

module.exports = {
  writePulsLogs,
  formatLogDate
};