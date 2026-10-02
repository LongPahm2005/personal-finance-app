import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool, withTransaction } from '../database/connection';
import { INTERNAL_WALLET_NAME, WalletService } from './wallet.service';

export interface DebtModel {
  id: number;
  type: 'receivable' | 'payable';
  person_name: string;
  original_amount: number;
  remaining_amount: number;
  created_date: string;
  due_date: string | null;
  status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DebtPaymentModel {
  id: number;
  debt_id: number;
  wallet_id: number;
  wallet_name?: string;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at?: string;
}

export class DebtService {
  async list(filters: {
    type?: 'receivable' | 'payable';
    status?: 'unpaid' | 'partial' | 'paid' | 'overdue';
    search?: string;
  } = {}): Promise<DebtModel[]> {
    const pool = getPool();
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (filters.type) {
      conditions.push('d.type = ?');
      params.push(filters.type);
    }
    if (filters.status) {
      conditions.push('d.status = ?');
      params.push(filters.status);
    }
    if (filters.search && filters.search.trim()) {
      conditions.push('(d.person_name LIKE ? OR d.description LIKE ?)');
      const pattern = `%${filters.search.trim()}%`;
      params.push(pattern, pattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        d.id,
        d.type,
        d.person_name,
        d.original_amount,
        d.remaining_amount,
        DATE_FORMAT(d.created_date, '%Y-%m-%d') AS created_date,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') AS due_date,
        d.status,
        d.description,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM debts d
      ${whereClause}
      ORDER BY 
        CASE WHEN d.status IN ('unpaid', 'partial', 'overdue') THEN 0 ELSE 1 END,
        d.due_date ASC,
        d.id DESC
    `;

    const [rows] = await pool.query<RowDataPacket[]>(sql, params);

    // Dynamic overdue status check based on current date
    const today = new Date().toISOString().slice(0, 10);
    return rows.map(r => {
      let status = r.status;
      if (status !== 'paid' && r.due_date && r.due_date < today) {
        status = 'overdue';
      }
      return {
        ...r,
        original_amount: Number(r.original_amount),
        remaining_amount: Number(r.remaining_amount),
        status,
      };
    }) as DebtModel[];
  }

  async getById(id: number): Promise<DebtModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        d.id,
        d.type,
        d.person_name,
        d.original_amount,
        d.remaining_amount,
        DATE_FORMAT(d.created_date, '%Y-%m-%d') AS created_date,
        DATE_FORMAT(d.due_date, '%Y-%m-%d') AS due_date,
        d.status,
        d.description,
        DATE_FORMAT(d.created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(d.updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM debts d
      WHERE d.id = ?
    `, [id]);

    if (rows.length === 0) return null;
    const r = rows[0];
    const today = new Date().toISOString().slice(0, 10);
    let status = r.status;
    if (status !== 'paid' && r.due_date && r.due_date < today) {
      status = 'overdue';
    }

    return {
      ...r,
      original_amount: Number(r.original_amount),
      remaining_amount: Number(r.remaining_amount),
      status,
    } as DebtModel;
  }

  async create(data: {
    type: 'receivable' | 'payable';
    person_name: string;
    original_amount: number;
    created_date?: string;
    due_date?: string | null;
    description?: string | null;
  }): Promise<DebtModel> {
    if (!data.person_name || !data.person_name.trim()) {
      throw new Error('Tên người liên quan không được để trống.');
    }
    const amount = Number(data.original_amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Số tiền nợ phải lớn hơn 0.');
    }

    const createdDate = data.created_date || new Date().toISOString().slice(0, 10);
    const pool = getPool();

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO debts (type, person_name, original_amount, remaining_amount, created_date, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, "unpaid", ?)',
      [data.type, data.person_name.trim(), amount, amount, createdDate, data.due_date || null, data.description || null]
    );

    const created = await this.getById(result.insertId);
    return created!;
  }

  async update(id: number, data: {
    person_name?: string;
    due_date?: string | null;
    description?: string | null;
  }): Promise<DebtModel> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Khoản nợ không tồn tại.');

