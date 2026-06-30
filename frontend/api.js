import { HISTORY_LIMIT } from "./config.js";

export async function fetchPrinterStatus() {
  const response = await fetch("/api/printers/status");
  if (!response.ok) {
    throw new Error("Fehler beim Laden des Druckerstatus");
  }
  return response.json();
}

export async function fetchPrinterHistory(ip, limit = HISTORY_LIMIT) {
  const params = new URLSearchParams({ ip, limit: String(limit) });
  const response = await fetch(`/api/printers/history?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Fehler beim Laden des Druckerverlaufs");
  }
  return response.json();
}
