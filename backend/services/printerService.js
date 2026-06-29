const ping = require("ping");
const fs = require("fs");
const path = require("path");

function getPrinters() {
  const filePath = path.join(__dirname, "../printers.json");
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

async function checkPrinter(printer) {
  const pingResult = await ping.promise.probe(printer.ip, {
    timeout: 2
  });

  const checkedAt = new Date();

  return {
    name: printer.name,
    ip: printer.ip,
    location: printer.location || "Unbekannt",
    online: pingResult.alive,
    status: pingResult.alive ? "ONLINE" : "OFFLINE",
    checkedAt: checkedAt.toISOString(),
    lastCheck: checkedAt.toLocaleString("de-DE")
  };
}

async function checkAllPrinters() {
  const printers = getPrinters();
  const results = await Promise.all(printers.map(checkPrinter));
  return results;
}

module.exports = {
  checkAllPrinters,
  checkPrinter
};
