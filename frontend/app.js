async function loadPrinterStatus() {
  const container = document.getElementById("printerContainer");
  const onlineCountElement = document.getElementById("onlineCount");
  const offlineCountElement = document.getElementById("offlineCount");
  const refreshTimeElement = document.getElementById("refreshTime");

  try {
    const response = await fetch("/api/printers/status");
    const printers = await response.json();

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
          ${printer.online ? "ÇEVRİMİÇİ" : "ÇEVRİMDIŞI"}
        </div>

        <div class="printer-info">
          <div><strong>IP:</strong> ${printer.ip}</div>
          <div><strong>Son kontrol:</strong> ${printer.lastCheck}</div>
        </div>
      `;

      container.appendChild(card);
    });

    onlineCountElement.textContent = onlineCount;
    offlineCountElement.textContent = offlineCount;
    refreshTimeElement.textContent = new Date().toLocaleString("tr-TR");

  } catch (error) {
    container.innerHTML = `
      <p style="color: red;">
        Yazıcı durumları yüklenirken hata oluştu.
      </p>
    `;
    console.error(error);
  }
}

loadPrinterStatus();

setInterval(loadPrinterStatus, 10000);
