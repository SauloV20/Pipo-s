// api/_db.js
// Conexão compartilhada com o Postgres (Vercel Postgres / Neon).
const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

module.exports = { getPool };
