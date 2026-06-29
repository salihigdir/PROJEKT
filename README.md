# Printer Monitoring (PROJEKT)

Simple printer monitoring demo.

Backend: `backend/` (Node.js + Express + PostgreSQL)
Frontend: `frontend/` (static files served by backend)

Quick start

1. Install dependencies (backend):

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

4. Open frontend in browser:

```
http://localhost:3000
```

Notes

- The frontend fetches `/api/printers/status` and displays cards for each printer.
- Clicking a card shows recent history (from `printer_statuses` table).
- The backend will create the target database if it does not exist (requires the configured `PGUSER` to have privileges).

If you run into permission or connection issues, ensure PostgreSQL is running and `.env` credentials are correct.
