import { fetchPrinterStatus, fetchPrinterHistory } from "./api.js";
import { DATE_OPTIONS, formatLocalDate, formatNow } from "./config.js";

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
        <div><strong>Standort:</strong> ${printer.location || "—"}</div>
        <div><strong>Letzte Prüfung:</strong> ${formatLocalDate(printer.checkedAt)}</div>
      </div>
    `;

    card.addEventListener("click", async () => {
      try {
        const history = await fetchPrinterHistory(printer.ip);
        showHistoryModal(printer, history);
      } catch (err) {
        alert("Geçmiş alınırken hata oluştu.");
        console.error(err);
      }
    });

    container.appendChild(card);
  });

  onlineCountElement.textContent = onlineCount;
  offlineCountElement.textContent = offlineCount;
  refreshTimeElement.textContent = formatNow();
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

function showHistoryModal(printer, history) {
  // simple modal element
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.left = "0";
  modal.style.top = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.4)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = "9999";

  const box = document.createElement("div");
  box.style.background = "white";
  box.style.padding = "20px";
  box.style.borderRadius = "8px";
  box.style.maxWidth = "600px";
  box.style.width = "90%";
  box.style.maxHeight = "80%";
  box.style.overflow = "auto";

  const title = document.createElement("h3");
  title.textContent = `${printer.name} - ${printer.ip} geçmişi`;
  box.appendChild(title);

  if (!history || history.length === 0) {
    const p = document.createElement("p");
    p.textContent = "Geçmiş kaydı bulunamadı.";
    box.appendChild(p);
  } else {
    const list = document.createElement("ul");
    history.forEach((h) => {
      const li = document.createElement("li");
      const time = formatLocalDate(h.checked_at, DATE_OPTIONS);
      li.textContent = `${time} — ${h.status} (${h.online ? "online" : "offline"})`;
      list.appendChild(li);
    });
    box.appendChild(list);
  }

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Kapat";
  closeBtn.style.marginTop = "12px";
  closeBtn.addEventListener("click", () => document.body.removeChild(modal));
  box.appendChild(closeBtn);

  modal.appendChild(box);
  document.body.appendChild(modal);
}