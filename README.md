# Drucker-Monitoring (PROJEKT)

Zebra-Druckerüberwachung mit PULS-Integration.

Backend: `backend/` (Node.js + Express + PostgreSQL)  
Frontend: `frontend/` (statische Dateien, vom Backend bereitgestellt)

## Schnellstart

1. Abhängigkeiten installieren:

```bash
cd backend
npm install
```

2. Datenbank konfigurieren: `.env.example` nach `.env` kopieren und `PGPASSWORD` sowie weitere Werte setzen.

3. Backend starten:

```bash
cd backend
npm start
```

4. Dashboard öffnen: `http://localhost:3000`

## PULS-Integration

PULS kann eine vollständige Druckerprüfung auf zwei Arten auslösen:

**CLI (empfohlen für Cron / Ubuntu):**

```bash
cd backend
npm run check
```

Exit-Code: `0` = alle online, `1` = mindestens einer offline, `2` = Fehler.

**HTTP:**

```bash
curl http://localhost:3000/api/puls/check
```

Ergebnisse werden in der Tabelle `puls_log` (PULS_LOG) gespeichert:

| event_type       | Beispielnachricht |
|------------------|-------------------|
| `summary`        | `3 von 5 Druckern online.` |
| `printer_status` | `ZD420-Lager (Lager): ONLINE` |
| `offline`        | `Drucker mit IP 192.168.0.120 (Lager) offline. Zuletzt online: 29.06.2026, 09:18.` |

Letzte Logs: `GET /api/puls/logs?limit=50`

## Druckerkonfiguration

Datei `backend/printers.json` bearbeiten:

```json
{
  "name": "ZD420-Lager",
  "ip": "192.168.0.8",
  "location": "Lager"
}
```

## API-Übersicht

| Endpunkt | Zweck |
|----------|-------|
| `GET /api/printers/status` | Drucker prüfen und in `puls_log` speichern |
| `GET /api/printers/history?ip=...` | Statusverlauf aus `puls_log` |
| `GET /api/puls/check` | Vollständige Prüfung + Schreiben in `puls_log` |
| `GET /api/puls/logs` | Letzte Log-Einträge |

## Scheduler

`ENABLE_SCHEDULER=true` in `.env` setzen, um alle 15 Minuten eine PULS-Prüfung auszuführen, solange der Server läuft.  
Alternativ kann PULS oder System-Cron `npm run check` direkt aufrufen.
