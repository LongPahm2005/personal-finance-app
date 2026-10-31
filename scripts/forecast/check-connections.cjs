// Read-only diagnostics. Never print credentials or raw connection errors.
require('dotenv').config({ quiet: true });
const mysql = require('mysql2/promise');
const { testGeminiConnection } = require('../../backend/dist-electron/services/gemini.js');

async function main() {
  let connection;
  let key = process.env.AI_API_KEY?.trim() || '';
  let model = process.env.AI_MODEL || '';
  try {
    connection = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '123456', database: process.env.DB_NAME || 'personal_finance', connectTimeout: 5000 });
    console.log('MySQL: connected (read-only check).');
    try {
      const [configs] = await connection.query('SELECT api_key, model_name FROM ai_configs WHERE is_active = 1 ORDER BY id DESC LIMIT 1');
      key = key || configs[0]?.api_key || '';
      model = configs[0]?.model_name || model || 'gemini-3-flash-preview';
    } catch (error) {
      if (error.code !== 'ER_NO_SUCH_TABLE') throw error;
      console.log('AI configuration table is missing; using environment configuration. No schema changes made.');
    }
    const [columns] = await connection.query('SHOW COLUMNS FROM recurring_transactions');
    console.log('Recurring schedule columns: ' + columns.map(column => column.Field).filter(name => ['next_date', 'next_occurrence', 'start_date', 'end_date'].includes(name)).join(', '));
  } catch (error) { console.log('MySQL: unavailable (' + (error.code || 'connection error') + ').'); }
  finally { if (connection) await connection.end(); }
  try {
    const result = await testGeminiConnection(key, model || 'gemini-3-flash-preview');
    console.log(JSON.stringify(result));
  } catch (error) { console.log('Gemini: ' + error.message); }
}
main().catch(() => { console.log('Connection diagnostics failed.'); process.exitCode = 1; });
