import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from '../database/connection';

export interface CategoryModel {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

export class CategoryService {
  async list(type?: 'income' | 'expense'): Promise<CategoryModel[]> {
    const pool = getPool();
    let query = 'SELECT * FROM categories WHERE is_active = 1';
    const params: unknown[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    query += ' ORDER BY type ASC, name ASC';

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows as CategoryModel[];
  }

  async getAll(): Promise<CategoryModel[]> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categories ORDER BY type ASC, name ASC'
    );
    return rows as CategoryModel[];
  }

  async getById(id: number): Promise<CategoryModel | null> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as CategoryModel;
  }

  async create(data: { name: string; type: 'income' | 'expense'; description?: string }): Promise<CategoryModel> {
    if (!data.name || !data.name.trim()) {
      throw new Error('Tên danh mục không được để trống.');
    }
    const pool = getPool();
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO categories (name, type, description, is_active) VALUES (?, ?, ?, 1)',
      [data.name.trim(), data.type, data.description || null]
    );
    const created = await this.getById(result.insertId);
    if (!created) throw new Error('Không thể tạo danh mục.');
    return created;
  }

  async update(id: number, data: Partial<CategoryModel>): Promise<CategoryModel> {
    const existing = await this.getById(id);
    if (!existing) throw new Error('Danh mục không tồn tại.');

    const pool = getPool();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      if (!data.name.trim()) throw new Error('Tên danh mục không được để trống.');
      updates.push('name = ?');
      params.push(data.name.trim());
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      params.push(data.type);
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
      await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    const updated = await this.getById(id);
    return updated!;
  }

  async delete(id: number): Promise<void> {
    const pool = getPool();
    // Check if category is used in transactions
    const [trans] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as cnt FROM transactions WHERE category_id = ?',
      [id]
    );
    if (trans[0].cnt > 0) {
      // Soft delete to protect historical data integrity
      await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
      return;
    }

    // Check if used in recurring or budgets
    const [rec] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as cnt FROM recurring_transactions WHERE category_id = ?',
      [id]
    );
    const [bud] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as cnt FROM budget_categories WHERE category_id = ?',
      [id]
    );

    if (rec[0].cnt > 0 || bud[0].cnt > 0) {
      await pool.query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
      return;
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  }
}
