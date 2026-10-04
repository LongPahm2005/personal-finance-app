import type { DatabaseSync } from 'node:sqlite';

export const MONEY_MINOR_UNITS_PER_UNIT = 100;

const schema = `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS wallets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    initial_balance_minor_units INTEGER NOT NULL DEFAULT 0 CHECK (initial_balance_minor_units >= 0),
    current_balance_minor_units INTEGER NOT NULL DEFAULT 0 CHECK (current_balance_minor_units >= 0),
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id INTEGER NOT NULL,
    category_id INTEGER,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer', 'adjustment')),
    amount_minor_units INTEGER NOT NULL CHECK (amount_minor_units > 0),
    transaction_date TEXT NOT NULL,
    note TEXT,
    transfer_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE RESTRICT ON UPDATE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount_minor_units INTEGER NOT NULL CHECK (amount_minor_units > 0),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL CHECK (end_date >= start_date),
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS budget_categories (
    budget_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (budget_id, category_id),
    FOREIGN KEY (budget_id) REFERENCES budgets (id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('receivable', 'payable')),
    person_name TEXT NOT NULL,
    original_amount_minor_units INTEGER NOT NULL CHECK (original_amount_minor_units > 0),
    remaining_amount_minor_units INTEGER NOT NULL CHECK (
      remaining_amount_minor_units >= 0
      AND remaining_amount_minor_units <= original_amount_minor_units
    ),
    created_date TEXT NOT NULL,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'overdue')),
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS debt_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id INTEGER NOT NULL,
    wallet_id INTEGER NOT NULL,
    amount_minor_units INTEGER NOT NULL CHECK (amount_minor_units > 0),
    payment_date TEXT NOT NULL,
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (debt_id) REFERENCES debts (id) ON DELETE CASCADE ON UPDATE RESTRICT,
    FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE RESTRICT ON UPDATE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS saving_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    target_amount_minor_units INTEGER NOT NULL CHECK (target_amount_minor_units > 0),
    current_amount_minor_units INTEGER NOT NULL DEFAULT 0 CHECK (
      current_amount_minor_units >= 0
      AND current_amount_minor_units <= target_amount_minor_units
    ),
    target_date TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS recurring_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wallet_id INTEGER NOT NULL,
    category_id INTEGER,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount_minor_units INTEGER NOT NULL CHECK (amount_minor_units > 0),
    description TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    next_date TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    FOREIGN KEY (wallet_id) REFERENCES wallets (id) ON DELETE RESTRICT ON UPDATE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions (wallet_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
  CREATE INDEX IF NOT EXISTS idx_transactions_transfer ON transactions (transfer_id);
  CREATE INDEX IF NOT EXISTS idx_budget_categories_category ON budget_categories (category_id);
  CREATE INDEX IF NOT EXISTS idx_debts_type ON debts (type);
  CREATE INDEX IF NOT EXISTS idx_debts_status ON debts (status);
  CREATE INDEX IF NOT EXISTS idx_debts_due_date ON debts (due_date);
  CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments (debt_id);
  CREATE INDEX IF NOT EXISTS idx_debt_payments_wallet ON debt_payments (wallet_id);
  CREATE INDEX IF NOT EXISTS idx_debt_payments_date ON debt_payments (payment_date);
  CREATE INDEX IF NOT EXISTS idx_recurring_wallet ON recurring_transactions (wallet_id);
  CREATE INDEX IF NOT EXISTS idx_recurring_category ON recurring_transactions (category_id);

  CREATE TRIGGER IF NOT EXISTS categories_updated_at
  AFTER UPDATE OF name, type, description, is_active ON categories
  BEGIN
    UPDATE categories SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS wallets_updated_at
  AFTER UPDATE OF name, initial_balance_minor_units, current_balance_minor_units, description, is_active ON wallets
  BEGIN
    UPDATE wallets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS transactions_updated_at
  AFTER UPDATE OF wallet_id, category_id, type, amount_minor_units, transaction_date, note, transfer_id ON transactions
  BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS budgets_updated_at
  AFTER UPDATE OF name, amount_minor_units, start_date, end_date, description ON budgets
  BEGIN
    UPDATE budgets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS debts_updated_at
  AFTER UPDATE OF type, person_name, original_amount_minor_units, remaining_amount_minor_units, created_date, due_date, status, description ON debts
  BEGIN
    UPDATE debts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS saving_goals_updated_at
  AFTER UPDATE OF name, target_amount_minor_units, current_amount_minor_units, target_date, description, status ON saving_goals
  BEGIN
    UPDATE saving_goals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE TRIGGER IF NOT EXISTS recurring_transactions_updated_at
  AFTER UPDATE OF wallet_id, category_id, type, amount_minor_units, description, frequency, next_date, is_active ON recurring_transactions
  BEGIN
    UPDATE recurring_transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

  CREATE VIEW IF NOT EXISTS categories_api AS
    SELECT * FROM categories;
  CREATE VIEW IF NOT EXISTS wallets_api AS
    SELECT id, name,
      initial_balance_minor_units / 100.0 AS initial_balance,
      current_balance_minor_units / 100.0 AS current_balance,
      description, is_active, created_at, updated_at
    FROM wallets;
  CREATE VIEW IF NOT EXISTS transactions_api AS
    SELECT id, wallet_id, category_id, type,
      amount_minor_units / 100.0 AS amount,
      transaction_date, note, transfer_id, created_at, updated_at
    FROM transactions;
  CREATE VIEW IF NOT EXISTS budgets_api AS
    SELECT id, name, amount_minor_units / 100.0 AS amount,
      start_date, end_date, description, created_at, updated_at
    FROM budgets;
  CREATE VIEW IF NOT EXISTS budget_categories_api AS
    SELECT budget_id, category_id FROM budget_categories;
  CREATE VIEW IF NOT EXISTS debts_api AS
    SELECT id, type, person_name,
      original_amount_minor_units / 100.0 AS original_amount,
      remaining_amount_minor_units / 100.0 AS remaining_amount,
      created_date, due_date, status, description, created_at, updated_at
    FROM debts;
  CREATE VIEW IF NOT EXISTS debt_payments_api AS
    SELECT id, debt_id, wallet_id,
      amount_minor_units / 100.0 AS amount,
      payment_date, note, created_at
    FROM debt_payments;
  CREATE VIEW IF NOT EXISTS saving_goals_api AS
    SELECT id, name,
      target_amount_minor_units / 100.0 AS target_amount,
      current_amount_minor_units / 100.0 AS current_amount,
      target_date, description, status, created_at, updated_at
    FROM saving_goals;
  CREATE VIEW IF NOT EXISTS recurring_transactions_api AS
    SELECT id, wallet_id, category_id, type,
      amount_minor_units / 100.0 AS amount,
      description, frequency, next_date, is_active, created_at, updated_at
    FROM recurring_transactions;

  CREATE TRIGGER IF NOT EXISTS categories_api_insert
  INSTEAD OF INSERT ON categories_api
  BEGIN
    INSERT INTO categories (id, name, type, description, is_active, created_at, updated_at)
    VALUES (NEW.id, NEW.name, NEW.type, NEW.description, COALESCE(NEW.is_active, 1),
      COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS categories_api_update
  INSTEAD OF UPDATE ON categories_api
  BEGIN
    UPDATE categories SET name = NEW.name, type = NEW.type, description = NEW.description,
      is_active = NEW.is_active WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS categories_api_delete
  INSTEAD OF DELETE ON categories_api
  BEGIN
    DELETE FROM categories WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS wallets_api_insert
  INSTEAD OF INSERT ON wallets_api
  BEGIN
    INSERT INTO wallets (id, name, initial_balance_minor_units, current_balance_minor_units,
      description, is_active, created_at, updated_at)
    VALUES (NEW.id, NEW.name, ROUND(COALESCE(NEW.initial_balance, 0) * 100),
      ROUND(COALESCE(NEW.current_balance, 0) * 100), NEW.description, COALESCE(NEW.is_active, 1),
      COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS wallets_api_update
  INSTEAD OF UPDATE ON wallets_api
  BEGIN
    UPDATE wallets SET name = NEW.name,
      initial_balance_minor_units = ROUND(NEW.initial_balance * 100),
      current_balance_minor_units = ROUND(NEW.current_balance * 100),
      description = NEW.description, is_active = NEW.is_active
    WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS wallets_api_delete
  INSTEAD OF DELETE ON wallets_api
  BEGIN
    DELETE FROM wallets WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS transactions_api_insert
  INSTEAD OF INSERT ON transactions_api
  BEGIN
    INSERT INTO transactions (id, wallet_id, category_id, type, amount_minor_units,
      transaction_date, note, transfer_id, created_at, updated_at)
    VALUES (NEW.id, NEW.wallet_id, NEW.category_id, NEW.type, ROUND(NEW.amount * 100),
      NEW.transaction_date, NEW.note, NEW.transfer_id,
      COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS transactions_api_update
  INSTEAD OF UPDATE ON transactions_api
  BEGIN
    UPDATE transactions SET wallet_id = NEW.wallet_id, category_id = NEW.category_id,
      type = NEW.type, amount_minor_units = ROUND(NEW.amount * 100),
      transaction_date = NEW.transaction_date, note = NEW.note, transfer_id = NEW.transfer_id
    WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS transactions_api_delete
  INSTEAD OF DELETE ON transactions_api
  BEGIN
    DELETE FROM transactions WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS budgets_api_insert
  INSTEAD OF INSERT ON budgets_api
  BEGIN
    INSERT INTO budgets (id, name, amount_minor_units, start_date, end_date, description, created_at, updated_at)
    VALUES (NEW.id, NEW.name, ROUND(NEW.amount * 100), NEW.start_date, NEW.end_date, NEW.description,
      COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS budgets_api_update
  INSTEAD OF UPDATE ON budgets_api
  BEGIN
    UPDATE budgets SET name = NEW.name, amount_minor_units = ROUND(NEW.amount * 100),
      start_date = NEW.start_date, end_date = NEW.end_date, description = NEW.description
    WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS budgets_api_delete
  INSTEAD OF DELETE ON budgets_api
  BEGIN
    DELETE FROM budgets WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS budget_categories_api_insert
  INSTEAD OF INSERT ON budget_categories_api
  BEGIN
    INSERT INTO budget_categories (budget_id, category_id) VALUES (NEW.budget_id, NEW.category_id);
  END;
  CREATE TRIGGER IF NOT EXISTS budget_categories_api_update
  INSTEAD OF UPDATE ON budget_categories_api
  BEGIN
    UPDATE budget_categories SET budget_id = NEW.budget_id, category_id = NEW.category_id
    WHERE budget_id = OLD.budget_id AND category_id = OLD.category_id;
  END;
  CREATE TRIGGER IF NOT EXISTS budget_categories_api_delete
  INSTEAD OF DELETE ON budget_categories_api
  BEGIN
    DELETE FROM budget_categories WHERE budget_id = OLD.budget_id AND category_id = OLD.category_id;
  END;

  CREATE TRIGGER IF NOT EXISTS debts_api_insert
  INSTEAD OF INSERT ON debts_api
  BEGIN
    INSERT INTO debts (id, type, person_name, original_amount_minor_units,
      remaining_amount_minor_units, created_date, due_date, status, description, created_at, updated_at)
    VALUES (NEW.id, NEW.type, NEW.person_name, ROUND(NEW.original_amount * 100),
      ROUND(NEW.remaining_amount * 100), NEW.created_date, NEW.due_date, COALESCE(NEW.status, 'unpaid'),
      NEW.description, COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS debts_api_update
  INSTEAD OF UPDATE ON debts_api
  BEGIN
    UPDATE debts SET type = NEW.type, person_name = NEW.person_name,
      original_amount_minor_units = ROUND(NEW.original_amount * 100),
      remaining_amount_minor_units = ROUND(NEW.remaining_amount * 100),
      created_date = NEW.created_date, due_date = NEW.due_date, status = NEW.status,
      description = NEW.description WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS debts_api_delete
  INSTEAD OF DELETE ON debts_api
  BEGIN
    DELETE FROM debts WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS debt_payments_api_insert
  INSTEAD OF INSERT ON debt_payments_api
  BEGIN
    INSERT INTO debt_payments (id, debt_id, wallet_id, amount_minor_units, payment_date, note, created_at)
    VALUES (NEW.id, NEW.debt_id, NEW.wallet_id, ROUND(NEW.amount * 100), NEW.payment_date,
      NEW.note, COALESCE(NEW.created_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS debt_payments_api_update
  INSTEAD OF UPDATE ON debt_payments_api
  BEGIN
    UPDATE debt_payments SET debt_id = NEW.debt_id, wallet_id = NEW.wallet_id,
      amount_minor_units = ROUND(NEW.amount * 100), payment_date = NEW.payment_date, note = NEW.note
    WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS debt_payments_api_delete
  INSTEAD OF DELETE ON debt_payments_api
  BEGIN
    DELETE FROM debt_payments WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS saving_goals_api_insert
  INSTEAD OF INSERT ON saving_goals_api
  BEGIN
    INSERT INTO saving_goals (id, name, target_amount_minor_units, current_amount_minor_units,
      target_date, description, status, created_at, updated_at)
    VALUES (NEW.id, NEW.name, ROUND(NEW.target_amount * 100), ROUND(COALESCE(NEW.current_amount, 0) * 100),
      NEW.target_date, NEW.description, COALESCE(NEW.status, 'active'),
      COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS saving_goals_api_update
  INSTEAD OF UPDATE ON saving_goals_api
  BEGIN
    UPDATE saving_goals SET name = NEW.name,
      target_amount_minor_units = ROUND(NEW.target_amount * 100),
      current_amount_minor_units = ROUND(NEW.current_amount * 100),
      target_date = NEW.target_date, description = NEW.description, status = NEW.status
    WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS saving_goals_api_delete
  INSTEAD OF DELETE ON saving_goals_api
  BEGIN
    DELETE FROM saving_goals WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS recurring_transactions_api_insert
  INSTEAD OF INSERT ON recurring_transactions_api
  BEGIN
    INSERT INTO recurring_transactions (id, wallet_id, category_id, type, amount_minor_units,
      description, frequency, next_date, is_active, created_at, updated_at)
    VALUES (NEW.id, NEW.wallet_id, NEW.category_id, NEW.type, ROUND(NEW.amount * 100),
      NEW.description, NEW.frequency, NEW.next_date, COALESCE(NEW.is_active, 1),
      COALESCE(NEW.created_at, CURRENT_TIMESTAMP), COALESCE(NEW.updated_at, CURRENT_TIMESTAMP));
  END;
  CREATE TRIGGER IF NOT EXISTS recurring_transactions_api_update
  INSTEAD OF UPDATE ON recurring_transactions_api
  BEGIN
    UPDATE recurring_transactions SET wallet_id = NEW.wallet_id, category_id = NEW.category_id,
      type = NEW.type, amount_minor_units = ROUND(NEW.amount * 100), description = NEW.description,
      frequency = NEW.frequency, next_date = NEW.next_date, is_active = NEW.is_active
    WHERE id = OLD.id;
  END;
  CREATE TRIGGER IF NOT EXISTS recurring_transactions_api_delete
  INSTEAD OF DELETE ON recurring_transactions_api
  BEGIN
    DELETE FROM recurring_transactions WHERE id = OLD.id;
  END;
`;

