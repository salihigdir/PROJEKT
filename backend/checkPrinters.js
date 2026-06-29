const fs = require("fs");
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

const { initializeDatabase } = require("./db/db");
const { runPrinterCheck } = require("./services/printerCheckJob");

async function main() {
  await initializeDatabase();
  const result = await runPrinterCheck();

  console.log(result.summary);

  for (const log of result.logs) {
    if (log.event_type === "offline") {
      console.log(log.message);
    }
  }

  process.exit(result.offlineCount > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Druckerprüfung fehlgeschlagen:", error.message);
  process.exit(2);
});
