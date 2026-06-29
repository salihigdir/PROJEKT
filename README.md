# Printer Monitoring (PROJEKT)

Zebra printer monitoring with PULS integration.

Backend: `backend/` (Node.js + Express + PostgreSQL)  
Frontend: `frontend/` (static files served by backend)

## Quick start

1. Install dependencies:

```bash
cd backend
npm install
```

2. Configure database: copy `.env.example` to `.env` and set `PGPASSWORD` and other values.

3. Start backend:

```bash
cd backend
npm start
```

4. Open dashboard: `http://localhost:3000`

## PULS integration

PULS can trigger a full printer check in two ways:

**CLI (recommended for cron / Ubuntu):**

```bash
cd backend
npm run check
```

Exit code: `0` = all online, `1` = at least one offline, `2` = error.

**HTTP:**

```bash
curl http://localhost:3000/api/puls/check
```

Results are written to the `puls_log` table (PULS_LOG):

| event_type       | Example message |
|------------------|-----------------|
| `summary`        | `3 von 5 Druckern online.` |
| `printer_status` | `ZD411-Lager (Lager): ONLINE` |
| `offline`        | `Drucker mit IP 192.168.0.120 (Lager) offline. Zuletzt online: 29.06.2026, 09:18.` |

Recent logs: `GET /api/puls/logs?limit=50`

## Printer configuration

Edit `backend/printers.json`:

```json
{
  "name": "ZD411-Lager",
  "ip": "192.168.0.120",
  "location": "Lager"
}
```

## API overview

| Endpoint | Purpose |
|----------|---------|
| `GET /api/printers/status` | Live ping check (dashboard, no DB write) |
| `GET /api/printers/history?ip=...` | Status history from `puls_log` |
| `GET /api/puls/check` | Full check + write to `puls_log` |
| `GET /api/puls/logs` | Recent log entries |

## Scheduler

Set `ENABLE_SCHEDULER=true` in `.env` to run a PULS check every 15 minutes while the server is running.  
Alternatively, let PULS or system cron call `npm run check` directly.
