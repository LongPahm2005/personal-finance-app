import { getPool, withTransaction } from '../database/connection';
import { INTERNAL_WALLET_NAME, WalletService } from './wallet.service';
import type { RowDataPacket, ResultSetHeader } from '../database/types';

export interface TransactionModel {
  id: number;
  wallet_id: number;
  wallet_name?: string;
  category_id: number | null;
  category_name?: string;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number;
  transaction_date: string;
  note: string | null;
  transfer_id: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'income' | 'expense' | 'transfer' | 'adjustment';
  wallet_id?: number;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: 'transaction_date' | 'amount' | 'created_at';
  sort_order?: 'ASC' | 'DESC';
}

export interface PaginatedTransactions {
  items: TransactionModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TransactionService {
  async list(filters: TransactionFilters = {}): Promise<PaginatedTransactions> {
    const pool = getPool();
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.type) {
      conditions.push('t.type = ?');
      params.push(filters.type);
    }
    if (filters.wallet_id) {
      conditions.push('t.wallet_id = ?');
      params.push(filters.wallet_id);
    }
    if (filters.category_id) {
      conditions.push('t.category_id = ?');
      params.push(filters.category_id);
    }
    if (filters.start_date) {
      conditions.push('t.transaction_date >= ?');
      params.push(`${filters.start_date} 00:00:00`);
    }
    if (filters.end_date) {
      conditions.push('t.transaction_date <= ?');
      params.push(`${filters.end_date} 23:59:59`);
    }
    if (filters.search && filters.search.trim()) {
      conditions.push('(t.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)');
      const searchPattern = `%${filters.search.trim()}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countSql = `
      SELECT COUNT(*) as total
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      ${whereClause}
    `;
    const sortBy = filters.sort_by || 'transaction_date';
    const sortOrder = filters.sort_order === 'ASC' ? 'ASC' : 'DESC';
    const dataSql = `
      SELECT 
        t.id,
        t.wallet_id,
        w.name AS wallet_name,
        t.category_id,
        c.name AS category_name,
        t.type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date,
        t.note,
        t.transfer_id,
        DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      ${whereClause}
      ORDER BY t.${sortBy} ${sortOrder}, t.id DESC
      LIMIT ? OFFSET ?
    `;

    // Count and page data are independent reads.
    const [[countRows], [rows]] = await Promise.all([
      pool.query<RowDataPacket[]>(countSql, params),
      pool.query<RowDataPacket[]>(dataSql, [...params, limit, offset]),
    ]);
    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.ceil(total / limit) || 1;

    const items = rows.map(r => ({
      ...r,
      amount: Number(r.amount),
    })) as TransactionModel[];

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getById(id: number): Promise<TransactionModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.id,
        t.wallet_id,
        w.name AS wallet_name,
        t.category_id,
        c.name AS category_name,
        t.type,
        t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date,
        t.note,
        t.transfer_id,
        DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(t.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      WHERE t.id = ?
    `, [id]);

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      amount: Number(r.amount),
    } as TransactionModel;
  }

  /**
   * Create regular transaction (income, expense, adjustment)
   * Handled inside a database transaction to keep wallet balance strictly consistent.
   */
  async create(data: {
    wallet_id?: number;
    category_id?: number | null;
    type: 'income' | 'expense' | 'adjustment';
    amount: number;
    transaction_date?: string;
    note?: string | null;
  }): Promise<TransactionModel> {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Số tiền giao dịch phải lớn hơn 0.');
    }
    const walletId = data.wallet_id ?? await new WalletService().getDefaultWalletId();

    return withTransaction(async (conn) => {
      // 1. Lock and check wallet
      const [walletRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM wallets WHERE id = ? FOR UPDATE',
        [walletId]
      );
      if (walletRows.length === 0) throw new Error('Ví không tồn tại.');
      const wallet = walletRows[0];
      const isInternalWallet = wallet.name === INTERNAL_WALLET_NAME;
      if (!wallet.is_active) throw new Error('Ví này đã bị ngưng hoạt động.');

      // 2. Prevent negative wallet balances for expense transactions
      if (!isInternalWallet && data.type === 'expense' && Number(wallet.current_balance) < amount) {
        throw new Error(`Ví "${wallet.name}" không đủ số dư để thêm khoản chi. Số dư hiện tại: ${Number(wallet.current_balance).toLocaleString('vi-VN')} ₫, cần tối thiểu: ${amount.toLocaleString('vi-VN')} ₫.`);
      }

      // 3. Format transaction date
      const txDate = data.transaction_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

      // 4. Insert transaction
      const [result] = await conn.query<ResultSetHeader>(
        'INSERT INTO transactions (wallet_id, category_id, type, amount, transaction_date, note) VALUES (?, ?, ?, ?, ?, ?)',
        [walletId, data.category_id || null, data.type, amount, txDate, data.note || null]
      );

      // 4. Update wallet balance
      let balanceDelta = 0;
      if (data.type === 'income') {
        balanceDelta = amount;
      } else if (data.type === 'expense') {
        balanceDelta = -amount;
      }
      // For adjustment, default delta is 0 unless specified or balance is directly set

      if (balanceDelta !== 0 && !isInternalWallet) {
        await conn.query(
          'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
          [balanceDelta, walletId]
        );
      }

      // 5. Fetch and return created record
      const [createdRows] = await conn.query<RowDataPacket[]>(`
        SELECT 
          t.id, t.wallet_id, w.name AS wallet_name,
          t.category_id, c.name AS category_name,
          t.type, t.amount,
          DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date,
          t.note, t.transfer_id
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN wallets w ON t.wallet_id = w.id
        WHERE t.id = ?
      `, [result.insertId]);

      const r = createdRows[0];
      return {
        ...r,
        amount: Number(r.amount),
      } as TransactionModel;
    });
  }

  /**
   * Transfer funds from Wallet A to Wallet B atomically
   * Creates 2 linked records in `transactions` and updates both wallet balances.
   */
  async createTransfer(data: {
    from_wallet_id: number;
    to_wallet_id: number;
    amount: number;
    transaction_date?: string;
    note?: string | null;
  }): Promise<{ from: TransactionModel; to: TransactionModel }> {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Số tiền chuyển phải lớn hơn 0.');
    }
    if (data.from_wallet_id === data.to_wallet_id) {
      throw new Error('Ví nguồn và ví đích không được trùng nhau.');
    }

    return withTransaction(async (conn) => {
      // 1. Lock both wallets in ascending order of ID to prevent deadlocks
      const [id1, id2] = [data.from_wallet_id, data.to_wallet_id].sort((a, b) => a - b);
      const [w1Rows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM wallets WHERE id = ? FOR UPDATE',
        [id1]
      );
      const [w2Rows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM wallets WHERE id = ? FOR UPDATE',
        [id2]
      );

      if (w1Rows.length === 0 || w2Rows.length === 0) {
        throw new Error('Một trong hai ví chuyển tiền không tồn tại.');
      }

      const fromWallet = data.from_wallet_id === id1 ? w1Rows[0] : w2Rows[0];
      const toWallet = data.to_wallet_id === id1 ? w1Rows[0] : w2Rows[0];

      if (!fromWallet.is_active || !toWallet.is_active) {
        throw new Error('Ví tham gia chuyển tiền đang bị ngưng hoạt động.');
      }

      if (Number(fromWallet.current_balance) < amount) {
        throw new Error(`Ví "${fromWallet.name}" không đủ số dư để chuyển. Số dư hiện tại: ${Number(fromWallet.current_balance).toLocaleString('vi-VN')} ₫, cần tối thiểu: ${amount.toLocaleString('vi-VN')} ₫.`);
      }

      const txDate = data.transaction_date || new Date().toISOString().slice(0, 19).replace('T', ' ');
      const userNote = data.note ? ` - ${data.note}` : '';

      // 2. Insert Outflow transaction for from_wallet
      const noteFrom = `Chuyển đến: ${toWallet.name}${userNote}`;
      const [resFrom] = await conn.query<ResultSetHeader>(
        'INSERT INTO transactions (wallet_id, category_id, type, amount, transaction_date, note) VALUES (?, NULL, "transfer", ?, ?, ?)',
        [data.from_wallet_id, amount, txDate, noteFrom]
      );
      const fromTxId = resFrom.insertId;

      // 3. Insert Inflow transaction for to_wallet
      const noteTo = `Nhận từ: ${fromWallet.name}${userNote}`;
      const [resTo] = await conn.query<ResultSetHeader>(
        'INSERT INTO transactions (wallet_id, category_id, type, amount, transaction_date, note, transfer_id) VALUES (?, NULL, "transfer", ?, ?, ?, ?)',
        [data.to_wallet_id, amount, txDate, noteTo, fromTxId]
      );
      const toTxId = resTo.insertId;

      // 4. Update cross-link transfer_id on the from transaction
      await conn.query(
        'UPDATE transactions SET transfer_id = ? WHERE id = ?',
        [toTxId, fromTxId]
      );

      // 5. Update wallet balances atomically
      await conn.query(
        'UPDATE wallets SET current_balance = current_balance - ? WHERE id = ?',
        [amount, data.from_wallet_id]
      );
      await conn.query(
        'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
        [amount, data.to_wallet_id]
      );

      // 6. Fetch both created transactions
      const fromTx = await this.getById(fromTxId);
      const toTx = await this.getById(toTxId);

      return { from: fromTx!, to: toTx! };
    });
  }

  /**
   * Update transaction with atomic wallet balance recalculation
   */
  async update(id: number, data: {
    wallet_id?: number;
    category_id?: number | null;
    amount?: number;
    transaction_date?: string;
    note?: string | null;
  }): Promise<TransactionModel> {
    return withTransaction(async (conn) => {
      // 1. Lock existing transaction
      const [txRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM transactions WHERE id = ? FOR UPDATE',
        [id]
      );
      if (txRows.length === 0) throw new Error('Giao dịch không tồn tại.');
      const oldTx = txRows[0];

      if (oldTx.type === 'transfer') {
        throw new Error('Để sửa giao dịch chuyển tiền, vui lòng hủy và thực hiện chuyển mới.');
      }

      const oldAmount = Number(oldTx.amount);
      const newAmount = data.amount !== undefined ? Number(data.amount) : oldAmount;
      if (isNaN(newAmount) || newAmount <= 0) {
        throw new Error('Số tiền giao dịch phải lớn hơn 0.');
      }

      const oldWalletId = oldTx.wallet_id;
      const newWalletId = data.wallet_id !== undefined ? data.wallet_id : oldWalletId;
      const [walletRows] = await conn.query<RowDataPacket[]>(
        'SELECT id, name, current_balance FROM wallets WHERE id IN (?, ?)',
        [oldWalletId, newWalletId]
      );
      const oldWallet = walletRows.find(wallet => Number(wallet.id) === Number(oldWalletId));
      const newWallet = walletRows.find(wallet => Number(wallet.id) === Number(newWalletId));
      if (!oldWallet || !newWallet) throw new Error('Ví giao dịch không tồn tại.');
      const oldIsInternalWallet = oldWallet.name === INTERNAL_WALLET_NAME;
      const newIsInternalWallet = newWallet.name === INTERNAL_WALLET_NAME;

      if (oldTx.type === 'expense' && !newIsInternalWallet) {
        const projectedBalance = Number(newWallet.current_balance)
          + (newWalletId === oldWalletId && !oldIsInternalWallet ? oldAmount : 0)
          - newAmount;
        if (projectedBalance < 0) {
          throw new Error(`Ví "${newWallet.name}" không đủ số dư để cập nhật khoản chi. Số dư sau khi cập nhật sẽ là ${projectedBalance.toLocaleString('vi-VN')} ₫.`);
        }
      }

      // Reverse old balance impact
      let reverseOld = 0;
      if (oldTx.type === 'income') reverseOld = -oldAmount;
      else if (oldTx.type === 'expense') reverseOld = oldAmount;

      if (reverseOld !== 0 && !oldIsInternalWallet) {
        await conn.query(
          'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
          [reverseOld, oldWalletId]
        );
      }

      // Apply new balance impact
      let applyNew = 0;
      if (oldTx.type === 'income') applyNew = newAmount;
      else if (oldTx.type === 'expense') applyNew = -newAmount;

      if (applyNew !== 0 && !newIsInternalWallet) {
        await conn.query(
          'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
          [applyNew, newWalletId]
        );
      }

      // Update transaction record
      const updates: string[] = [];
      const params: unknown[] = [];

      if (data.wallet_id !== undefined) {
        updates.push('wallet_id = ?');
        params.push(data.wallet_id);
      }
      if (data.category_id !== undefined) {
        updates.push('category_id = ?');
        params.push(data.category_id);
      }
      if (data.amount !== undefined) {
        updates.push('amount = ?');
        params.push(newAmount);
      }
      if (data.transaction_date !== undefined) {
        updates.push('transaction_date = ?');
        params.push(data.transaction_date);
      }
      if (data.note !== undefined) {
        updates.push('note = ?');
        params.push(data.note);
      }

      if (updates.length > 0) {
        params.push(id);
        await conn.query(`UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      const [updatedRows] = await conn.query<RowDataPacket[]>(`
        SELECT 
          t.id, t.wallet_id, w.name AS wallet_name,
          t.category_id, c.name AS category_name,
          t.type, t.amount,
          DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date,
          t.note, t.transfer_id
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN wallets w ON t.wallet_id = w.id
        WHERE t.id = ?
      `, [id]);

      const r = updatedRows[0];
      return {
        ...r,
        amount: Number(r.amount),
      } as TransactionModel;
    });
  }

  /**
   * Delete transaction with atomic wallet balance reversal
   */
  async delete(id: number): Promise<void> {
    return withTransaction(async (conn) => {
      const [txRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM transactions WHERE id = ? FOR UPDATE',
        [id]
      );
      if (txRows.length === 0) throw new Error('Giao dịch không tồn tại.');
      const tx = txRows[0];
      const amount = Number(tx.amount);

      if (tx.type === 'transfer' && tx.transfer_id) {
        // Transfer: delete both paired records and restore balances of both wallets
        const [pairedRows] = await conn.query<RowDataPacket[]>(
          'SELECT * FROM transactions WHERE id = ? FOR UPDATE',
          [tx.transfer_id]
        );

        // Find which is outflow and which is inflow
        // Outflow has note "Chuyển đến", inflow has note "Nhận từ" (or check IDs)
        const isOutflow = String(tx.note || '').startsWith('Chuyển đến') || Number(tx.id) < Number(tx.transfer_id);
        const outflowWalletId = isOutflow ? tx.wallet_id : pairedRows[0]?.wallet_id;
        const inflowWalletId = isOutflow ? pairedRows[0]?.wallet_id : tx.wallet_id;

        if (outflowWalletId) {
          // Re-credit the from wallet
          await conn.query(
            'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
            [amount, outflowWalletId]
          );
        }
        if (inflowWalletId) {
          // Deduct from the to wallet
          await conn.query(
            'UPDATE wallets SET current_balance = current_balance - ? WHERE id = ?',
            [amount, inflowWalletId]
          );
        }

        // Delete both paired rows
        await conn.query('DELETE FROM transactions WHERE id IN (?, ?)', [id, tx.transfer_id]);
        return;
      }

      // Normal transaction reversal
      let reverseDelta = 0;
      if (tx.type === 'income') reverseDelta = -amount;
      else if (tx.type === 'expense') reverseDelta = amount;

      const [walletRows] = await conn.query<RowDataPacket[]>(
        'SELECT name FROM wallets WHERE id = ?',
        [tx.wallet_id]
      );
      const isInternalWallet = walletRows[0]?.name === INTERNAL_WALLET_NAME;

      if (reverseDelta !== 0 && !isInternalWallet) {
        await conn.query(
          'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
          [reverseDelta, tx.wallet_id]
        );
      }

      await conn.query('DELETE FROM transactions WHERE id = ?', [id]);
    });
  }

  async getRecent(limit = 8): Promise<TransactionModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.id, t.wallet_id, w.name AS wallet_name,
        t.category_id, c.name AS category_name,
        t.type, t.amount,
        DATE_FORMAT(t.transaction_date, '%Y-%m-%d %H:%i:%s') AS transaction_date,
        t.note, t.transfer_id
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN wallets w ON t.wallet_id = w.id
      ORDER BY t.transaction_date DESC, t.id DESC
      LIMIT ?
    `, [limit]);

    return rows.map(r => ({
      ...r,
      amount: Number(r.amount),
    })) as TransactionModel[];
  }

  async getMonthlySummary(year: number, month: number): Promise<{ income: number; expense: number }> {
    const pool = getPool();
    const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
    // Last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense
      FROM transactions
      WHERE transaction_date >= ? AND transaction_date <= ?
    `, [startDate, endDate]);

    return {
      income: Number(rows[0]?.total_income || 0),
      expense: Number(rows[0]?.total_expense || 0),
    };
  }
}
