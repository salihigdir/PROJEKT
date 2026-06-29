const express = require("express");
const router = express.Router();

const { checkAllPrinters } = require("../services/printerService");
const { query } = require("../db/db");

// GET /api/printers/status
router.get("/status", async (req, res) => {
  try {
    const results = await checkAllPrinters();

    // Persist results to DB (fire-and-forget errors don't block response)
    (async () => {
      try {
        const insertText = `INSERT INTO printer_statuses (name, ip, online, status, checked_at) VALUES ($1,$2,$3,$4,$5)`;
        await Promise.all(
          results.map((p) =>
            query(insertText, [p.name, p.ip, p.online, p.status, p.checkedAt])
          )
        );
      } catch (dbErr) {
        console.error("Failed to persist printer statuses:", dbErr);
      }
    })();

    res.json(results);
  } catch (error) {
    console.error("Printer status error:", error);
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
    return res.status(400).json({ message: "Missing ip query parameter" });
  }

  try {
    const rows = await query(
      `SELECT name, ip, online, status, checked_at FROM printer_statuses WHERE ip = $1 ORDER BY checked_at DESC LIMIT $2`,
      [ip, limit]
    );

    res.json(rows.rows);
  } catch (error) {
    console.error("Failed to load history:", error);
    res.status(500).json({ message: "Failed to load history" });
  }
});

module.exports = router;
