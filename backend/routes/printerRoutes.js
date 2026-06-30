const express = require("express");
const router = express.Router();

const { runPrinterCheck } = require("../services/printerCheckJob");
const { query } = require("../db/db");

// GET /api/printers/status — Drucker prüfen und in puls_log speichern
router.get("/status", async (req, res) => {
  try {
    const result = await runPrinterCheck();
    res.json(result.printers);
  } catch (error) {
    console.error("Fehler beim Druckerstatus:", error);
    res.status(500).json({
      message: "Fehler bei der Prüfung des Druckerstatus"
    });
  }
});

// GET /api/printers/history?ip=1.2.3.4&limit=10
router.get("/history", async (req, res) => {
  const ip = req.query.ip;
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);

  if (!ip) {
    return res.status(400).json({ message: "Fehlender ip-Abfrageparameter" });
  }

  try {
    const rows = await query(
      `SELECT
         printer_name AS name,
         printer_ip AS ip,
         online,
         message,
         checked_at
       FROM puls_log
       WHERE printer_ip = $1
         AND event_type = 'printer_status'
       ORDER BY checked_at DESC
       LIMIT $2`,
      [ip, limit]
    );

    const history = rows.rows.map((row) => ({
      name: row.name,
      ip: row.ip,
      online: row.online,
      status: row.online ? "ONLINE" : "OFFLINE",
      message: row.message,
      checked_at: row.checked_at
    }));

    res.json(history);
  } catch (error) {
    console.error("Fehler beim Laden des Verlaufs:", error);
    res.status(500).json({ message: "Fehler beim Laden des Verlaufs" });
  }
});

module.exports = router;
