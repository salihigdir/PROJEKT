import { HISTORY_LIMIT } from "./config.js";

export async function fetchPrinterStatus() {
  const response = await fetch("/api/printers/status");
  if (!response.ok) {
    throw new Error("Failed to load printer status");
  }
  return response.json();
}

export async function fetchPrinterHistory(ip, limit = HISTORY_LIMIT) {
  const params = new URLSearchParams({ ip, limit: String(limit) });
  const response = await fetch(`/api/printers/history?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to load printer history");
  }
  return response.json();
}