    const pool = getPool();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.person_name !== undefined) {
      if (!data.person_name.trim()) throw new Error('Tên người liên quan không được để trống.');
      updates.push('person_name = ?');
      params.push(data.person_name.trim());
    }
    if (data.due_date !== undefined) {
      updates.push('due_date = ?');
      params.push(data.due_date || null);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description || null);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE debts SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await this.getById(id);
    return updated!;
  }

  /**
   * Pay/Collect debt payment atomically
   * - Validates payment amount <= remaining_amount
   * - Inserts into `debt_payments`
   * - Updates wallet balance (receivable: +amount; payable: -amount)
   * - Updates debts.remaining_amount and status ('paid' or 'partial')
   */
  async pay(debtId: number, data: {
    wallet_id?: number;
    amount: number;
    payment_date?: string;
    note?: string | null;
  }): Promise<{ debt: DebtModel; payment: DebtPaymentModel }> {
    const payAmount = Number(data.amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new Error('Số tiền thanh toán phải lớn hơn 0.');
    }
    const walletId = data.wallet_id ?? await new WalletService().getDefaultWalletId();

    return withTransaction(async (conn) => {
      // 1. Lock and check debt record
      const [debtRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM debts WHERE id = ? FOR UPDATE',
        [debtId]
      );
      if (debtRows.length === 0) throw new Error('Khoản nợ không tồn tại.');
      const debt = debtRows[0];
      const remaining = Number(debt.remaining_amount);

      if (remaining <= 0 || debt.status === 'paid') {
        throw new Error('Khoản nợ này đã được thanh toán hoàn tất.');
      }

      if (payAmount > remaining) {
        throw new Error(`Khoản thanh toán (${payAmount.toLocaleString('vi-VN')} ₫) vượt quá số tiền còn nợ (${remaining.toLocaleString('vi-VN')} ₫).`);
      }

      // 2. Lock and check wallet
      const [walletRows] = await conn.query<RowDataPacket[]>(
        'SELECT * FROM wallets WHERE id = ? FOR UPDATE',
        [walletId]
      );
      if (walletRows.length === 0) throw new Error('Ví thanh toán không tồn tại.');
      const wallet = walletRows[0];
      const isInternalWallet = wallet.name === INTERNAL_WALLET_NAME;
      if (!wallet.is_active) throw new Error('Ví này đã bị ngưng hoạt động.');

      const paymentDate = data.payment_date || new Date().toISOString().slice(0, 19).replace('T', ' ');

      // 3. Insert debt payment record
      const [payResult] = await conn.query<ResultSetHeader>(
        'INSERT INTO debt_payments (debt_id, wallet_id, amount, payment_date, note) VALUES (?, ?, ?, ?, ?)',
        [debtId, walletId, payAmount, paymentDate, data.note || null]
      );

      // 4. Update wallet balance
      // Receivable (người ta trả nợ cho mình) => ví tăng tiền
      // Payable (mình trả nợ cho người ta) => ví giảm tiền
      const walletDelta = debt.type === 'receivable' ? payAmount : -payAmount;
      if (!isInternalWallet) {
        await conn.query(
          'UPDATE wallets SET current_balance = current_balance + ? WHERE id = ?',
          [walletDelta, walletId]
        );
      }

      // 5. Update debt remaining amount and status
      const newRemaining = remaining - payAmount;
      const newStatus = newRemaining <= 0 ? 'paid' : 'partial';

      await conn.query(
        'UPDATE debts SET remaining_amount = ?, status = ? WHERE id = ?',
        [newRemaining, newStatus, debtId]
      );

      // 6. Return updated debt and payment
      const updatedDebt = await this.getById(debtId);
      const [pRows] = await conn.query<RowDataPacket[]>(`
        SELECT 
          p.id, p.debt_id, p.wallet_id, w.name as wallet_name,
          p.amount, DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i:%s') as payment_date,
          p.note
        FROM debt_payments p
        LEFT JOIN wallets w ON p.wallet_id = w.id
        WHERE p.id = ?
      `, [payResult.insertId]);

      const payment = {
        ...pRows[0],
        amount: Number(pRows[0].amount),
      } as DebtPaymentModel;

      return { debt: updatedDebt!, payment };
    });
  }

  async getPayments(debtId: number): Promise<DebtPaymentModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        p.id, p.debt_id, p.wallet_id, w.name as wallet_name,
        p.amount, DATE_FORMAT(p.payment_date, '%Y-%m-%d %H:%i:%s') as payment_date,
        p.note, DATE_FORMAT(p.created_at, '%Y-%m-%d %H:%i:%s') as created_at
      FROM debt_payments p
      LEFT JOIN wallets w ON p.wallet_id = w.id
      WHERE p.debt_id = ?
      ORDER BY p.payment_date DESC, p.id DESC
    `, [debtId]);

    return rows.map(r => ({
      ...r,
      amount: Number(r.amount),
    })) as DebtPaymentModel[];
  }

  async delete(id: number): Promise<void> {
    const pool = getPool();
    const [payments] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as cnt FROM debt_payments WHERE debt_id = ?',
      [id]
    );
    if (payments[0].cnt > 0) {
      throw new Error('Khoản nợ đã phát sinh lịch sử thanh toán, không thể xóa để bảo toàn lịch sử.');
    }
    await pool.query('DELETE FROM debts WHERE id = ?', [id]);
  }

  async getSummary(): Promise<{ totalReceivable: number; totalPayable: number; overdueCount: number }> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        SUM(CASE WHEN type = 'receivable' AND status != 'paid' THEN remaining_amount ELSE 0 END) AS total_receivable,
        SUM(CASE WHEN type = 'payable' AND status != 'paid' THEN remaining_amount ELSE 0 END) AS total_payable,
        COUNT(CASE WHEN status != 'paid' AND due_date IS NOT NULL AND due_date < CURRENT_DATE() THEN 1 END) AS overdue_count
      FROM debts
    `);

    return {
      totalReceivable: Number(rows[0]?.total_receivable || 0),
      totalPayable: Number(rows[0]?.total_payable || 0),
      overdueCount: Number(rows[0]?.overdue_count || 0),
    };
  }
}
