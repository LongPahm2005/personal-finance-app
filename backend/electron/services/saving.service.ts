import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../database/connection';

export interface SavingGoalModel {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  progress_percent?: number;
}

export class SavingService {
  async list(): Promise<SavingGoalModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, name, target_amount, current_amount,
        DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date,
        description, status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM saving_goals
      ORDER BY 
        CASE WHEN status = 'active' THEN 0 ELSE 1 END,
        target_date ASC,
        id DESC
    `);

    return rows.map(r => {
      const target = Number(r.target_amount);
      const current = Number(r.current_amount);
      const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      return {
        ...r,
        target_amount: target,
        current_amount: current,
        progress_percent: progress,
      };
    }) as SavingGoalModel[];
  }

  async getById(id: number): Promise<SavingGoalModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, name, target_amount, current_amount,
        DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date,
        description, status,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM saving_goals
      WHERE id = ?
    `, [id]);

    if (rows.length === 0) return null;
    const r = rows[0];
    const target = Number(r.target_amount);
    const current = Number(r.current_amount);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    return {
      ...r,
      target_amount: target,
      current_amount: current,
      progress_percent: progress,
    } as SavingGoalModel;
  }

  async create(data: {
    name: string;
    target_amount: number;
    current_amount?: number;
    target_date?: string | null;
    description?: string | null;
  }): Promise<SavingGoalModel> {
    if (!data.name || !data.name.trim()) throw new Error('Tên mục tiêu không được để trống.');
    const target = Number(data.target_amount);
    if (isNaN(target) || target <= 0) throw new Error('Số tiền mục tiêu phải lớn hơn 0.');

    const current = Number(data.current_amount) || 0;
    const status = current >= target ? 'completed' : 'active';
    const pool = getPool();

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO saving_goals (name, target_amount, current_amount, target_date, description, status) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name.trim(), target, current, data.target_date || null, data.description || null, status]
    );

    const created = await this.getById(result.insertId);
    return created!;
  }

  async update(id: number, data: {
    name?: string;
    target_amount?: number;
    current_amount?: number;
    target_date?: string | null;
    description?: string | null;
    status?: 'active' | 'completed' | 'cancelled';
  }): Promise<SavingGoalModel> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Mục tiêu không tồn tại.');

    const pool = getPool();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new Error('Tên mục tiêu không được để trống.');
      updates.push('name = ?');
      params.push(data.name.trim());
    }
    if (data.target_amount !== undefined) {
      const target = Number(data.target_amount);
      if (isNaN(target) || target <= 0) throw new Error('Mục tiêu phải lớn hơn 0.');
      updates.push('target_amount = ?');
      params.push(target);
    }
    if (data.current_amount !== undefined) {
      updates.push('current_amount = ?');
      params.push(Number(data.current_amount));
    }
    if (data.target_date !== undefined) {
      updates.push('target_date = ?');
      params.push(data.target_date || null);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description || null);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      params.push(data.status);
    }

    if (updates.length > 0) {
      params.push(id);
      await pool.query(`UPDATE saving_goals SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await this.getById(id);
    return updated!;
  }

  async addAmount(id: number, amount: number): Promise<SavingGoalModel> {
    const goal = await this.getById(id);
    if (!goal) throw new Error('Mục tiêu không tồn tại.');
    if (amount <= 0) throw new Error('Số tiền tích lũy phải lớn hơn 0.');

    const newAmount = goal.current_amount + amount;
    const newStatus = newAmount >= goal.target_amount ? 'completed' : goal.status;

    const pool = getPool();
    await pool.query(
      'UPDATE saving_goals SET current_amount = ?, status = ? WHERE id = ?',
      [newAmount, newStatus, id]
    );

    const updated = await this.getById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    const pool = getPool();
    await pool.query('DELETE FROM saving_goals WHERE id = ?', [id]);
  }
}
