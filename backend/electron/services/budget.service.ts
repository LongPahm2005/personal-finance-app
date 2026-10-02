import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool, withTransaction } from '../database/connection';
import { CategoryModel } from './category.service';

export interface BudgetModel {
  id: number;
  name: string;
  amount: number;
  start_date: string;
  end_date: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  categories?: CategoryModel[];
}

export interface BudgetUsageModel {
  budget: BudgetModel;
  used_amount: number;
  remaining_amount: number;
  usage_percent: number;
  is_over_budget: boolean;
}

export class BudgetService {
  async list(): Promise<BudgetModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, name, amount,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        description,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM budgets
      ORDER BY end_date DESC, id DESC
    `);

    const budgets: BudgetModel[] = [];
    for (const r of rows) {
      // Get associated categories
      const [catRows] = await pool.query<RowDataPacket[]>(`
        SELECT c.* 
        FROM categories c
        INNER JOIN budget_categories bc ON c.id = bc.category_id
        WHERE bc.budget_id = ?
      `, [r.id]);

      budgets.push({
        id: r.id,
        name: r.name,
        amount: Number(r.amount),
        start_date: r.start_date,
        end_date: r.end_date,
        description: r.description || null,
        created_at: r.created_at,
        updated_at: r.updated_at,
        categories: catRows as unknown as CategoryModel[],
      });
    }

    return budgets;
  }

  async getById(id: number): Promise<BudgetModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, name, amount,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        description,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
      FROM budgets
      WHERE id = ?
    `, [id]);

    if (rows.length === 0) return null;
    const r = rows[0];

    const [catRows] = await pool.query<RowDataPacket[]>(`
      SELECT c.* 
      FROM categories c
      INNER JOIN budget_categories bc ON c.id = bc.category_id
      WHERE bc.budget_id = ?
    `, [id]);

    return {
      id: r.id,
      name: r.name,
      amount: Number(r.amount),
      start_date: r.start_date,
      end_date: r.end_date,
      description: r.description || null,
      created_at: r.created_at,
      updated_at: r.updated_at,
      categories: catRows as unknown as CategoryModel[],
    };
  }

  async create(data: {
    name: string;
    amount: number;
    start_date: string;
    end_date: string;
    description?: string | null;
    category_ids?: number[];
  }): Promise<BudgetModel> {
    if (!data.name || !data.name.trim()) throw new Error('Tên ngân sách không được để trống.');
    const amount = Number(data.amount);
    if (isNaN(amount) || amount <= 0) throw new Error('Hạn mức ngân sách phải lớn hơn 0.');
    if (!data.start_date || !data.end_date) throw new Error('Vui lòng chọn ngày bắt đầu và kết thúc.');
    if (data.start_date > data.end_date) throw new Error('Ngày bắt đầu không được lớn hơn ngày kết thúc.');

    return withTransaction(async (conn) => {
      const [res] = await conn.query<ResultSetHeader>(
        'INSERT INTO budgets (name, amount, start_date, end_date, description) VALUES (?, ?, ?, ?, ?)',
        [data.name.trim(), amount, data.start_date, data.end_date, data.description || null]
      );
      const budgetId = res.insertId;

      if (data.category_ids && data.category_ids.length > 0) {
        for (const catId of data.category_ids) {
          await conn.query(
            'INSERT INTO budget_categories (budget_id, category_id) VALUES (?, ?)',
            [budgetId, catId]
          );
        }
      }

      const created = await this.getById(budgetId);
      return created!;
    });
  }

  async update(id: number, data: {
    name?: string;
    amount?: number;
    start_date?: string;
    end_date?: string;
    description?: string | null;
    category_ids?: number[];
  }): Promise<BudgetModel> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Ngân sách không tồn tại.');

    return withTransaction(async (conn) => {
      const updates: string[] = [];
      const params: unknown[] = [];

      if (data.name !== undefined) {
        if (!data.name.trim()) throw new Error('Tên ngân sách không được để trống.');
        updates.push('name = ?');
        params.push(data.name.trim());
      }
      if (data.amount !== undefined) {
        const amount = Number(data.amount);
        if (isNaN(amount) || amount <= 0) throw new Error('Hạn mức ngân sách phải lớn hơn 0.');
        updates.push('amount = ?');
        params.push(amount);
      }
      if (data.start_date !== undefined) {
        updates.push('start_date = ?');
        params.push(data.start_date);
      }
      if (data.end_date !== undefined) {
        updates.push('end_date = ?');
        params.push(data.end_date);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        params.push(data.description || null);
      }

      if (updates.length > 0) {
        params.push(id);
        await conn.query(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`, params);
      }

      if (data.category_ids !== undefined) {
        await conn.query('DELETE FROM budget_categories WHERE budget_id = ?', [id]);
        for (const catId of data.category_ids) {
          await conn.query(
            'INSERT INTO budget_categories (budget_id, category_id) VALUES (?, ?)',
            [id, catId]
          );
        }
      }

      const updated = await this.getById(id);
      return updated!;
    });
  }

  async delete(id: number): Promise<void> {
    return withTransaction(async (conn) => {
      await conn.query('DELETE FROM budget_categories WHERE budget_id = ?', [id]);
      await conn.query('DELETE FROM budgets WHERE id = ?', [id]);
    });
  }

  /**
   * Calculate budget usage from actual expense transactions
   */
  async getUsage(id: number): Promise<BudgetUsageModel> {
    const budget = await this.getById(id);
    if (!budget) throw new Error('Ngân sách không tồn tại.');

    const pool = getPool();
    const startDate = `${budget.start_date} 00:00:00`;
    const endDate = `${budget.end_date} 23:59:59`;

    let usageSql = `
      SELECT SUM(amount) as used
      FROM transactions
      WHERE type = 'expense'
        AND transaction_date >= ?
        AND transaction_date <= ?
    `;
    const params: unknown[] = [startDate, endDate];

    if (budget.categories && budget.categories.length > 0) {
      const catIds = budget.categories.map(c => c.id);
      usageSql += ` AND category_id IN (${catIds.map(() => '?').join(',')})`;
      params.push(...catIds);
    }

    const [rows] = await pool.query<RowDataPacket[]>(usageSql, params);
    const usedAmount = Number(rows[0]?.used || 0);
    const remainingAmount = Math.max(0, budget.amount - usedAmount);
    const usagePercent = Math.round((usedAmount / budget.amount) * 100);
    const isOverBudget = usedAmount > budget.amount;

    return {
      budget,
      used_amount: usedAmount,
      remaining_amount: remainingAmount,
      usage_percent: usagePercent,
      is_over_budget: isOverBudget,
    };
  }

  /**
   * Get all active budgets with their calculated usage
   */
  async getActiveWithUsage(): Promise<BudgetUsageModel[]> {
    const today = new Date().toISOString().slice(0, 10);
    const pool = getPool();

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id FROM budgets
      WHERE start_date <= ? AND end_date >= ?
      ORDER BY end_date ASC
    `, [today, today]);

    const results: BudgetUsageModel[] = [];
    for (const r of rows) {
      const usage = await this.getUsage(r.id);
      results.push(usage);
    }

    return results;
  }
}
