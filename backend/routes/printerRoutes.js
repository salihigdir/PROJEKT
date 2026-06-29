const express = require("express");
const router = express.Router();

const { checkAllPrinters } = require("../services/printerService");

// GET /api/printers/status
router.get("/status", async (req, res) => {
  try {
    const results = await checkAllPrinters();
    res.json(results);
  } catch (error) {
    console.error("Printer status error:", error);
    res.status(500).json({
      message: "Yazıcı durumları kontrol edilirken hata oluştu"
    });
  }
});

module.exports = router;
