const { checkAllPrinters } = require("./printerService");
const { writePulsLogs } = require("./pulsLogService");

async function runPrinterCheck() {
  const results = await checkAllPrinters();
  const logResult = await writePulsLogs(results);

  return {
    printers: results,
    ...logResult
  };
}

module.exports = {
  runPrinterCheck
};
