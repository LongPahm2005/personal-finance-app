import mysql from 'mysql2/promise';

/**
 * Script DDL tự động khởi tạo 17 bảng cho dự án AI-FDSS
 * Chỉ chạy khi mang sang máy mới chưa có Database
 */
export async function initializeSchema(connection: mysql.Connection): Promise<void> {
  console.log('[Auto-Init] Bắt đầu tự động tạo 17 bảng cơ sở dữ liệu...');

  await connection.query('SET FOREIGN_KEY_CHECKS = 0');

  // 1. Categories
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`categories\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(100) NOT NULL,
      \`type\` ENUM('income', 'expense') NOT NULL,
      \`description\` VARCHAR(255) NULL DEFAULT NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 2. Wallets
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`wallets\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(100) NOT NULL,
      \`initial_balance\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      \`current_balance\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      \`description\` VARCHAR(255) NULL DEFAULT NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      CONSTRAINT \`chk_wallet_initial_balance\` CHECK (\`initial_balance\` >= 0),
      CONSTRAINT \`chk_wallet_current_balance\` CHECK (\`current_balance\` >= 0)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 3. Budgets
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`budgets\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(100) NOT NULL,
      \`amount\` DECIMAL(15, 2) NOT NULL,
      \`start_date\` DATE NOT NULL,
      \`end_date\` DATE NOT NULL,
      \`description\` VARCHAR(255) NULL DEFAULT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      CONSTRAINT \`chk_budget_amount\` CHECK (\`amount\` > 0),
      CONSTRAINT \`chk_budget_date\` CHECK (\`end_date\` >= \`start_date\`)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 4. Budget_Categories
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`budget_categories\` (
      \`budget_id\` INT NOT NULL,
      \`category_id\` INT NOT NULL,
      PRIMARY KEY (\`budget_id\`, \`category_id\`) USING BTREE,
      INDEX \`idx_budget_categories_cat\` (\`category_id\` ASC) USING BTREE,
      CONSTRAINT \`fk_budget_cat_budget\` FOREIGN KEY (\`budget_id\`) REFERENCES \`budgets\` (\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT,
      CONSTRAINT \`fk_budget_cat_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 5. Debts
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`debts\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`type\` ENUM('receivable', 'payable') NOT NULL,
      \`person_name\` VARCHAR(150) NOT NULL,
      \`original_amount\` DECIMAL(15, 2) NOT NULL,
      \`remaining_amount\` DECIMAL(15, 2) NOT NULL,
      \`created_date\` DATE NOT NULL,
      \`due_date\` DATE NULL DEFAULT NULL,
      \`status\` ENUM('unpaid', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'unpaid',
      \`description\` VARCHAR(500) NULL DEFAULT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_debts_type\` (\`type\` ASC) USING BTREE,
      INDEX \`idx_debts_status\` (\`status\` ASC) USING BTREE,
      INDEX \`idx_debts_due_date\` (\`due_date\` ASC) USING BTREE,
      CONSTRAINT \`chk_debt_original_amount\` CHECK (\`original_amount\` > 0),
      CONSTRAINT \`chk_debt_remaining_amount\` CHECK (\`remaining_amount\` >= 0 AND \`remaining_amount\` <= \`original_amount\`)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 6. Debt_Payments
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`debt_payments\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`debt_id\` BIGINT NOT NULL,
      \`wallet_id\` INT NOT NULL,
      \`amount\` DECIMAL(15, 2) NOT NULL,
      \`payment_date\` DATE NOT NULL,
      \`note\` VARCHAR(255) NULL DEFAULT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_debt_payments_debt\` (\`debt_id\` ASC) USING BTREE,
      INDEX \`idx_debt_payments_wallet\` (\`wallet_id\` ASC) USING BTREE,
      CONSTRAINT \`fk_debt_payments_debt\` FOREIGN KEY (\`debt_id\`) REFERENCES \`debts\` (\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT,
      CONSTRAINT \`fk_debt_payments_wallet\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT \`chk_debt_payment_amount\` CHECK (\`amount\` > 0)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 7. Saving_Goals
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`saving_goals\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(150) NOT NULL,
      \`target_amount\` DECIMAL(15, 2) NOT NULL,
      \`current_amount\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      \`target_date\` DATE NULL DEFAULT NULL,
      \`status\` ENUM('in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'in_progress',
      \`description\` VARCHAR(500) NULL DEFAULT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_savings_status\` (\`status\` ASC) USING BTREE,
      CONSTRAINT \`chk_saving_target\` CHECK (\`target_amount\` > 0),
      CONSTRAINT \`chk_saving_current\` CHECK (\`current_amount\` >= 0)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 8. Transactions
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`transactions\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`wallet_id\` INT NOT NULL,
      \`category_id\` INT NOT NULL,
      \`type\` ENUM('income', 'expense') NOT NULL,
      \`amount\` DECIMAL(15, 2) NOT NULL,
      \`transaction_date\` DATE NOT NULL,
      \`note\` VARCHAR(500) NULL DEFAULT NULL,
      \`image_url\` VARCHAR(255) NULL DEFAULT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_transactions_date\` (\`transaction_date\` ASC) USING BTREE,
      INDEX \`idx_transactions_wallet\` (\`wallet_id\` ASC) USING BTREE,
      INDEX \`idx_transactions_cat\` (\`category_id\` ASC) USING BTREE,
      INDEX \`idx_transactions_type\` (\`type\` ASC) USING BTREE,
      CONSTRAINT \`fk_transactions_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT \`fk_transactions_wallet\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT \`chk_transaction_amount\` CHECK (\`amount\` > 0)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 9. Recurring_Transactions
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`recurring_transactions\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`wallet_id\` INT NOT NULL,
      \`category_id\` INT NOT NULL,
      \`type\` ENUM('income', 'expense') NOT NULL,
      \`amount\` DECIMAL(15, 2) NOT NULL,
      \`frequency\` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
      \`start_date\` DATE NOT NULL,
      \`end_date\` DATE NULL DEFAULT NULL,
      \`next_occurrence\` DATE NOT NULL,
      \`last_processed_date\` DATE NULL DEFAULT NULL,
      \`description\` VARCHAR(255) NULL DEFAULT NULL,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_recurring_next\` (\`next_occurrence\` ASC) USING BTREE,
      INDEX \`idx_recurring_active\` (\`is_active\` ASC) USING BTREE,
      CONSTRAINT \`fk_recurring_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT \`fk_recurring_wallet\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\` (\`id\`) ON DELETE RESTRICT ON UPDATE RESTRICT,
      CONSTRAINT \`chk_recurring_amount\` CHECK (\`amount\` > 0)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 10. AI User Profiles
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_user_profiles\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`risk_tolerance\` ENUM('conservative', 'moderate', 'aggressive') NOT NULL DEFAULT 'moderate',
      \`monthly_baseline_income\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      \`emergency_fund_target_months\` INT NOT NULL DEFAULT 6,
      \`financial_health_score\` DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
      \`financial_priorities\` JSON NULL,
      \`last_analyzed_at\` TIMESTAMP NULL DEFAULT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      CONSTRAINT \`chk_profile_health_score\` CHECK (\`financial_health_score\` >= 0 AND \`financial_health_score\` <= 100)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 11. AI Recommendations
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_recommendations\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`type\` VARCHAR(50) NOT NULL,
      \`title\` VARCHAR(200) NOT NULL,
      \`summary\` TEXT NOT NULL,
      \`detailed_reasoning\` TEXT NULL,
      \`potential_savings\` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      \`action_payload\` JSON NULL,
      \`status\` ENUM('pending', 'accepted', 'rejected', 'dismissed') NOT NULL DEFAULT 'pending',
      \`confidence_score\` DECIMAL(3, 2) NOT NULL DEFAULT 0.85,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`applied_at\` TIMESTAMP NULL DEFAULT NULL,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_ai_recs_status\` (\`status\` ASC) USING BTREE,
      INDEX \`idx_ai_recs_type\` (\`type\` ASC) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 12. AI Cashflow Forecasts
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_cashflow_forecasts\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`forecast_period\` VARCHAR(7) NOT NULL,
      \`predicted_income\` DECIMAL(15, 2) NOT NULL,
      \`predicted_expense\` DECIMAL(15, 2) NOT NULL,
      \`predicted_ending_balance\` DECIMAL(15, 2) NOT NULL,
      \`lower_bound_balance\` DECIMAL(15, 2) NOT NULL,
      \`upper_bound_balance\` DECIMAL(15, 2) NOT NULL,
      \`model_name\` VARCHAR(100) NOT NULL DEFAULT 'AI/Time-Series',
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      UNIQUE INDEX \`idx_forecast_period\` (\`forecast_period\` ASC) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 13. AI Scenarios
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_scenarios\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`name\` VARCHAR(150) NOT NULL,
      \`scenario_type\` VARCHAR(50) NOT NULL,
      \`parameters\` JSON NOT NULL,
      \`simulation_result\` JSON NOT NULL,
      \`ai_evaluation\` TEXT NOT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 14. AI Anomalies
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_anomalies\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`transaction_id\` BIGINT NULL DEFAULT NULL,
      \`category_id\` INT NULL DEFAULT NULL,
      \`severity\` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
      \`anomaly_type\` VARCHAR(50) NOT NULL,
      \`description\` VARCHAR(500) NOT NULL,
      \`suggested_action\` VARCHAR(500) NULL DEFAULT NULL,
      \`is_resolved\` TINYINT(1) NOT NULL DEFAULT 0,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_ai_anomalies_resolved\` (\`is_resolved\` ASC) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 15. AI Chat Sessions
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_chat_sessions\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`title\` VARCHAR(150) NOT NULL DEFAULT 'Hội thoại mới',
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 16. AI Chat Messages
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_chat_messages\` (
      \`id\` BIGINT NOT NULL AUTO_INCREMENT,
      \`session_id\` INT NOT NULL,
      \`role\` ENUM('user', 'assistant', 'system') NOT NULL,
      \`content\` TEXT NOT NULL,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE,
      INDEX \`idx_chat_session\` (\`session_id\` ASC) USING BTREE,
      CONSTRAINT \`fk_ai_chat_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`ai_chat_sessions\` (\`id\`) ON DELETE CASCADE ON UPDATE RESTRICT
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  // 17. AI Configs
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`ai_configs\` (
      \`id\` INT NOT NULL AUTO_INCREMENT,
      \`provider\` VARCHAR(50) NOT NULL DEFAULT 'gemini',
      \`api_key\` VARCHAR(255) NOT NULL,
      \`model_name\` VARCHAR(100) NOT NULL DEFAULT 'gemini-3-flash-preview',
      \`endpoint_url\` VARCHAR(255) NULL DEFAULT NULL,
      \`temperature\` DECIMAL(3, 2) NOT NULL DEFAULT 0.70,
      \`max_tokens\` INT NOT NULL DEFAULT 2048,
      \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
      \`created_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
  `);

  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('[Auto-Init] Hoàn tất tạo 17 bảng!');

  // --- NẠP DỮ LIỆU KHỞI TẠO NẾU CÒN TRỐNG ---
  // 1. Categories mặc định
  const [catRows] = await connection.query<mysql.RowDataPacket[]>('SELECT count(*) as c FROM categories');
  if (catRows[0].c === 0) {
    await connection.query(`
      INSERT INTO \`categories\` (\`name\`, \`type\`, \`description\`) VALUES
      ('Tiền lương', 'income', 'Lương hàng tháng từ công việc chính'),
      ('Tiền thưởng', 'income', 'Thưởng dự án, KPI, lễ tết'),
      ('Thu nhập ngoài', 'income', 'Dự án Freelance, làm thêm giờ'),
      ('Ăn uống', 'expense', 'Cơm trưa, cafe, ăn tối, liên hoan'),
      ('Đi lại & Xăng xe', 'expense', 'Tiền xăng, bảo dưỡng xe, vé xe buýt'),
      ('Hóa đơn tiện ích', 'expense', 'Điện, nước, internet thoại'),
      ('Mua sắm cá nhân', 'expense', 'Quần áo, đồ gia dụng, thiết bị công nghệ'),
      ('Y tế & Sức khỏe', 'expense', 'Thuốc men, khám sức khỏe, bảo hiểm'),
      ('Giáo dục & Học tập', 'expense', 'Sách vở, khóa học nâng cao kỹ năng');
    `);
    console.log('[Auto-Init] Đã nạp 9 danh mục thu/chi mặc định.');
  }

  // 2. Wallets mặc định (0 đ)
  const [walRows] = await connection.query<mysql.RowDataPacket[]>('SELECT count(*) as c FROM wallets');
  if (walRows[0].c === 0) {
    await connection.query(`
      INSERT INTO \`wallets\` (\`name\`, \`initial_balance\`, \`current_balance\`, \`description\`) VALUES
      ('Tiền mặt', 0.00, 0.00, 'Tiền mặt tiêu dùng hàng ngày'),
      ('Vietcombank', 0.00, 0.00, 'Tài khoản ngân hàng thanh toán chính'),
      ('Ví MoMo', 0.00, 0.00, 'Ví điện tử thanh toán dịch vụ');
    `);
    console.log('[Auto-Init] Đã nạp 3 ví tiền mặc định (0 đ).');
  }

  // 3. AI User Profile mặc định (100/100)
  const [profRows] = await connection.query<mysql.RowDataPacket[]>('SELECT count(*) as c FROM ai_user_profiles');
  if (profRows[0].c === 0) {
    await connection.query(`
      INSERT INTO \`ai_user_profiles\` (\`id\`, \`risk_tolerance\`, \`monthly_baseline_income\`, \`emergency_fund_target_months\`, \`financial_health_score\`, \`financial_priorities\`, \`last_analyzed_at\`)
      VALUES (1, 'moderate', 0.00, 6, 100.00, '["emergency_fund", "debt_payoff", "savings"]', NOW());
    `);
    console.log('[Auto-Init] Đã nạp Hồ sơ AI khởi đầu (100/100 - Sạch nợ).');
  }

  // 4. AI Chat Session mặc định
  const [chatRows] = await connection.query<mysql.RowDataPacket[]>('SELECT count(*) as c FROM ai_chat_sessions');
  if (chatRows[0].c === 0) {
    await connection.query("INSERT INTO `ai_chat_sessions` (`id`, `title`) VALUES (1, 'Hội thoại chính');");
  }

  // 5. AI Config nạp từ process.env
  const [confRows] = await connection.query<mysql.RowDataPacket[]>('SELECT count(*) as c FROM ai_configs');
  if (confRows[0].c === 0) {
    const apiKey = process.env.AI_API_KEY || '';
    const modelName = process.env.AI_MODEL || 'gemini-3-flash-preview';
    await connection.query(`
      INSERT INTO \`ai_configs\` (\`provider\`, \`api_key\`, \`model_name\`, \`is_active\`)
      VALUES ('gemini', ?, ?, 1);
    `, [apiKey, modelName]);
    console.log('[Auto-Init] Đã cấu hình mô hình AI mặc định.');
  }

  console.log('[Auto-Init] ✅ HỆ THỐNG SẴN SÀNG HOẠT ĐỘNG!');
}