const defaultCategories = [
  ['Lương', 'income', 'Thu nhập từ lương'],
  ['Gia đình', 'income', 'Tiền gia đình gửi'],
  ['Freelance', 'income', 'Thu nhập freelance'],
  ['Thưởng', 'income', 'Tiền thưởng'],
  ['Khác', 'income', 'Thu nhập khác'],
  ['Ăn uống', 'expense', 'Ăn uống hàng ngày'],
  ['Đi lại', 'expense', 'Xăng xe, xe buýt, taxi...'],
  ['Học tập', 'expense', 'Sách, khóa học, học phí...'],
  ['Nhà ở', 'expense', 'Tiền thuê nhà'],
  ['Điện nước', 'expense', 'Tiền điện, nước'],
  ['Internet', 'expense', 'Internet'],
  ['Mua sắm', 'expense', 'Mua sắm cá nhân'],
  ['Giải trí', 'expense', 'Đi chơi, xem phim...'],
  ['Game', 'expense', 'Game và vật phẩm'],
  ['Sức khỏe', 'expense', 'Thuốc, khám bệnh...'],
  ['Du lịch', 'expense', 'Chi phí du lịch'],
] as const;

export function initializeSchema(database: DatabaseSync): void {
  database.exec('PRAGMA foreign_keys = ON');
  database.exec('BEGIN IMMEDIATE');

  try {
    database.exec(schema);

    const categoryCount = database.prepare('SELECT COUNT(*) AS count FROM categories').get();
    if (!categoryCount) {
      throw new Error('Could not read the SQLite category count after schema initialization.');
    }

    if (Number(categoryCount.count) === 0) {
      const insertCategory = database.prepare(
        'INSERT INTO categories (name, type, description) VALUES (?, ?, ?)'
      );
      for (const category of defaultCategories) {
        insertCategory.run(...category);
      }
    }

    database.exec('COMMIT');
  } catch (error) {
    try {
      database.exec('ROLLBACK');
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        'SQLite schema initialization failed and its transaction could not be rolled back.'
      );
    }
    throw error;
  }
}
