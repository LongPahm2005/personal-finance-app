const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAllData() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'personal_finance',
  });

  console.log('Connecting to MySQL and resetting all financial data to 0...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');

  // 1. Reset Wallets to 0.00 VND
  await conn.query('UPDATE wallets SET initial_balance = 0.00, current_balance = 0.00');

  // 2. Truncate all transactions & activity
  await conn.query('TRUNCATE TABLE transactions');
  await conn.query('TRUNCATE TABLE debt_payments');
  await conn.query('TRUNCATE TABLE debts');
  await conn.query('TRUNCATE TABLE budget_categories');
  await conn.query('TRUNCATE TABLE budgets');
  await conn.query('TRUNCATE TABLE saving_goals');
  await conn.query('TRUNCATE TABLE recurring_transactions');

  // 3. Truncate AI generated tables
  await conn.query('TRUNCATE TABLE ai_recommendations');
  await conn.query('TRUNCATE TABLE ai_cashflow_forecasts');
  await conn.query('TRUNCATE TABLE ai_scenarios');
  await conn.query('TRUNCATE TABLE ai_anomalies');
  await conn.query('TRUNCATE TABLE ai_chat_messages');
  await conn.query('TRUNCATE TABLE ai_chat_sessions');

  // Khởi tạo lại phiên chat 1 trống
  await conn.query("INSERT INTO ai_chat_sessions (id, title) VALUES (1, 'Hội thoại chính')");

  // 4. Reset AI User Profile với điểm chuẩn 100/100 (Khởi đầu sạch nợ)
  await conn.query('TRUNCATE TABLE ai_user_profiles');
  await conn.query(`
    INSERT INTO ai_user_profiles (id, risk_tolerance, monthly_baseline_income, emergency_fund_target_months, financial_health_score, financial_priorities, last_analyzed_at)
    VALUES (1, 'moderate', 0.00, 6, 100.00, '["emergency_fund", "debt_payoff", "savings"]', NOW())
  `);

  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('--- RESET COMPLETED SUCCESSFULLY (SCORE: 100/100) ---');

  // Verify
  const [wallets] = await conn.query('SELECT id, name, initial_balance, current_balance FROM wallets');
  console.log('Wallets balance:', wallets);

  const [tCount] = await conn.query('SELECT count(*) as c FROM transactions');
  console.log('Total transactions:', tCount[0].c);

  const [p] = await conn.query('SELECT financial_health_score FROM ai_user_profiles');
  console.log('AI Profile Score:', p[0].financial_health_score);

  await conn.end();
}

resetAllData().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
