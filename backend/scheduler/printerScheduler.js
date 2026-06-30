const { runPrinterCheck } = require("../services/printerCheckJob");

const INTERVAL_MS = 15 * 60 * 1000;

async function savePrinterStatuses() {
  try {
    const result = await runPrinterCheck();
    console.log(`[PULS] ${result.summary}`);
  } catch (error) {
    console.error("[PULS] Fehler beim Speichern des Druckerstatus:", error);
  }
}

function startPrinterScheduler() {
  savePrinterStatuses();
  setInterval(savePrinterStatuses, INTERVAL_MS);
  console.log(`[PULS] Scheduler gestartet (alle ${INTERVAL_MS / 60000} Minuten)`);
}

module.exports = {
  startPrinterScheduler
};
