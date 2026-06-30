const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const poolConfig = {
  host: process.env.PGHOST || "localhost",
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
  user: process.env.PGUSER || "postgres",
  database: process.env.PGDATABASE || "postgres"
};

if (process.env.PGPASSWORD !== undefined) {
  poolConfig.password = process.env.PGPASSWORD;
}

const pool = new Pool(poolConfig);

async function query(text, params) {
  return pool.query(text, params);
}

async function createDatabaseIfNotExists() {
  const targetDatabase = process.env.PGDATABASE || "postgres";
  if (targetDatabase === "postgres") {
    return;
  }

  const adminConfig = {
    ...poolConfig,
    database: "postgres"
  };
  const adminPool = new Pool(adminConfig);

  try {
    await adminPool.query(`CREATE DATABASE "${targetDatabase}"`);
    console.log(`Datenbank ${targetDatabase} erstellt`);
  } catch (error) {
    if (error.code === "42P04") {
      console.log(`Datenbank ${targetDatabase} existiert bereits`);
    } else {
      throw error;
    }
  } finally {
    await adminPool.end();
  }
}

async function runSqlMigration(filename, logPrefix) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const sql = fs.readFileSync(filePath, "utf8");
  const result = await query(sql);

  if (result.rowCount > 0) {
    console.log(`${logPrefix}: ${result.rowCount} Einträge aktualisiert`);
  }
}

async function backfillPulsLogFields() {
  await runSqlMigration("backfill_puls_log.sql", "PULS-Felder nachgefüllt");
  await runSqlMigration("fix_puls_log_times.sql", "PULS-Zeitstempel korrigiert");
}

async function initializeDatabase() {
  await createDatabaseIfNotExists();
  const initPath = path.join(__dirname, "init.sql");
  const sql = fs.readFileSync(initPath, "utf8");
  await query(sql);
  await backfillPulsLogFields();
}

module.exports = {
  pool,
  query,
  initializeDatabase
};
