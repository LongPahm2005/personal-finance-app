-- Add missing AI tables only. Review and approve before applying.
-- No DROP, ALTER, replacement data or financial demo data.
-- Select the configured application database before running.

CREATE TABLE IF NOT EXISTS `ai_user_profiles` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `risk_tolerance` ENUM('conservative', 'moderate', 'aggressive') NOT NULL DEFAULT 'moderate',
      `monthly_baseline_income` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      `emergency_fund_target_months` INT NOT NULL DEFAULT 6,
      `financial_health_score` DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
      `financial_priorities` JSON NULL,
      `last_analyzed_at` TIMESTAMP NULL DEFAULT NULL,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE,
      CONSTRAINT `chk_profile_health_score` CHECK (`financial_health_score` >= 0 AND `financial_health_score` <= 100)
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_recommendations` (
      `id` BIGINT NOT NULL AUTO_INCREMENT,
      `type` VARCHAR(50) NOT NULL,
      `title` VARCHAR(200) NOT NULL,
      `summary` TEXT NOT NULL,
      `detailed_reasoning` TEXT NULL,
      `potential_savings` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
      `action_payload` JSON NULL,
      `status` ENUM('pending', 'accepted', 'rejected', 'dismissed') NOT NULL DEFAULT 'pending',
      `confidence_score` DECIMAL(3, 2) NOT NULL DEFAULT 0.85,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      `applied_at` TIMESTAMP NULL DEFAULT NULL,
      PRIMARY KEY (`id`) USING BTREE,
      INDEX `idx_ai_recs_status` (`status` ASC) USING BTREE,
      INDEX `idx_ai_recs_type` (`type` ASC) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_cashflow_forecasts` (
      `id` BIGINT NOT NULL AUTO_INCREMENT,
      `forecast_period` VARCHAR(7) NOT NULL,
      `predicted_income` DECIMAL(15, 2) NOT NULL,
      `predicted_expense` DECIMAL(15, 2) NOT NULL,
      `predicted_ending_balance` DECIMAL(15, 2) NOT NULL,
      `lower_bound_balance` DECIMAL(15, 2) NOT NULL,
      `upper_bound_balance` DECIMAL(15, 2) NOT NULL,
      `model_name` VARCHAR(100) NOT NULL DEFAULT 'AI/Time-Series',
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE,
      UNIQUE INDEX `idx_forecast_period` (`forecast_period` ASC) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_scenarios` (
      `id` BIGINT NOT NULL AUTO_INCREMENT,
      `name` VARCHAR(150) NOT NULL,
      `scenario_type` VARCHAR(50) NOT NULL,
      `parameters` JSON NOT NULL,
      `simulation_result` JSON NOT NULL,
      `ai_evaluation` TEXT NOT NULL,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_anomalies` (
      `id` BIGINT NOT NULL AUTO_INCREMENT,
      `transaction_id` BIGINT NULL DEFAULT NULL,
      `category_id` INT NULL DEFAULT NULL,
      `severity` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
      `anomaly_type` VARCHAR(50) NOT NULL,
      `description` VARCHAR(500) NOT NULL,
      `suggested_action` VARCHAR(500) NULL DEFAULT NULL,
      `is_resolved` TINYINT(1) NOT NULL DEFAULT 0,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE,
      INDEX `idx_ai_anomalies_resolved` (`is_resolved` ASC) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_chat_sessions` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `title` VARCHAR(150) NOT NULL DEFAULT 'Hội thoại mới',
      `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_chat_messages` (
      `id` BIGINT NOT NULL AUTO_INCREMENT,
      `session_id` INT NOT NULL,
      `role` ENUM('user', 'assistant', 'system') NOT NULL,
      `content` TEXT NOT NULL,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE,
      INDEX `idx_chat_session` (`session_id` ASC) USING BTREE,
      CONSTRAINT `fk_ai_chat_session` FOREIGN KEY (`session_id`) REFERENCES `ai_chat_sessions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ai_configs` (
      `id` INT NOT NULL AUTO_INCREMENT,
      `provider` VARCHAR(50) NOT NULL DEFAULT 'gemini',
      `api_key` VARCHAR(255) NOT NULL,
      `model_name` VARCHAR(100) NOT NULL DEFAULT 'gemini-3-flash-preview',
      `endpoint_url` VARCHAR(255) NULL DEFAULT NULL,
      `temperature` DECIMAL(3, 2) NOT NULL DEFAULT 0.70,
      `max_tokens` INT NOT NULL DEFAULT 2048,
      `is_active` TINYINT(1) NOT NULL DEFAULT 1,
      `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`) USING BTREE
    ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
