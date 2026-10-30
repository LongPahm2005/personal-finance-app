/* ==============================================================================
   HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH TÀI CHÍNH CÁ NHÂN BẰNG AI (AI-FDSS)
   Target Database: MySQL 8.0+
   Charset: utf8mb4 / Collation: utf8mb4_unicode_ci
   ============================================================================== */

CREATE DATABASE IF NOT EXISTS `personal_finance`
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `personal_finance`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==============================================================================
-- PHẦN 1: CÁC BẢNG QUẢN LÝ TÀI CHÍNH CỐT LÕI (CORE TABLES)
-- ==============================================================================

-- 1. Bảng danh mục thu/chi
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 2. Bảng ví / tài khoản tiền
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `initial_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `current_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_wallet_initial_balance` CHECK (`initial_balance` >= 0),
  CONSTRAINT `chk_wallet_current_balance` CHECK (`current_balance` >= 0)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 3. Bảng ngân sách
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_budget_amount` CHECK (`amount` > 0),
  CONSTRAINT `chk_budget_date` CHECK (`end_date` >= `start_date`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 4. Bảng liên kết ngân sách - danh mục (N - N)
DROP TABLE IF EXISTS `budget_categories`;
CREATE TABLE `budget_categories` (
  `budget_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  PRIMARY KEY (`budget_id`, `category_id`) USING BTREE,
  INDEX `idx_budget_categories_cat` (`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_budget_cat_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_budget_cat_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 5. Bảng công nợ (Cho vay / Vay nợ)
DROP TABLE IF EXISTS `debts`;
CREATE TABLE `debts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `type` ENUM('receivable', 'payable') NOT NULL,
  `person_name` VARCHAR(150) NOT NULL,
  `original_amount` DECIMAL(15, 2) NOT NULL,
  `remaining_amount` DECIMAL(15, 2) NOT NULL,
  `created_date` DATE NOT NULL,
  `due_date` DATE NULL DEFAULT NULL,
  `status` ENUM('unpaid', 'partial', 'paid', 'overdue') NOT NULL DEFAULT 'unpaid',
  `description` VARCHAR(500) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_debts_type` (`type` ASC) USING BTREE,
  INDEX `idx_debts_status` (`status` ASC) USING BTREE,
  INDEX `idx_debts_due_date` (`due_date` ASC) USING BTREE,
  CONSTRAINT `chk_debt_original_amount` CHECK (`original_amount` > 0),
  CONSTRAINT `chk_debt_remaining_amount` CHECK (`remaining_amount` >= 0 AND `remaining_amount` <= `original_amount`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 6. Bảng thanh toán công nợ
DROP TABLE IF EXISTS `debt_payments`;
CREATE TABLE `debt_payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `debt_id` BIGINT NOT NULL,
  `wallet_id` INT NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `payment_date` DATETIME NOT NULL,
  `note` VARCHAR(500) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_debt_payments_debt` (`debt_id` ASC) USING BTREE,
  INDEX `idx_debt_payments_wallet` (`wallet_id` ASC) USING BTREE,
  INDEX `idx_debt_payments_date` (`payment_date` ASC) USING BTREE,
  CONSTRAINT `fk_debt_payments_debt` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_debt_payments_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_debt_payment_amount` CHECK (`amount` > 0)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 7. Bảng mục tiêu tiết kiệm
DROP TABLE IF EXISTS `saving_goals`;
CREATE TABLE `saving_goals` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `target_amount` DECIMAL(15, 2) NOT NULL,
  `current_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `target_date` DATE NULL DEFAULT NULL,
  `description` VARCHAR(500) NULL DEFAULT NULL,
  `status` ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_saving_target` CHECK (`target_amount` > 0),
  CONSTRAINT `chk_saving_current` CHECK (`current_amount` >= 0 AND `current_amount` <= `target_amount`)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 8. Bảng giao dịch tài chính (Thu, chi, chuyển tiền, điều chỉnh)
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `wallet_id` INT NOT NULL,
  `category_id` INT NULL DEFAULT NULL,
  `type` ENUM('income', 'expense', 'transfer', 'adjustment') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `transaction_date` DATETIME NOT NULL,
  `note` VARCHAR(500) NULL DEFAULT NULL,
  `transfer_id` BIGINT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_transactions_wallet` (`wallet_id` ASC) USING BTREE,
  INDEX `idx_transactions_category` (`category_id` ASC) USING BTREE,
  INDEX `idx_transactions_date` (`transaction_date` ASC) USING BTREE,
  INDEX `idx_transactions_type` (`type` ASC) USING BTREE,
  INDEX `idx_transactions_transfer` (`transfer_id` ASC) USING BTREE,
  CONSTRAINT `fk_transactions_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_transactions_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_transactions_amount` CHECK (`amount` > 0)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 9. Bảng giao dịch định kỳ
DROP TABLE IF EXISTS `recurring_transactions`;
CREATE TABLE `recurring_transactions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `wallet_id` INT NOT NULL,
  `category_id` INT NULL DEFAULT NULL,
  `type` ENUM('income', 'expense') NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `frequency` ENUM('daily', 'weekly', 'monthly', 'yearly') NOT NULL,
  `next_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_recurring_wallet` (`wallet_id` ASC) USING BTREE,
  INDEX `idx_recurring_category` (`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_recurring_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_recurring_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_recurring_amount` CHECK (`amount` > 0)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;


-- ==============================================================================
-- PHẦN 2: CÁC BẢNG CHO HỆ THỐNG HỖ TRỢ RA QUYẾT ĐỊNH BẰNG AI (AI-DSS TABLES)
-- ==============================================================================

-- 10. Bảng Hồ sơ tài chính & Khẩu vị rủi ro người dùng (User Profiling)
DROP TABLE IF EXISTS `ai_user_profiles`;
CREATE TABLE `ai_user_profiles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `risk_tolerance` ENUM('conservative', 'moderate', 'aggressive') NOT NULL DEFAULT 'moderate' 
    COMMENT 'Khẩu vị rủi ro: thận trọng, trung hòa, mạo hiểm',
  `monthly_baseline_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00 
    COMMENT 'Thu nhập định kỳ cơ sở',
  `emergency_fund_target_months` INT NOT NULL DEFAULT 6 
    COMMENT 'Số tháng chi tiêu cần dự phòng cho quỹ khẩn cấp',
  `financial_health_score` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 
    COMMENT 'Điểm sức khỏe tài chính AI đánh giá (thang điểm 0 - 100)',
  `financial_priorities` JSON NULL 
    COMMENT 'Mảng JSON thứ tự ưu tiên: ["emergency_fund", "debt_payoff", "savings", "investing"]',
  `last_analyzed_at` DATETIME NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 11. Bảng Khuyến nghị & Quyết định tài chính thông minh (Actionable Recommendations)
DROP TABLE IF EXISTS `ai_recommendations`;
CREATE TABLE `ai_recommendations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `type` ENUM(
    'budget_adjustment',    -- Điều chỉnh hạn mức ngân sách
    'debt_strategy',        -- Chiến lược trả nợ (Snowball/Avalanche)
    'spending_cut',         -- Cắt giảm danh mục chi tiêu hoang phí
    'saving_boost',         -- Tối ưu hóa khoản tiết kiệm hàng tháng
    'emergency_fund_alert', -- Cảnh báo quỹ khẩn cấp không an toàn
    'cashflow_warning'      -- Cảnh báo thâm hụt tiền mặt ngắn hạn
  ) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `detailed_reasoning` TEXT NULL COMMENT 'Lập luận, căn cứ số liệu AI đưa ra quyết định (Explainable AI)',
  `potential_savings` DECIMAL(15, 2) NULL DEFAULT 0.00 COMMENT 'Số tiền tối ưu hoặc tiết kiệm được',
  `action_payload` JSON NULL COMMENT 'Payload dữ liệu JSON sẵn sàng để áp dụng ngay 1-click vào DB',
  `status` ENUM('pending', 'accepted', 'rejected', 'dismissed') NOT NULL DEFAULT 'pending' 
    COMMENT 'Phản hồi của người dùng',
  `confidence_score` DECIMAL(4, 3) NOT NULL DEFAULT 1.000 COMMENT 'Độ tin cậy của thuật toán/mô hình (0.000 - 1.000)',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `applied_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ai_rec_status` (`status` ASC) USING BTREE,
  INDEX `idx_ai_rec_type` (`type` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 12. Bảng Dự báo dòng tiền tương lai (Cashflow Forecasting)
DROP TABLE IF EXISTS `ai_cashflow_forecasts`;
CREATE TABLE `ai_cashflow_forecasts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `forecast_period` VARCHAR(20) NOT NULL COMMENT 'Kỳ dự báo (vd: 2026-11, 2026-12, 2027-Q1)',
  `predicted_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `predicted_expense` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `predicted_ending_balance` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `lower_bound_balance` DECIMAL(15, 2) NULL DEFAULT 0.00 COMMENT 'Biên dưới khoảng tin cậy 95%',
  `upper_bound_balance` DECIMAL(15, 2) NULL DEFAULT 0.00 COMMENT 'Biên trên khoảng tin cậy 95%',
  `model_name` VARCHAR(50) NULL DEFAULT 'Time-Series/ARIMA' COMMENT 'Tên mô hình/thuật toán dự báo',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_forecast_period` (`forecast_period` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 13. Bảng Mô phỏng kịch bản giả định What-If (Decision Scenarios)
DROP TABLE IF EXISTS `ai_scenarios`;
CREATE TABLE `ai_scenarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL COMMENT 'Tên kịch bản (vd: Mua xe trả góp, Giảm 30% lương)',
  `scenario_type` ENUM('income_loss', 'large_expense', 'inflation', 'career_change', 'custom') NOT NULL,
  `parameters` JSON NOT NULL COMMENT 'Dữ liệu đầu vào mô phỏng (khoản chi mới, % thay đổi lương, số tháng)',
  `simulation_result` JSON NOT NULL COMMENT 'Kết quả chạy mô phỏng (tác động dòng tiền, quỹ khẩn cấp, ngày vỡ nợ)',
  `ai_evaluation` TEXT NULL COMMENT 'Đánh giá tính khả thi và khuyến nghị của AI cho kịch bản',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 14. Bảng Phát hiện chi tiêu và giao dịch bất thường (Anomaly Detection)
DROP TABLE IF EXISTS `ai_anomalies`;
CREATE TABLE `ai_anomalies` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `transaction_id` BIGINT NULL DEFAULT NULL,
  `category_id` INT NULL DEFAULT NULL,
  `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `anomaly_type` VARCHAR(100) NOT NULL COMMENT 'overspending_category, spike_amount, frequency_surge',
  `description` VARCHAR(500) NOT NULL,
  `suggested_action` VARCHAR(500) NULL DEFAULT NULL,
  `is_resolved` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_anomaly_trans` (`transaction_id` ASC) USING BTREE,
  INDEX `idx_anomaly_severity` (`severity` ASC) USING BTREE,
  CONSTRAINT `fk_ai_anomalies_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT,
  CONSTRAINT `fk_ai_anomalies_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 15. Bảng Phiên hỏi đáp Trợ lý tài chính AI (AI Chat Sessions)
DROP TABLE IF EXISTS `ai_chat_sessions`;
CREATE TABLE `ai_chat_sessions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL DEFAULT 'Phiên tư vấn tài chính',
  `context_summary` TEXT NULL COMMENT 'Tóm tắt tình trạng tài chính được nạp vào prompt ngữ cảnh',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 16. Bảng Tin nhắn tư vấn tài chính (AI Chat Messages)
DROP TABLE IF EXISTS `ai_chat_messages`;
CREATE TABLE `ai_chat_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `session_id` BIGINT NOT NULL,
  `role` ENUM('user', 'assistant', 'system') NOT NULL,
  `content` MEDIUMTEXT NOT NULL,
  `referenced_data` JSON NULL COMMENT 'Truy vấn/Dữ liệu tài chính RAG trích xuất để làm căn cứ trả lời',
  `tokens_used` INT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_ai_messages_session` (`session_id` ASC) USING BTREE,
  CONSTRAINT `fk_ai_chat_messages_session` FOREIGN KEY (`session_id`) REFERENCES `ai_chat_sessions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- 17. Bảng Cấu hình API Key & Tham số mô hình AI (AI Provider & API Configurations)
DROP TABLE IF EXISTS `ai_configs`;
CREATE TABLE `ai_configs` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `provider` VARCHAR(50) NOT NULL DEFAULT 'gemini' COMMENT 'gemini, openai, anthropic, deepseek, local',
  `api_key` VARCHAR(255) NOT NULL COMMENT 'Khóa API Key của dịch vụ AI',
  `model_name` VARCHAR(100) NOT NULL DEFAULT 'gemini-1.5-flash' COMMENT 'Model AI sử dụng',
  `endpoint_url` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Endpoint tùy chỉnh nếu dùng proxy hoặc local LLM',
  `temperature` DECIMAL(3, 2) NOT NULL DEFAULT 0.70,
  `max_tokens` INT NOT NULL DEFAULT 2048,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1: Đang kích hoạt sử dụng, 0: Ngưng',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;


-- ==============================================================================
-- PHẦN 3: DỮ LIỆU KHỞI TẠO MẪU (SEED DATA) ĐỂ DEMO VÀ KIỂM THỬ HỆ THỐNG
-- ==============================================================================

-- 1. Danh mục thu/chi mặc định
INSERT INTO `categories` (`id`, `name`, `type`, `description`) VALUES
(1, 'Lương', 'income', 'Thu nhập từ lương hàng tháng'),
(2, 'Gia đình', 'income', 'Tiền gia đình gửi hoặc chu cấp'),
(3, 'Freelance', 'income', 'Thu nhập từ các dự án phụ / làm thêm'),
(4, 'Thưởng', 'income', 'Tiền thưởng hiệu quả công việc, lễ tết'),
(5, 'Đầu tư', 'income', 'Lãi tiết kiệm, cổ tức, lợi nhuận đầu tư'),
(6, 'Khác (Thu)', 'income', 'Các khoản thu nhập khác'),
(7, 'Ăn uống', 'expense', 'Ăn uống hàng ngày, cà phê, liên hoan'),
(8, 'Đi lại', 'expense', 'Xăng xe, xe buýt, taxi, bảo dưỡng xe'),
(9, 'Nhà ở & Tiện ích', 'expense', 'Tiền thuê nhà, điện, nước, internet'),
(10, 'Học tập & Phát triển', 'expense', 'Sách, khóa học, học phí, chứng chỉ'),
(11, 'Mua sắm cá nhân', 'expense', 'Quần áo, đồ gia dụng, thiết bị công nghệ'),
(12, 'Giải trí & Sở thích', 'expense', 'Xem phim, game, du lịch, hội họp bạn bè'),
(13, 'Sức khỏe', 'expense', 'Khám bệnh, thuốc men, bảo hiểm y tế'),
(14, 'Khác (Chi)', 'expense', 'Các khoản chi tiêu phát sinh khác');

-- 2. Ví mẫu
INSERT INTO `wallets` (`id`, `name`, `initial_balance`, `current_balance`, `description`) VALUES
(1, 'Tiền mặt', 2000000.00, 2000000.00, 'Ví tiền mặt hàng ngày'),
(2, 'Vietcombank', 25000000.00, 25000000.00, 'Tài khoản nhận lương chính'),
(3, 'Ví MoMo', 1500000.00, 1500000.00, 'Ví điện tử thanh toán online');

-- 3. Hồ sơ tài chính AI mẫu
INSERT INTO `ai_user_profiles` (`id`, `risk_tolerance`, `monthly_baseline_income`, `emergency_fund_target_months`, `financial_health_score`, `financial_priorities`) VALUES
(1, 'moderate', 20000000.00, 6, 74.50, '["emergency_fund", "debt_payoff", "savings"]');

-- 4. Khuyến nghị AI mẫu (Minh họa tính năng Decision Support)
INSERT INTO `ai_recommendations` (`type`, `title`, `summary`, `detailed_reasoning`, `potential_savings`, `action_payload`, `status`, `confidence_score`) VALUES
(
  'spending_cut',
  'Cắt giảm 25% chi phí Ăn uống ngoài hàng',
  'Chi tiêu ăn uống tháng này đang chiếm 45% tổng chi, vượt ngưỡng an toàn 30%.',
  'Dựa trên phân tích 3 tháng gần nhất, bạn chi trung bình 6.000.000đ cho ăn uống nhà hàng và đặt app. Nếu giảm 2 lần ăn ngoài mỗi tuần, bạn sẽ tiết kiệm được 1.500.000đ/tháng để đẩy nhanh mục tiêu tiết kiệm.',
  1500000.00,
  '{"target_category_id": 7, "suggested_budget": 4500000}',
  'pending',
  0.920
),
(
  'debt_strategy',
  'Áp dụng chiến lược Snowball cho khoản nợ thẻ tín dụng',
  'Ưu tiên trả dứt điểm khoản nợ nhỏ nhất để tạo động lực và giảm áp lực trả lãi.',
  'Hệ thống ghi nhận bạn có 2 khoản nợ. Khoản nợ người quen 3.000.000đ không lãi, khoản thẻ tín dụng 5.000.000đ lãi suất 25%/năm. Nên dồn tiền trả dứt điểm nợ thẻ trong 2 tháng để tránh mất thêm 520.000đ tiền lãi phát sinh.',
  520000.00,
  '{"recommended_debt_id": 1, "suggested_monthly_payment": 2500000}',
  'pending',
  0.965
);

-- 5. Dự báo dòng tiền mẫu
INSERT INTO `ai_cashflow_forecasts` (`forecast_period`, `predicted_income`, `predicted_expense`, `predicted_ending_balance`, `lower_bound_balance`, `upper_bound_balance`, `model_name`) VALUES
('2026-11', 22000000.00, 14500000.00, 36000000.00, 33500000.00, 38500000.00, 'Time-Series/ARIMA'),
('2026-12', 25000000.00, 18000000.00, 43000000.00, 39000000.00, 47000000.00, 'Time-Series/ARIMA'),
('2027-01', 20000000.00, 15000000.00, 48000000.00, 44000000.00, 52000000.00, 'Time-Series/ARIMA');

-- 6. Kịch bản What-If mẫu
INSERT INTO `ai_scenarios` (`name`, `scenario_type`, `parameters`, `simulation_result`, `ai_evaluation`) VALUES
(
  'Mua iPhone 16 Pro Max trả góp',
  'large_expense',
  '{"purchase_price": 32000000, "down_payment": 10000000, "installment_months": 12, "monthly_payment": 2100000}',
  '{"ending_emergency_fund_months": 3.8, "cashflow_impact": "tight", "saving_delay_months": 4}',
  'Kịch bản này làm quỹ dự phòng giảm từ 5.5 tháng xuống còn 3.8 tháng. Nếu thu nhập duy trì ổn định thì khả thi, nhưng dòng tiền dư hàng tháng sẽ giảm chỉ còn 1.400.000đ.'
);

-- 7. Phiên chat tư vấn AI mẫu
INSERT INTO `ai_chat_sessions` (`id`, `title`, `context_summary`) VALUES
(1, 'Tư vấn kế hoạch mua xe máy cuối năm', 'Số dư hiện tại: 28.5M, Tiết kiệm trung bình: 4M/tháng, Mục tiêu: 40M vào tháng 12/2026');

INSERT INTO `ai_chat_messages` (`session_id`, `role`, `content`, `referenced_data`, `tokens_used`) VALUES
(1, 'user', 'Với tốc độ tiết kiệm hiện tại, liệu tháng 12 tôi có đủ 40 triệu để mua xe không?', NULL, 28),
(1, 'assistant', 'Chào bạn! Theo dữ liệu phân tích dòng tiền 3 tháng qua:\n- Số dư khả dụng hiện tại: 28.500.000đ\n- Thặng dư trung bình mỗi tháng: ~4.200.000đ\n\nTừ giờ đến cuối tháng 12 (còn 2 tháng), bạn dự kiến sẽ tích lũy thêm khoảng 8.400.000đ, nâng tổng số dư lên 36.900.000đ. \n\n👉 **Khuyến nghị:** Bạn vẫn còn thiếu khoảng 3.100.000đ để đạt mốc 40 triệu. AI gợi ý bạn có thể cắt giảm 1.500.000đ/tháng từ danh mục Ăn uống ngoài hàng và Giải trí trong 2 tháng tới để cán đích đúng hạn mà không cần phải vay mượn!', '{"current_balance": 28500000, "projected_savings_monthly": 4200000, "target": 40000000}', 315);

-- 8. Cấu hình AI mẫu (Người dùng có thể cập nhật key qua giao diện hoặc .env)
INSERT INTO `ai_configs` (`id`, `provider`, `api_key`, `model_name`, `temperature`, `max_tokens`, `is_active`) VALUES
(1, 'gemini', 'YOUR_AI_API_KEY_HERE', 'gemini-1.5-flash', 0.70, 2048, 1);


