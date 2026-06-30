// Anzeigeeinstellungen für Deutschland (CET/CEST)
export const LOCALE = "de-DE";
export const TIME_ZONE = "Europe/Berlin";

export const HISTORY_LIMIT = 20;

export const DATE_OPTIONS = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: TIME_ZONE
};

export function parseToLocalDate(value) {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  const dateString = String(value).trim();

  // ISO-Zeichenkette mit Zeitzone (Z oder ±hh:mm)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(dateString)) {
    return new Date(dateString);
  }

  // PostgreSQL-Zeitstempel ohne Zeitzone: "2026-06-29 14:30:00"
  const pgMatch = dateString.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/
  );
  if (pgMatch) {
    // Werte wurden als UTC-ISO ohne Zeitzonenangabe gespeichert
    return new Date(`${pgMatch[1]}T${pgMatch[2]}Z`);
  }

  return new Date(dateString);
}

export function formatLocalDate(value, options = DATE_OPTIONS) {
  const dateObj = parseToLocalDate(value);

  if (Number.isNaN(dateObj.getTime())) {
    return String(value);
  }

  return dateObj.toLocaleString(LOCALE, options);
}

export function formatNow(options = DATE_OPTIONS) {
  return new Date().toLocaleString(LOCALE, options);
}
