const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { initializeSchema } = require('../../backend/dist-electron/database/schema.js');

const tableMappings = [
  {
    table: 'categories',
    columns: ['id', 'name', 'type', 'description', 'is_active', 'created_at', 'updated_at'],
  },
  {
    table: 'wallets',
    columns: [
      'id',
      'name',
      'initial_balance_minor_units',
      'current_balance_minor_units',
      'description',
      'is_active',
      'created_at',
      'updated_at',
    ],
    monetaryColumns: {
      initial_balance_minor_units: 'initial_balance',
      current_balance_minor_units: 'current_balance',
    },
  },
  {
    table: 'budgets',
    columns: ['id', 'name', 'amount_minor_units', 'start_date', 'end_date', 'description', 'created_at', 'updated_at'],
    monetaryColumns: { amount_minor_units: 'amount' },
  },
  {
    table: 'debts',
    columns: [
      'id',
      'type',
      'person_name',
      'original_amount_minor_units',
      'remaining_amount_minor_units',
      'created_date',
      'due_date',
      'status',
      'description',
      'created_at',
      'updated_at',
    ],
    monetaryColumns: {
      original_amount_minor_units: 'original_amount',
      remaining_amount_minor_units: 'remaining_amount',
    },
  },
  {
    table: 'saving_goals',
    columns: [
      'id',
      'name',
      'target_amount_minor_units',
      'current_amount_minor_units',
      'target_date',
      'description',
      'status',
      'created_at',
      'updated_at',
    ],
    monetaryColumns: {
      target_amount_minor_units: 'target_amount',
      current_amount_minor_units: 'current_amount',
    },
  },
  {
    table: 'transactions',
    columns: [
      'id',
      'wallet_id',
      'category_id',
      'type',
      'amount_minor_units',
      'transaction_date',
      'note',
      'transfer_id',
      'created_at',
      'updated_at',
    ],
    monetaryColumns: { amount_minor_units: 'amount' },
  },
  {
    table: 'debt_payments',
    columns: [
      'id',
      'debt_id',
      'wallet_id',
      'amount_minor_units',
      'payment_date',
      'note',
      'created_at',
    ],
    monetaryColumns: { amount_minor_units: 'amount' },
  },
  {
    table: 'recurring_transactions',
    columns: [
      'id',
      'wallet_id',
      'category_id',
      'type',
      'amount_minor_units',
      'description',
      'frequency',
      'next_date',
      'is_active',
      'created_at',
      'updated_at',
    ],
    monetaryColumns: { amount_minor_units: 'amount' },
  },
  {
    table: 'budget_categories',
    columns: ['budget_id', 'category_id'],
  },
];

