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
    console.log(`Created database ${targetDatabase}`);
  } catch (error) {
    if (error.code === "42P04") {
      console.log(`Database ${targetDatabase} already exists`);
    } else {
      throw error;
    }
  } finally {
    await adminPool.end();
  }
}

async function initializeDatabase() {
  await createDatabaseIfNotExists();
  const initPath = path.join(__dirname, "init.sql");
  const sql = fs.readFileSync(initPath, "utf8");
  await query(sql);
}

module.exports = {
  pool,
  query,
  initializeDatabase
};
