const fs = require("fs");
const express = require("express");
const cors = require("cors");
const path = require("path");

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const [, key, value] = match;
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  });
}

const printerRoutes = require("./routes/printerRoutes");
const pulsRoutes = require("./routes/pulsRoutes");
const { initializeDatabase } = require("./db/db");
const { startPrinterScheduler } = require("./scheduler/printerScheduler");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Frontend-Dateien bereitstellen
app.use(express.static(path.join(__dirname, "../frontend")));

// API-Test-Endpunkt
app.get("/api/test", (req, res) => {
  res.json({
    message: "API läuft",
    status: "OK"
  });
});

// Drucker-Routen
app.use("/api/printers", printerRoutes);

// PULS-Integrationsrouten
app.use("/api/puls", pulsRoutes);

async function startServer() {
  try {
    await initializeDatabase();

    if (process.env.ENABLE_SCHEDULER === "true") {
      startPrinterScheduler();
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server läuft: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Serverstart fehlgeschlagen:", error);
    process.exit(1);
  }
}

startServer();
