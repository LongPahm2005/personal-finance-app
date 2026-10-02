# Database Schema Documentation: `personal_finance`

Cơ sở dữ liệu: **MySQL 8.0**  
Tên Database: **`personal_finance`**  
Charset/Collation: **utf8mb4 / utf8mb4_0900_ai_ci**

---

## Danh Sách Bảng (9 Bảng)

1. [`categories`](#1-categories) - Danh mục thu / chi
2. [`wallets`](#2-wallets) - Ví tiền và tài khoản tài chính
3. [`transactions`](#3-transactions) - Lịch sử giao dịch thu, chi, chuyển tiền, điều chỉnh
4. [`debts`](#4-debts) - Quản lý công nợ (phải thu / phải trả)
5. [`debt_payments`](#5-debt_payments) - Lịch sử thanh toán công nợ
6. [`budgets`](#6-budgets) - Ngân sách chi tiêu theo giai đoạn
7. [`budget_categories`](#7-budget_categories) - Bảng quan hệ nhiều-nhiều giữa ngân sách và danh mục
8. [`saving_goals`](#8-saving_goals) - Mục tiêu tiết kiệm
9. [`recurring_transactions`](#9-recurring_transactions) - Giao dịch định kỳ tự động

---

## 1. `categories`
Lưu trữ danh mục phân loại giao dịch (thu nhập / chi tiêu).

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `INT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `name` | `VARCHAR(100)` | NO | *NULL* | | | Tên danh mục (ví dụ: Lương, Ăn uống) |
| `type` | `ENUM('income','expense')` | NO | *NULL* | | | Loại danh mục (thu nhập hoặc chi tiêu) |
| `description` | `VARCHAR(255)` | YES | *NULL* | | | Mô tả chi tiết danh mục |
| `is_active` | `TINYINT(1)` | NO | `1` | | | Trạng thái hoạt động (1: active, 0: disabled) |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo bản ghi |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**: Không có.
- **Indexes**: `PRIMARY` trên `id`.

---

## 2. `wallets`
Quản lý các tài khoản hoặc ví tiền (Tiền mặt, Ngân hàng, Ví điện tử,...).

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `INT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `name` | `VARCHAR(100)` | NO | *NULL* | | | Tên ví (ví dụ: Tiền mặt, Vietcombank) |
| `initial_balance` | `DECIMAL(15,2)` | NO | `0.00` | | | Số dư ban đầu lúc khởi tạo ví |
| `current_balance` | `DECIMAL(15,2)` | NO | `0.00` | | | Số dư hiện tại của ví |
| `description` | `VARCHAR(255)` | YES | *NULL* | | | Mô tả chi tiết ví |
| `is_active` | `TINYINT(1)` | NO | `1` | | | Trạng thái (1: đang dùng, 0: ngưng sử dụng) |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo ví |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**: Không có.
- **Indexes**: `PRIMARY` trên `id`.

---

## 3. `transactions`
Lưu trữ toàn bộ biến động tài chính của người dùng.

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `BIGINT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `wallet_id` | `INT` | NO | *NULL* | **MUL** | | Khóa ngoại trỏ đến `wallets(id)` |
| `category_id` | `INT` | YES | *NULL* | **MUL** | | Khóa ngoại trỏ đến `categories(id)` (NULL nếu transfer) |
| `type` | `ENUM('income','expense','transfer','adjustment')` | NO | *NULL* | **MUL** | | Loại giao dịch |
| `amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền giao dịch |
| `transaction_date` | `DATETIME` | NO | *NULL* | **MUL** | | Ngày và giờ phát sinh giao dịch |
| `note` | `VARCHAR(500)` | YES | *NULL* | | | Ghi chú giao dịch |
| `transfer_id` | `BIGINT` | YES | *NULL* | **MUL** | | Khóa liên kết giữa 2 giao dịch chuyển tiền (nếu là transfer) |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo bản ghi |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**:
  - `fk_transactions_wallet`: `wallet_id` → `wallets(id)`
  - `fk_transactions_category`: `category_id` → `categories(id)`
- **Indexes**:
  - `PRIMARY` trên `id`
  - `idx_transactions_wallet` trên `wallet_id`
  - `idx_transactions_category` trên `category_id`
  - `idx_transactions_date` trên `transaction_date`
  - `idx_transactions_type` trên `type`
  - `idx_transactions_transfer` trên `transfer_id`

---

## 4. `debts`
Quản lý các khoản nợ phải thu (Receivable) và nợ phải trả (Payable).

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `BIGINT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `type` | `ENUM('receivable','payable')` | NO | *NULL* | **MUL** | | Loại nợ: người khác nợ mình (receivable) hoặc mình nợ người khác (payable) |
| `person_name` | `VARCHAR(150)` | NO | *NULL* | | | Tên người vay / người cho vay |
| `original_amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền nợ gốc ban đầu |
| `remaining_amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền còn nợ chưa thanh toán |
| `created_date` | `DATE` | NO | *NULL* | | | Ngày tạo khoản nợ |
| `due_date` | `DATE` | YES | *NULL* | **MUL** | | Ngày hạn thanh toán |
| `status` | `ENUM('unpaid','partial','paid','overdue')` | NO | `'unpaid'` | **MUL** | | Trạng thái khoản nợ |
| `description` | `VARCHAR(500)` | YES | *NULL* | | | Mô tả chi tiết khoản nợ |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo bản ghi |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**: Không có.
- **Indexes**:
  - `PRIMARY` trên `id`
  - `idx_debts_type` trên `type`
  - `idx_debts_status` trên `status`
  - `idx_debts_due_date` trên `due_date`

---

## 5. `debt_payments`
Lưu trữ lịch sử các lần trả nợ (trả từng phần hoặc trả hết).

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `BIGINT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `debt_id` | `BIGINT` | NO | *NULL* | **MUL** | | Khóa ngoại trỏ đến `debts(id)` |
| `wallet_id` | `INT` | NO | *NULL* | **MUL** | | Khóa ngoại trỏ đến `wallets(id)` nhận/chi tiền |
| `amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền thanh toán trong lần này |
| `payment_date` | `DATETIME` | NO | *NULL* | **MUL** | | Thời gian thanh toán |
| `note` | `VARCHAR(500)` | YES | *NULL* | | | Ghi chú thanh toán |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo bản ghi |

- **Foreign Keys**:
  - `fk_debt_payments_debt`: `debt_id` → `debts(id)`
  - `fk_debt_payments_wallet`: `wallet_id` → `wallets(id)`
- **Indexes**:
  - `PRIMARY` trên `id`
  - `idx_debt_payments_debt` trên `debt_id`
  - `idx_debt_payments_wallet` trên `wallet_id`
  - `idx_debt_payments_date` trên `payment_date`

---

## 6. `budgets`
Quản lý kế hoạch ngân sách chi tiêu trong một khoảng thời gian xác định.

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `INT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `name` | `VARCHAR(100)` | NO | *NULL* | | | Tên ngân sách (ví dụ: Ngân sách tháng 10) |
| `amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền ngân sách giới hạn |
| `start_date` | `DATE` | NO | *NULL* | | | Ngày bắt đầu áp dụng |
| `end_date` | `DATE` | NO | *NULL* | | | Ngày kết thúc áp dụng |
| `description` | `VARCHAR(255)` | YES | *NULL* | | | Mô tả ngân sách |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**: Không có.
- **Indexes**: `PRIMARY` trên `id`.

---

## 7. `budget_categories`
Bảng trung gian liên kết Ngân sách với một hoặc nhiều Danh mục chi tiêu. Nếu một ngân sách không có dòng nào trong bảng này, ngân sách đó được hiểu là áp dụng cho **toàn bộ chi tiêu**.

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `budget_id` | `INT` | NO | *NULL* | **PRI** | | Khóa ngoại trỏ đến `budgets(id)` |
| `category_id` | `INT` | NO | *NULL* | **PRI** | | Khóa ngoại trỏ đến `categories(id)` |

- **Foreign Keys**:
  - `fk_budget_categories_budget`: `budget_id` → `budgets(id)`
  - `fk_budget_categories_category`: `category_id` → `categories(id)`
- **Indexes**:
  - `PRIMARY` trên tổ hợp `(budget_id, category_id)`
  - `fk_budget_categories_category` trên `category_id`

---

## 8. `saving_goals`
Mục tiêu tiết kiệm tài chính cá nhân.

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `INT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `name` | `VARCHAR(150)` | NO | *NULL* | | | Tên mục tiêu (ví dụ: Mua laptop, Du lịch Nhật Bản) |
| `target_amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền mục tiêu cần đạt được |
| `current_amount` | `DECIMAL(15,2)` | NO | `0.00` | | | Số tiền đã tích lũy hiện tại |
| `target_date` | `DATE` | YES | *NULL* | | | Ngày dự kiến hoàn thành mục tiêu |
| `description` | `VARCHAR(500)` | YES | *NULL* | | | Mô tả chi tiết mục tiêu |
| `status` | `ENUM('active','completed','cancelled')` | NO | `'active'` | | | Trạng thái mục tiêu |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo mục tiêu |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**: Không có.
- **Indexes**: `PRIMARY` trên `id`.

---

## 9. `recurring_transactions`
Cấu hình lịch tự động phát sinh giao dịch định kỳ.

| Column | Type | Nullable | Default | Key | Extra | Mô tả |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| `id` | `INT` | NO | *NULL* | **PRI** | `auto_increment` | Khóa chính |
| `wallet_id` | `INT` | NO | *NULL* | **MUL** | | Khóa ngoại trỏ đến `wallets(id)` |
| `category_id` | `INT` | YES | *NULL* | **MUL** | | Khóa ngoại trỏ đến `categories(id)` |
| `type` | `ENUM('income','expense')` | NO | *NULL* | | | Loại giao dịch tự động |
| `amount` | `DECIMAL(15,2)` | NO | *NULL* | | | Số tiền giao dịch |
| `description` | `VARCHAR(255)` | YES | *NULL* | | | Mô tả hoặc ghi chú |
| `frequency` | `ENUM('daily','weekly','monthly','yearly')` | NO | *NULL* | | | Chu kỳ lặp lại |
| `next_date` | `DATE` | NO | *NULL* | | | Ngày tiếp theo cần tạo giao dịch |
| `is_active` | `TINYINT(1)` | NO | `1` | | | Trạng thái bật/tắt |
| `created_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | | Thời gian tạo cấu hình |
| `updated_at` | `TIMESTAMP` | YES | `CURRENT_TIMESTAMP` | | `on update CURRENT_TIMESTAMP` | Thời gian cập nhật gần nhất |

- **Foreign Keys**:
  - `fk_recurring_wallet`: `wallet_id` → `wallets(id)`
  - `fk_recurring_category`: `category_id` → `categories(id)`
- **Indexes**:
  - `PRIMARY` trên `id`
  - `fk_recurring_wallet` trên `wallet_id`
  - `fk_recurring_category` trên `category_id`
