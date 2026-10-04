/*
 Legacy MySQL schema and sample-data export. Do not run against production data.

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : localhost:3306
 Source Schema         : personal_finance

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 03/10/2026 00:03:54
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for budget_categories
-- ----------------------------
DROP TABLE IF EXISTS `budget_categories`;
CREATE TABLE `budget_categories`  (
  `budget_id` int NOT NULL,
  `category_id` int NOT NULL,
  PRIMARY KEY (`budget_id`, `category_id`) USING BTREE,
  INDEX `fk_budget_categories_category`(`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_budget_categories_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_budget_categories_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for budgets
-- ----------------------------
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15, 2) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_budget_amount` CHECK (`amount` > 0),
  CONSTRAINT `chk_budget_date` CHECK (`end_date` >= `start_date`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('income','expense') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 20 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for debt_payments
-- ----------------------------
DROP TABLE IF EXISTS `debt_payments`;
CREATE TABLE `debt_payments`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `debt_id` bigint NOT NULL,
  `wallet_id` int NOT NULL,
  `amount` decimal(15, 2) NOT NULL,
  `payment_date` datetime NOT NULL,
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_debt_payments_debt`(`debt_id` ASC) USING BTREE,
  INDEX `idx_debt_payments_wallet`(`wallet_id` ASC) USING BTREE,
  INDEX `idx_debt_payments_date`(`payment_date` ASC) USING BTREE,
  CONSTRAINT `fk_debt_payments_debt` FOREIGN KEY (`debt_id`) REFERENCES `debts` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_debt_payments_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_debt_payment_amount` CHECK (`amount` > 0)
) ENGINE = InnoDB AUTO_INCREMENT = 19 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for debts
-- ----------------------------
DROP TABLE IF EXISTS `debts`;
CREATE TABLE `debts`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` enum('receivable','payable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `person_name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_amount` decimal(15, 2) NOT NULL,
  `remaining_amount` decimal(15, 2) NOT NULL,
  `created_date` date NOT NULL,
  `due_date` date NULL DEFAULT NULL,
  `status` enum('unpaid','partial','paid','overdue') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_debts_type`(`type` ASC) USING BTREE,
  INDEX `idx_debts_status`(`status` ASC) USING BTREE,
  INDEX `idx_debts_due_date`(`due_date` ASC) USING BTREE,
  CONSTRAINT `chk_debt_original_amount` CHECK (`original_amount` > 0),
  CONSTRAINT `chk_debt_remaining_amount` CHECK ((`remaining_amount` >= 0) and (`remaining_amount` <= `original_amount`))
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for recurring_transactions
-- ----------------------------
DROP TABLE IF EXISTS `recurring_transactions`;
CREATE TABLE `recurring_transactions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `category_id` int NULL DEFAULT NULL,
  `type` enum('income','expense') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15, 2) NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `frequency` enum('daily','weekly','monthly','yearly') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `next_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_recurring_wallet`(`wallet_id` ASC) USING BTREE,
  INDEX `fk_recurring_category`(`category_id` ASC) USING BTREE,
  CONSTRAINT `fk_recurring_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_recurring_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_recurring_amount` CHECK (`amount` > 0)
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for saving_goals
-- ----------------------------
DROP TABLE IF EXISTS `saving_goals`;
CREATE TABLE `saving_goals`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_amount` decimal(15, 2) NOT NULL,
  `current_amount` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `target_date` date NULL DEFAULT NULL,
  `description` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `status` enum('active','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_saving_current` CHECK ((`current_amount` >= 0) and (`current_amount` <= `target_amount`)),
  CONSTRAINT `chk_saving_target` CHECK (`target_amount` > 0)
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for transactions
-- ----------------------------
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `wallet_id` int NOT NULL,
  `category_id` int NULL DEFAULT NULL,
  `type` enum('income','expense','transfer','adjustment') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15, 2) NOT NULL,
  `transaction_date` datetime NOT NULL,
  `note` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `transfer_id` bigint NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_transactions_wallet`(`wallet_id` ASC) USING BTREE,
  INDEX `idx_transactions_category`(`category_id` ASC) USING BTREE,
  INDEX `idx_transactions_date`(`transaction_date` ASC) USING BTREE,
  INDEX `idx_transactions_type`(`type` ASC) USING BTREE,
  INDEX `idx_transactions_transfer`(`transfer_id` ASC) USING BTREE,
  CONSTRAINT `fk_transactions_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_transactions_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `chk_transactions_amount` CHECK (`amount` > 0)
) ENGINE = InnoDB AUTO_INCREMENT = 12 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for wallets
-- ----------------------------
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `initial_balance` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `current_balance` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  CONSTRAINT `chk_wallet_current_balance` CHECK (`current_balance` >= 0),
  CONSTRAINT `chk_wallet_initial_balance` CHECK (`initial_balance` >= 0)
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (name, type, description) VALUES
('Lương', 'income', 'Thu nhập từ lương'),
('Gia đình', 'income', 'Tiền gia đình gửi'),
('Freelance', 'income', 'Thu nhập freelance'),
('Thưởng', 'income', 'Tiền thưởng'),
('Khác', 'income', 'Thu nhập khác'),

('Ăn uống', 'expense', 'Ăn uống hàng ngày'),
('Đi lại', 'expense', 'Xăng xe, xe buýt, taxi...'),
('Học tập', 'expense', 'Sách, khóa học, học phí...'),
('Nhà ở', 'expense', 'Tiền thuê nhà'),
('Điện nước', 'expense', 'Điện, nước'),
('Internet', 'expense', 'Internet'),
('Mua sắm', 'expense', 'Mua sắm cá nhân'),
('Giải trí', 'expense', 'Đi chơi, xem phim...'),
('Game', 'expense', 'Game và vật phẩm'),
('Sức khỏe', 'expense', 'Thuốc, khám bệnh...'),
('Du lịch', 'expense', 'Chi phí du lịch');