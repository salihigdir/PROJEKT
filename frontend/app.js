import { fetchPrinterStatus } from "./api.js";

const container = document.getElementById("printerContainer");
const onlineCountElement = document.getElementById("onlineCount");
const offlineCountElement = document.getElementById("offlineCount");
const refreshTimeElement = document.getElementById("refreshTime");
const refreshButton = document.getElementById("refreshButton");

function renderPrinters(printers) {
  container.innerHTML = "";

  let onlineCount = 0;
  let offlineCount = 0;

  printers.forEach((printer) => {
    if (printer.online) {
      onlineCount++;
    } else {
      offlineCount++;
    }

    const card = document.createElement("div");
    card.className = `printer-card ${printer.online ? "online" : "offline"}`;

    card.innerHTML = `
      <div class="printer-header">
        <div class="status-dot"></div>
        <div class="printer-name">${printer.name}</div>
      </div>

      <div class="status-text">
        ${printer.online ? "ONLINE" : "OFFLINE"}
      </div>

      <div class="printer-info">
        <div><strong>IP-Adresse:</strong> ${printer.ip}</div>
        <div><strong>Letzte Prüfung:</strong> ${printer.lastCheck}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      alert("Geçmiş kayıtları sonraki aşamada bu alanda göreceksiniz.");
    });

    container.appendChild(card);
  });

  onlineCountElement.textContent = onlineCount;
  offlineCountElement.textContent = offlineCount;
  refreshTimeElement.textContent = new Date().toLocaleString("de-DE");
}

async function loadPrinterStatus() {
  try {
    const printers = await fetchPrinterStatus();
    renderPrinters(printers);
  } catch (error) {
    container.innerHTML = `
      <p style="color: red;">
        Fehler beim Laden des Druckerstatus.
      </p>
    `;
    console.error(error);
  }
}

refreshButton.addEventListener("click", loadPrinterStatus);

loadPrinterStatus();
setInterval(loadPrinterStatus, 15 * 60 * 1000);