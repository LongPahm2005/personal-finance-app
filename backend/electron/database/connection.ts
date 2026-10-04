import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { getDatabasePath } from './storage';
import { initializeSchema } from './schema';
import type { ResultSetHeader, RowDataPacket } from './types';

const legacyTables = [
  'budget_categories',
  'recurring_transactions',
  'debt_payments',
  'transactions',
  'saving_goals',
  'categories',
  'wallets',
  'budgets',
  'debts',
] as const;

interface SqliteResultHeader extends ResultSetHeader {
  changes: number;
}

interface SqliteConnection {
  query<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
    sql: string,
    values?: unknown[]
  ): Promise<[T, undefined]>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

interface SqlitePool extends SqliteConnection {
  getConnection(): Promise<SqliteConnection>;
  end(): Promise<void>;
}

let database: DatabaseSync | null = null;
let pool: SqlitePool | null = null;

function dateFormat(value: SQLOutputValue, format: SQLOutputValue): string | null {
  if (value === null || format === null) return null;
  const parts = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/.exec(String(value));
  if (!parts) return String(value);

  const values: Record<string, string> = {
    '%Y': parts[1],
    '%m': parts[2],
    '%d': parts[3],
    '%H': parts[4] || '00',
    '%i': parts[5] || '00',
    '%s': parts[6] || '00',
  };
  return String(format).replace(/%[YmdHis]/g, token => values[token]);
}

function normalizeRows(rows: Record<string, SQLOutputValue>[]): RowDataPacket[] {
  return rows.map(row => Object.fromEntries(
    Object.entries(row).map(([column, value]) => [
      column,
      typeof value === 'number' && !Number.isInteger(value)
        ? Number(value.toFixed(2))
        : value,
    ])
  ));
}

function translateSql(sql: string): string {
  let translated = sql.trim().replace(/;\s*$/, '');

  translated = translated
    .replace(/\bCURRENT_DATE\s*\(\s*\)/gi, "date('now', 'localtime')")
    .replace(/\s+FOR\s+UPDATE\b/gi, '')
    .replace(/=\s*"([^"]*)"/g, "= '$1'")
    .replace(/,\s*"([^"]*)"\s*(?=,|\))/g, ", '$1'")
    .replace(/`(budget_categories|recurring_transactions|debt_payments|transactions|saving_goals|categories|wallets|budgets|debts)`|\b(budget_categories|recurring_transactions|debt_payments|transactions|saving_goals|categories|wallets|budgets|debts)\b/gi, (match, quoted, unquoted) => {
      const table = quoted || unquoted;
      const knownTable = legacyTables.find(item => item.toLowerCase() === String(table).toLowerCase());
      return knownTable ? `${knownTable}_api` : match;
    });
  return translated;
}

function getDatabase(): DatabaseSync {
  if (!database) {
    database = new DatabaseSync(getDatabasePath());
    database.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    database.function('DATE_FORMAT', { deterministic: true }, dateFormat);
    database.function('YEAR', { deterministic: true }, value => {
      if (value === null) return null;
      const year = /^(\d{4})/.exec(String(value))?.[1];
      return year ? Number(year) : null;
    });
    initializeSchema(database);
  }
  return database;
}

function createConnection(): SqliteConnection {
  const db = getDatabase();
  let transactionActive = false;

  return {
    async query<T extends RowDataPacket[] | ResultSetHeader = RowDataPacket[]>(
      sql: string,
      values: unknown[] = []
    ): Promise<[T, undefined]> {
      const query = translateSql(sql);
      const params = values.map((value): SQLInputValue => value === undefined ? null : value as SQLInputValue);
      const isReadQuery = /^(SELECT|PRAGMA|WITH|EXPLAIN)\b/i.test(query);

      if (isReadQuery) {
        const rows = normalizeRows(db.prepare(query).all(...params));
        return [rows as T, undefined];
      }

      const result = db.prepare(query).run(...params);
      const insertedTable = /^INSERT\s+(?:OR\s+\w+\s+)?INTO\s+([A-Za-z_][A-Za-z0-9_]*)/i.exec(query)?.[1];
      const logicalTable = insertedTable?.endsWith('_api')
        ? insertedTable.slice(0, -4)
        : undefined;
      const insertId = logicalTable && [
        'categories',
        'wallets',
        'transactions',
        'budgets',
        'debts',
        'debt_payments',
        'saving_goals',
        'recurring_transactions',
      ].includes(logicalTable)
        ? Number(db.prepare(`SELECT COALESCE(MAX(id), 0) AS id FROM ${logicalTable}`).get()?.id)
        : Number(result.lastInsertRowid);

      const header: SqliteResultHeader = {
        affectedRows: Number(result.changes),
        changedRows: Number(result.changes),
        insertId,
        warningStatus: 0,
        changes: Number(result.changes),
      };
      return [header as unknown as T, undefined];
    },
    async beginTransaction(): Promise<void> {
      if (transactionActive) throw new Error('A SQLite transaction is already active on this connection.');
      db.exec('BEGIN IMMEDIATE');
      transactionActive = true;
    },
    async commit(): Promise<void> {
      if (!transactionActive) throw new Error('There is no active SQLite transaction to commit.');
      db.exec('COMMIT');
      transactionActive = false;
    },
    async rollback(): Promise<void> {
      if (!transactionActive) return;
      db.exec('ROLLBACK');
      transactionActive = false;
    },
    release(): void {
      // SQLite uses one local connection for the lifetime of the app.
    },
  };
}

function getPool(): SqlitePool {
  if (!pool) {
    const connection = createConnection();
    pool = {
      query: connection.query,
      beginTransaction: connection.beginTransaction,
      commit: connection.commit,
      rollback: connection.rollback,
      release: connection.release,
      async getConnection(): Promise<SqliteConnection> {
        return createConnection();
      },
      async end(): Promise<void> {
        closeDatabase();
      },
    };
  }
  return pool;
}

export { getPool };

export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const db = getDatabase();
    const result = db.prepare('PRAGMA quick_check').get();
    if (result?.quick_check !== 'ok') {
      throw new Error(`SQLite integrity check failed: ${result?.quick_check ?? 'no result'}`);
    }
    return { success: true, message: 'Kết nối SQLite thành công tới personal_finance.sqlite' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Lỗi kết nối SQLite:', message);
    return { success: false, message: `Lỗi kết nối SQLite: ${message}` };
  }
}

export async function withTransaction<T>(
  callback: (connection: SqliteConnection) => Promise<T>
): Promise<T> {
  const connection = createConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function closeDatabase(): void {
  if (database) {
    database.close();
    database = null;
    pool = null;
    console.log('SQLite database closed.');
  }
}

export async function closePool(): Promise<void> {
  closeDatabase();
}
