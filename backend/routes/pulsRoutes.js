const express = require("express");
const router = express.Router();

const { runPrinterCheck } = require("../services/printerCheckJob");
const { query } = require("../db/db");

// GET /api/puls/check — PULS-Auslöser: alle Drucker prüfen und in puls_log schreiben
router.get("/check", async (req, res) => {
  try {
    const result = await runPrinterCheck();
    res.json({
      summary: result.summary,
      onlineCount: result.onlineCount,
      offlineCount: result.offlineCount,
      total: result.total,
      logs: result.logs,
      printers: result.printers
    });
  } catch (error) {
    console.error("Fehler bei der PULS-Prüfung:", error);
    res.status(500).json({
      message: "Fehler bei der PULS-Druckerprüfung"
    });
  }
});

// GET /api/puls/logs?limit=50 — letzte PULS-Log-Einträge
router.get("/logs", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

  try {
    const rows = await query(
      `SELECT id, message, level, event_type,
              printer_name, printer_ip, printer_location,
              online, checked_at
       FROM puls_log
       ORDER BY checked_at DESC, id DESC
       LIMIT $1`,
      [limit]
    );

    res.json(rows.rows);
  } catch (error) {
    console.error("Fehler beim Laden der PULS-Logs:", error);
    res.status(500).json({ message: "Fehler beim Laden der PULS-Logs" });
  }
});

module.exports = router;
