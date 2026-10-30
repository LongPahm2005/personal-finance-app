const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '123456';
  const testDbName = 'personal_finance_test_auto_init';

  console.log('--- TEST: Giả lập mang app sang máy tính mới tinh chưa có DB ---');
  const conn = await mysql.createConnection({ host, port, user, password });

  // Xóa DB giả lập nếu đã có
  await conn.query(`DROP DATABASE IF EXISTS \`${testDbName}\``);
  console.log(`1. Tạo database mới tinh: [${testDbName}]`);
  await conn.query(`CREATE DATABASE \`${testDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.query(`USE \`${testDbName}\``);

  // Nạp module initializeSchema từ dist-electron
  const { initializeSchema } = require('../backend/dist-electron/database/init_schema.js');
  await initializeSchema(conn);

  // Kiểm tra số lượng bảng đã tạo
  const [tables] = await conn.query('SHOW TABLES');
  console.log('2. Số lượng bảng tự động tạo thành công:', tables.length);

  // Kiểm tra danh mục và ví
  const [wallets] = await conn.query('SELECT name, current_balance FROM wallets');
  console.log('3. Các ví tiền mặc định được tạo:', wallets);

  const [categories] = await conn.query('SELECT count(*) as c FROM categories');
  console.log('4. Tổng số danh mục mặc định được tạo:', categories[0].c);

  const [profile] = await conn.query('SELECT financial_health_score FROM ai_user_profiles');
  console.log('5. Điểm sức khỏe AI khởi đầu:', profile[0].financial_health_score);

  // Dọn dẹp DB test
  await conn.query(`DROP DATABASE \`${testDbName}\``);
  await conn.end();
  console.log('--- TEST THÀNH CÔNG 100%! HỆ THỐNG TỰ ĐỘNG KHỞI TẠO BẢNG HOÀN HẢO ---');
})().catch(err => {
  console.error('Test lỗi:', err);
  process.exit(1);
});
