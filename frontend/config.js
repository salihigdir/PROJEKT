// Display settings for Germany (CET/CEST, UTC+1 / UTC+2)
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

  // ISO string with timezone (Z or ±hh:mm)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(dateString)) {
    return new Date(dateString);
  }

  // PostgreSQL naive timestamp: "2026-06-29 14:30:00"
  const pgMatch = dateString.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)$/
  );
  if (pgMatch) {
    // Values were stored from UTC ISO strings without timezone info
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
