// Defaults to a read-only preview. --apply must only be used after migration approval.
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('dotenv').config({ quiet: true });

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, '../../docs/database/migrations/001-add-ai-tables.sql'), 'utf8');
  const statements = sql.replace(/^--.*$/gm, '').split(';').map(value => value.trim()).filter(Boolean);
  if (statements.length !== 8 || statements.some(value => !/^CREATE TABLE IF NOT EXISTS `ai_[a-z_]+`\s*\(/.test(value) || /\b(DROP|ALTER|TRUNCATE|DELETE|INSERT|UPDATE)\s+(TABLE|FROM|INTO)/i.test(value))) {
    throw new Error('Migration validation failed.');
  }
  const connection = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '123456', database: process.env.DB_NAME || 'personal_finance', connectTimeout: 5000 });
  try {
    const [rows] = await connection.query('SHOW TABLES');
    const existing = new Set(rows.map(row => String(Object.values(row)[0])));
    for (const statement of statements) {
      const table = statement.match(/^CREATE TABLE IF NOT EXISTS `([^`]+)`/)[1];
      console.log(`${table}: ${existing.has(table) ? 'already exists, preserved' : 'missing'}`);
    }
    if (!process.argv.includes('--apply')) {
      console.log('Preview only. No database changes. Review the SQL and obtain approval before --apply.');
      return;
    }
    for (const statement of statements) await connection.query(statement);
    console.log('AI migration applied. Existing tables and financial data preserved.');
  } finally { await connection.end(); }
}
main().catch(error => { console.error('AI migration failed (' + (error.code || 'validation/connection error') + ').'); process.exitCode = 1; });
