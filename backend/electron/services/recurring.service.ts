import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool, withTransaction } from '../database/connection';
import { INTERNAL_WALLET_NAME } from './wallet.service';

export interface RecurringModel {
  id: number;
  wallet_id: number;
  wallet_name?: string;
  category_id: number | null;
  category_name?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  next_date: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export class RecurringService {
  async list(): Promise<RecurringModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        r.id, r.wallet_id, w.name AS wallet_name,
        r.category_id, c.name AS category_name,
        r.type, r.amount, r.description, r.frequency,
        DATE_FORMAT(r.next_date, '%Y-%m-%d') AS next_date,
        r.is_active,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM recurring_transactions r
      LEFT JOIN wallets w ON r.wallet_id = w.id
      LEFT JOIN categories c ON r.category_id = c.id
      ORDER BY r.is_active DESC, r.next_date ASC
    `);

    return rows.map(r => ({
      ...r,
      amount: Number(r.amount),
    })) as RecurringModel[];
  }

  async getById(id: number): Promise<RecurringModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        r.id, r.wallet_id, w.name AS wallet_name,
        r.category_id, c.name AS category_name,
        r.type, r.amount, r.description, r.frequency,
        DATE_FORMAT(r.next_date, '%Y-%m-%d') AS next_date,
        r.is_active,
        DATE_FORMAT(r.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(r.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM recurring_transactions r
      LEFT JOIN wallets w ON r.wallet_id = w.id
      LEFT JOIN categories c ON r.category_id = c.id
      WHERE r.id = ?
    `, [id]);

    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      ...r,
      amount: Number(r.amount),
    } as RecurringModel;
  }

  async create(data: {
    wallet_id: number;
    category_id?: number | null;
    type: 'income' | 'expense';
    amount: number;
    description?: string | null;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    next_date: string;
  }): Promise<RecurringModel> {
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) throw new Error('Số tiền phải lớn hơn 0.');
    if (!data.next_date) throw new Error('Vui lòng chọn ngày bắt đầu.');

    const pool = getPool();
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO recurring_transactions (wallet_id, category_id, type, amount, description, frequency, next_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [data.wallet_id, data.category_id || null, data.type, amount, data.description || null, data.frequency, data.next_date]
    );

    const created = await this.getById(result.insertId);
    return created!;
  }

  async update(id: number, data: {
    wallet_id?: number;
    category_id?: number | null;
    type?: 'income' | 'expense';
    amount?: number;
    description?: string | null;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    next_date?: string;
    is_active?: number;
  }): Promise<RecurringModel> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Giao dịch định kỳ không tồn tại.');

    const pool = getPool();
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
    if (data.type !== undefined) {
      updates.push('type = ?');
      params.push(data.type);
    }
    if (data.amount !== undefined) {
      const amount = Number(data.amount);
      if (isNaN(amount) || amount <= 0) throw new Error('Số tiền phải lớn hơn 0.');
      updates.push('amount = ?');
      params.push(amount);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description || null);
    }
    if (data.frequency !== undefined) {
      updates.push('frequency = ?');
      params.push(data.frequency);
    }
    if (data.next_date !== undefined) {
      updates.push('next_date = ?');
      params.push(data.next_date);
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(data.is_active);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE recurring_transactions SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await this.getById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool.query('DELETE FROM recurring_transactions WHERE id = ?', [id]);
  }

  /**
   * Calculate next date based on frequency
   */
  private calculateNextDate(currentDateStr: string, frequency: string): string {
    const date = new Date(currentDateStr);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString().slice(0, 10);
  }

  /**
   * Process all recurring transactions due today or earlier.
   * Completely idempotent: executes inside a transaction and advances next_date.
   */
  async processDue(): Promise<number> {
    const today = new Date().toISOString().slice(0, 10);
    const pool = getPool();

    const [dueRows] = await pool.query<RowDataPacket[]>(`
      SELECT * FROM recurring_transactions
      WHERE is_active = 1 AND next_date <= ?
    `, [today]);

    let processedCount = 0;

    for (const rec of dueRows) {
      await withTransaction(async (conn) => {
        const amount = Number(rec.amount);
        const txDate = `${rec.next_date} 08:00:00`;
        const note = rec.description ? `[Định kỳ] ${rec.description}` : '[Định kỳ] Giao dịch tự động';

        // 1. Insert into transactions
        await conn.query(
          'INSERT INTO transactions (wallet_id, category_id, type, amount, transaction_date, note) VALUES (?, ?, ?, ?, ?, ?)',
          [rec.wallet_id, rec.category_id || null, rec.type, amount, txDate, note]
        );

        // 2. Update real account balances; the internal account is a flow-only ledger.
        const [walletRows] = await conn.query<RowDataPacket[]>(
          'SELECT name FROM wallets WHERE id = ?',
          [rec.wallet_id]
        );
        if (walletRows[0]?.name !== INTERNAL_WALLET_NAME) {
          const balanceDelta = rec.type === 'income' ? amount : -amount;
          await conn.query(
            'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
            [balanceDelta, rec.wallet_id]
          );
        }

        // 3. Compute and advance next_date
        const nextDate = this.calculateNextDate(rec.next_date, rec.frequency);
        await conn.query(
          'UPDATE recurring_transactions SET next_date = ? WHERE id = ?',
          [nextDate, rec.id]
        );

        processedCount++;
      });
    }

    return processedCount;
  }
}
