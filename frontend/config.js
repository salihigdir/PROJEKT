// Frontend configuration constants
export const HISTORY_LIMIT = 20; // default number of history records to show per printer

// Date display options (used with toLocaleString)
export const DATE_OPTIONS = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
};

export function parseToLocalDate(value) {
  if (!value) {
    return new Date();
  }

  let dateString = value;
  if (typeof value !== 'string') {
    dateString = String(value);
  }

  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-])/.test(dateString)) {
    dateString = `${dateString}Z`;
  }

  return new Date(dateString);
}

export function formatLocalDate(value, options = DATE_OPTIONS) {
  const dateObj = parseToLocalDate(value);
  return dateObj.toLocaleString(undefined, options);
}
