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

  return {
    name: printer.name,
    ip: printer.ip,
    online: pingResult.alive,
    status: pingResult.alive ? "ONLINE" : "OFFLINE",
    lastCheck: new Date().toLocaleString("tr-TR")
  };
}

async function checkAllPrinters() {
  const printers = getPrinters();

  const results = [];

  for (const printer of printers) {
    const result = await checkPrinter(printer);
    results.push(result);
  }

  return results;
}

module.exports = {
  checkAllPrinters,
  checkPrinter
};
