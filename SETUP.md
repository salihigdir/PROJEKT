# Projekt auf neuem Rechner einrichten

## Benötigte Programme

| Programm | Version | Zweck |
|----------|---------|-------|
| **Git** | aktuell | Repository klonen |
| **Node.js** | 20 LTS oder neuer | Backend |
| **PostgreSQL** | 15+ | Datenbank `projekt_db` |
| **Browser** | beliebig | Dashboard |
| **pgAdmin** (optional) | 4+ | Datenbank anzeigen |

**Firma / PULS (Ubuntu 24.04):** zusätzlich `curl`, System-Cron optional.

---

## Schritt 1 — Repository klonen

```bash
git clone https://github.com/salihigdir/PROJEKT.git
cd PROJEKT
```

---

## Schritt 2 — Node.js-Abhängigkeiten

```bash
cd backend
npm install
```

---

## Schritt 3 — PostgreSQL installieren und starten

### Windows

1. PostgreSQL von https://www.postgresql.org/download/windows/ installieren
2. Passwort für Benutzer `postgres` merken
3. Dienst **postgresql-x64-…** muss laufen (Dienste-App)

### Ubuntu 24.04

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

---

## Schritt 4 — `.env` anlegen

```bash
cd backend
copy .env.example .env        # Windows (cmd)
# cp .env.example .env      # Linux/macOS
```

Datei `backend/.env` bearbeiten:

```env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=DEIN_POSTGRES_PASSWORT
PGDATABASE=projekt_db
ENABLE_SCHEDULER=true
```

`.env` wird **nicht** ins Git hochgeladen — auf jedem Rechner neu anlegen.

---

## Schritt 5 — Drucker konfigurieren

Datei `backend/printers.json` — echte IP für ZD420 eintragen:

```json
{
  "name": "ZD420-Lager",
  "ip": "192.168.0.8",
  "location": "Lager"
}
```

---

## Schritt 6 — Server starten

```bash
cd backend
npm start
```

Erwartete Ausgabe:

```
Datenbank projekt_db existiert bereits
[PULS] Scheduler gestartet (alle 15 Minuten)
Server läuft: http://localhost:3000
```

Dashboard: **http://localhost:3000**

---

## Schritt 7 — Test

```bash
cd backend
npm run check
```

| Exit-Code | Bedeutung |
|-----------|-----------|
| 0 | Alle Drucker online |
| 1 | Mindestens einer offline |
| 2 | Fehler (DB, Netzwerk, …) |

API-Test: http://localhost:3000/api/test

---

## pgAdmin (optional)

1. Server hinzufügen: Host `localhost`, Port `5432`, User `postgres`
2. Datenbank: `projekt_db` → Schema `public` → Tabelle `puls_log`
3. Abfrage:

```sql
SELECT id, u_logtime, u_message, u_refkey
FROM puls_log
ORDER BY id DESC
LIMIT 10;
```

---

## Entwicklung mit Auto-Reload

```bash
cd backend
npm run dev
```

---

## Ubuntu / PULS (Produktion)

Cron alle 15 Minuten (Beispiel):

```bash
crontab -e
```

Zeile:

```
*/15 * * * * cd /pfad/zum/PROJEKT/backend && /usr/bin/npm run check >> /var/log/printer-check.log 2>&1
```

Oder HTTP-Aufruf durch PULS:

```
GET http://SERVER-IP:3000/api/puls/check
```

---

## Häufige Probleme

| Problem | Lösung |
|---------|--------|
| `ECONNREFUSED` PostgreSQL | PostgreSQL-Dienst starten, `.env` prüfen |
| Dashboard leer / Fehler | `npm start` läuft? Port 3000 frei? |
| Ping schlägt fehl (Windows) | Als Administrator starten oder ICMP-Firewall prüfen |
| `u_ordernum` ist NULL | Normal — kein Auftrag im Drucker-Check |
| Alte DB fehlt | Normal auf neuem PC — Tabellen werden bei `npm start` erstellt |

---

## Checkliste neuer Rechner

- [ ] Git installiert
- [ ] Node.js installiert (`node -v`, `npm -v`)
- [ ] PostgreSQL installiert und läuft
- [ ] Repository geklont
- [ ] `npm install` in `backend/`
- [ ] `.env` aus `.env.example` erstellt
- [ ] `printers.json` mit echter Drucker-IP
- [ ] `npm start` — Dashboard erreichbar
- [ ] `npm run check` — Logs in `puls_log`