function parseArguments(args) {
  const result = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (!argument.startsWith('--')) {
      if (result.source) {
        if (result.destination) {
          throw new Error(`Unexpected positional argument: ${argument}`);
        }
        result.destination = path.resolve(argument);
      } else {
        result.source = path.resolve(argument);
      }
      continue;
    }
    if (argument !== '--source' && argument !== '--destination') {
      throw new Error(`Unknown argument: ${argument}`);
    }
    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Expected a file path after ${argument}.`);
    }
    const key = argument === '--source' ? 'source' : 'destination';
    if (result[key]) {
      throw new Error(`Argument ${argument} can only be specified once.`);
    }
    result[key] = path.resolve(value);
    index += 1;
  }
  if (!result.source) {
    throw new Error('Usage: npm run migrate:legacy-sqlite -- <legacy-snapshot.sqlite> [destination.sqlite]');
  }
  return result;
}

function toMinorUnits(value, table, column) {
  const decimal = String(value);
  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(decimal);
  if (!match) {
    throw new Error(`Invalid monetary value in ${table}.${column}: ${decimal}`);
  }

  const sign = match[1] === '-' ? -1n : 1n;
  const whole = BigInt(match[2]);
  const fraction = BigInt((match[3] || '').padEnd(2, '0'));
  const minorUnits = sign * (whole * 100n + fraction);
  const number = Number(minorUnits);
  if (!Number.isSafeInteger(number)) {
    throw new Error(`Monetary value exceeds SQLite's safe integer range in ${table}.${column}.`);
  }
  return number;
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function removeDatabaseFiles(databasePath) {
  for (const suffix of ['', '-journal', '-wal', '-shm']) {
    const filePath = `${databasePath}${suffix}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

function migrate(sourcePath, destinationPath) {
  if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
    throw new Error(`SQLite source snapshot does not exist: ${sourcePath}`);
  }
  if (path.resolve(sourcePath) === path.resolve(destinationPath)) {
    throw new Error('Source and destination must be different files.');
  }
  if (fs.existsSync(destinationPath)) {
    throw new Error(`Destination already exists; refusing to overwrite it: ${destinationPath}`);
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });

  let source;
  let destination;
  let destinationCreated = false;
  try {
    source = new DatabaseSync(sourcePath, { readOnly: true });
    destination = new DatabaseSync(destinationPath);
    destinationCreated = true;
    initializeSchema(destination);

    destination.exec('PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE;');
    destination.exec('DELETE FROM categories');

    const rowCounts = [];
    for (const mapping of tableMappings) {
      const sourceColumns = mapping.columns.map(column =>
        quoteIdentifier(mapping.monetaryColumns?.[column] || column)
      );
      const destinationColumns = mapping.columns.map(quoteIdentifier);
      const insert = destination.prepare(
        `INSERT INTO ${quoteIdentifier(mapping.table)} (${destinationColumns.join(', ')}) VALUES (${mapping.columns.map(() => '?').join(', ')})`
      );
      const rows = source
        .prepare(`SELECT ${sourceColumns.join(', ')} FROM ${quoteIdentifier(mapping.table)}`)
        .all();

      for (const row of rows) {
        insert.run(
          ...mapping.columns.map(column => {
            const value = row[mapping.monetaryColumns?.[column] || column];
            return mapping.monetaryColumns?.[column] && value !== null
              ? toMinorUnits(value, mapping.table, mapping.monetaryColumns[column])
              : value;
          })
        );
      }
      rowCounts.push({ table: mapping.table, rows: rows.length });
    }

    destination.exec('COMMIT; PRAGMA foreign_keys = ON;');
    const violations = destination.prepare('PRAGMA foreign_key_check').all();
    if (violations.length > 0) {
      throw new Error(`Foreign-key validation failed with ${violations.length} violation(s).`);
    }
    const integrity = destination.prepare('PRAGMA integrity_check').get();
    if (integrity?.integrity_check !== 'ok') {
      throw new Error(`SQLite integrity check failed: ${integrity?.integrity_check ?? 'no result'}.`);
    }
    for (const item of rowCounts) {
      const actualCount = destination
        .prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(item.table)}`)
        .get();
      if (Number(actualCount?.count) !== item.rows) {
        throw new Error(`Row-count verification failed for table ${item.table}.`);
      }
    }

    source.close();
    source = undefined;
    destination.close();
    destination = undefined;
    console.log(JSON.stringify({
      success: true,
      sourcePath,
      destinationPath,
      tableCount: rowCounts.length,
      rowCounts,
      foreignKeyViolations: 0,
      integrity: 'ok',
    }));
  } catch (error) {
    if (destination) {
      try {
        destination.exec('ROLLBACK');
      } catch {
        // The transaction may already have been committed.
      }
      destination.close();
    }
    if (source) {
      source.close();
    }
    if (destinationCreated) {
      removeDatabaseFiles(destinationPath);
    }
    throw error;
  }
}

try {
  const { source, destination } = parseArguments(process.argv.slice(2));
  const target = destination || path.join(
    process.env.APPDATA || path.join(require('node:os').homedir(), 'AppData', 'Roaming'),
    'Personal Finance',
    'personal_finance.sqlite'
  );
  migrate(source, target);
} catch (error) {
  console.error(`SQLite data migration failed: ${error.message}`);
  process.exitCode = 1;
}
