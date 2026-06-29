const { checkAllPrinters } = require("../services/printerService");
const { query } = require("../db/db");

async function savePrinterStatuses() {
  try {
    const results = await checkAllPrinters();

    const insertText = `
      INSERT INTO printer_statuses (name, ip, online, status, checked_at)
      VALUES ($1, $2, $3, $4, $5)
    `;

    for (const printer of results) {
      await query(insertText, [
        printer.name,
        printer.ip,
        printer.online,
        printer.status,
        printer.checkedAt
      ]);
    }

    console.log(`Saved ${results.length} printer status records at ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Error saving printer statuses:", error);
  }
}

function startPrinterScheduler() {
  savePrinterStatuses();
  setInterval(savePrinterStatuses, 15 * 60 * 1000);
}

module.exports = {
  startPrinterScheduler
};
