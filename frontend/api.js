export async function fetchPrinterStatus() {
  const response = await fetch("/api/printers/status");
  if (!response.ok) {
    throw new Error("Failed to load printer status");
  }
  return response.json();
}
