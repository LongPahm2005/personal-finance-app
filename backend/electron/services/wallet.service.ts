import { getPool, withTransaction } from '../database/connection';
import type { RowDataPacket, ResultSetHeader } from '../database/types';

export const INTERNAL_WALLET_NAME = '__personal_finance_default__';

export interface WalletModel {
  id: number;
  name: string;
  initial_balance: number;
  current_balance: number;
  description: string | null;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export class WalletService {
  async getDefaultWalletId(): Promise<number> {
    const pool = getPool();
    const [internalRows] = await pool.query<RowDataPacket[]>(
      'SELECT id, is_active FROM wallets WHERE name = ? ORDER BY id ASC LIMIT 1',
      [INTERNAL_WALLET_NAME]
    );

    if (internalRows.length > 0) {
      const walletId = Number(internalRows[0].id);
      if (!internalRows[0].is_active) {
        await pool.query('UPDATE wallets SET is_active = 1 WHERE id = ?', [walletId]);
      }
      return walletId;
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO wallets (name, initial_balance, current_balance, description, is_active) VALUES (?, 0, 0, ?, 1)',
      [INTERNAL_WALLET_NAME, 'Internal ledger account managed automatically by the application.']
    );
    return result.insertId;
  }

  async list(): Promise<WalletModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wallets ORDER BY is_active DESC, name ASC'
    );
    return rows.map(r => ({
      ...r,
      initial_balance: Number(r.initial_balance),
      current_balance: Number(r.current_balance),
    })) as WalletModel[];
  }

  async getById(id: number): Promise<WalletModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM wallets WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      initial_balance: Number(r.initial_balance),
      current_balance: Number(r.current_balance),
    } as WalletModel;
  }

  async create(data: {
    name: string;
    initial_balance?: number;
    description?: string;
  }): Promise<WalletModel> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Tên ví không được để trống.');
    }
    const balance = Number(data.initial_balance) || 0;
    const pool = getPool();

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO wallets (name, initial_balance, current_balance, description, is_active) VALUES (?, ?, ?, ?, 1)',
      [data.name.trim(), balance, balance, data.description || null]
    );

    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Không thể tạo ví.');
    return created;
  }

  async update(id: number, data: {
    name?: string;
    description?: string;
    is_active?: number;
  }): Promise<WalletModel> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Ví không tồn tại.');

    const pool = getPool();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new Error('Tên ví không được để trống.');
      updates.push('name = ?');
      params.push(data.name.trim());
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description || null);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE wallets SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await this.getById(id);
    return updated!;
  }

  async deactivate(id: number): Promise<void> {
    const pool = getPool();
    await pool.query('UPDATE wallets SET is_active = 0 WHERE id = ?', [id]);
  }

  async activate(id: number): Promise<void> {
    const pool = getPool();
    await pool.query('UPDATE wallets SET is_active = 1 WHERE id = ?', [id]);
  }

  async delete(id: number): Promise<void> {
    const pool = getPool();
    // Check if wallet has transactions or debts
    const [trans] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as cnt FROM transactions WHERE wallet_id = ?',
      [id]
    );
    const [debtPayments] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as cnt FROM debt_payments WHERE wallet_id = ?',
      [id]
    );

    if (Number(trans[0].cnt) > 0 || Number(debtPayments[0].cnt) > 0) {
      // Cannot hard delete to preserve financial history; deactivate instead
      await pool.query('UPDATE wallets SET is_active = 0 WHERE id = ?', [id]);
      return;
    }

    await pool.query('DELETE FROM wallets WHERE id = ?', [id]);
  }

  async getTotalBalance(): Promise<number> {
    const pool = getPool();
    const [[walletRows], [transactionRows], [paymentRows]] = await Promise.all([
      pool.query<RowDataPacket[]>(
        'SELECT COALESCE(SUM(current_balance), 0) AS total FROM wallets WHERE is_active = 1 AND name <> ?',
        [INTERNAL_WALLET_NAME]
      ),
      pool.query<RowDataPacket[]>(`
      SELECT COALESCE(SUM(CASE
        WHEN type = 'income' THEN amount
        WHEN type = 'expense' THEN -amount
        WHEN type = 'transfer' AND note LIKE 'Nhận từ:%' THEN amount
        WHEN type = 'transfer' THEN -amount
        ELSE 0
      END), 0) AS total
      FROM transactions
      WHERE wallet_id = (SELECT id FROM wallets WHERE name = ? ORDER BY id ASC LIMIT 1)
      `, [INTERNAL_WALLET_NAME]),
      pool.query<RowDataPacket[]>(`
      SELECT COALESCE(SUM(CASE WHEN d.type = 'receivable' THEN p.amount ELSE -p.amount END), 0) AS total
      FROM debt_payments p
      JOIN debts d ON d.id = p.debt_id
      WHERE p.wallet_id = (SELECT id FROM wallets WHERE name = ? ORDER BY id ASC LIMIT 1)
      `, [INTERNAL_WALLET_NAME]),
    ]);

    return Number(walletRows[0]?.total || 0)
      + Number(transactionRows[0]?.total || 0)
      + Number(paymentRows[0]?.total || 0);
  }

  /**
   * Adjust balance directly (creating an adjustment transaction)
   */
  async adjustBalance(walletId: number, newBalance: number, note?: string): Promise<WalletModel> {
    return withTransaction(async (conn) => {
      const [wRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM wallets WHERE id = ? FOR UPDATE',
        [walletId]
      );
      if (wRows.length === 0) throw new Error('Ví không tồn tại.');
      const wallet = wRows[0];
      const oldBalance = Number(wallet.current_balance);
      const diff = newBalance - oldBalance;

      // Update wallet balance
      await conn.query('UPDATE wallets SET current_balance = ? WHERE id = ?', [newBalance, walletId]);

      // Record adjustment transaction
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await conn.query(
        'INSERT INTO transactions (wallet_id, category_id, type, amount, transaction_date, note) VALUES (?, NULL, "adjustment", ?, ?, ?)',
        [walletId, Math.abs(diff), now, note || `Điều chỉnh số dư từ ${oldBalance.toLocaleString('vi-VN')} ₫ sang ${newBalance.toLocaleString('vi-VN')} ₫`]
      );

      const [updatedRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM wallets WHERE id = ?',
        [walletId]
      );
      const r = updatedRows[0];
      return {
        ...r,
        initial_balance: Number(r.initial_balance),
        current_balance: Number(r.current_balance),
      } as WalletModel;
    });
  }
}
