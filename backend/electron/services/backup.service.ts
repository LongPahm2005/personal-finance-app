import fs from 'fs/promises';
import path from 'path';
import { app, dialog } from 'electron';
import { getPool, withTransaction } from '../database/connection';
import { RowDataPacket } from 'mysql2/promise';

export class BackupService {
  /**
   * Backup all tables to a timestamped JSON backup file
   */
  async backupDatabase(targetFolder?: string): Promise<{ success: boolean; filePath: string }> {
    const pool = getPool();
    const tables = [
      'categories',
      'wallets',
      'transactions',
      'debts',
      'debt_payments',
      'budgets',
      'budget_categories',
      'saving_goals',
      'recurring_transactions',
    ];

    const backupData: Record<string, unknown[]> = {
      _metadata: [{
        version: '1.0.0',
        exported_at: new Date().toISOString(),
        database: 'personal_finance',
      }],
    };

    for (const table of tables) {
      const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM \`${table}\``);
      backupData[table] = rows;
    }

    const defaultDir = targetFolder || app.getPath('documents');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `personal_finance_backup_${timestamp}.json`;
    const fullPath = path.join(defaultDir, fileName);

    await fs.writeFile(fullPath, JSON.stringify(backupData, null, 2), 'utf-8');
    return { success: true, filePath: fullPath };
  }

  /**
   * Restore database from a backup JSON file
   */
  async restoreDatabase(sourceFilePath?: string): Promise<{ success: boolean; message: string }> {
    let filePath = sourceFilePath;
    if (!filePath) {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Chọn file sao lưu để phục hồi',
        filters: [{ name: 'JSON Backup', extensions: ['json'] }],
        properties: ['openFile'],
      });
      if (canceled || filePaths.length === 0) {
        return { success: false, message: 'Đã hủy thao tác phục hồi.' };
      }
      filePath = filePaths[0];
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.wallets || !data.categories) {
      throw new Error('Định dạng file sao lưu không hợp lệ.');
    }

    return withTransaction(async (conn) => {
      // Temporarily disable foreign keys for clean restoration
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');

      try {
        const order = [
          'debt_payments',
          'budget_categories',
          'transactions',
          'recurring_transactions',
          'saving_goals',
          'debts',
          'budgets',
          'categories',
          'wallets',
        ];

        // Clear existing tables
        for (const t of order) {
          await conn.query(`DELETE FROM \`${t}\``);
        }

        // Restore tables in reverse order (independent tables first)
        const restoreOrder = [...order].reverse();
        for (const t of restoreOrder) {
          const rows = data[t];
          if (Array.isArray(rows) && rows.length > 0) {
            for (const row of rows) {
              const keys = Object.keys(row);
              const values = Object.values(row);
              const placeholders = keys.map(() => '?').join(', ');
              const query = `INSERT INTO \`${t}\` (\`${keys.join('`, `')}\`) VALUES (${placeholders})`;
              await conn.query(query, values);
            }
          }
        }

        return { success: true, message: 'Phục hồi dữ liệu thành công từ file sao lưu.' };
      } finally {
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
      }
    });
  }

  /**
   * Export transactions to CSV format
   */
  async exportTransactionsCsv(): Promise<{ success: boolean; filePath?: string; csvContent?: string }> {
    const pool = getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        t.id AS "Mã GD",
        DATE_FORMAT(t.transaction_date, '%d/%m/%Y %H:%i') AS "Ngày giao dịch",
        w.name AS "Ví",
        CASE 
          WHEN t.type = 'income' THEN 'Thu nhập'
          WHEN t.type = 'expense' THEN 'Chi tiêu'
          WHEN t.type = 'transfer' THEN 'Chuyển tiền'
          WHEN t.type = 'adjustment' THEN 'Điều chỉnh'
          ELSE t.type
        END AS "Loại",
        COALESCE(c.name, '') AS "Danh mục",
        t.amount AS "Số tiền",
        COALESCE(t.note, '') AS "Ghi chú"
      FROM transactions t
      LEFT JOIN wallets w ON t.wallet_id = w.id
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.transaction_date DESC
    `);

    if (rows.length === 0) {
      return { success: true, csvContent: 'Mã GD,Ngày giao dịch,Ví,Loại,Danh mục,Số tiền,Ghi chú\n' };
    }

    const headers = Object.keys(rows[0]);
    const lines = [
      headers.join(','),
      ...rows.map(r => 
        headers.map(h => {
          const val = String(r[h] ?? '').replace(/"/g, '""');
          return `"${val}"`;
        }).join(',')
      ),
    ];

    const csvString = '\uFEFF' + lines.join('\n'); // Add UTF-8 BOM for Excel compatibility

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Lưu file báo cáo giao dịch (CSV)',
      defaultPath: `giao_dich_${new Date().toISOString().slice(0, 10)}.csv`,
      filters: [{ name: 'CSV Files', extensions: ['csv'] }],
    });

    if (canceled || !filePath) {
      return { success: false, csvContent: csvString };
    }

    await fs.writeFile(filePath, csvString, 'utf-8');
    return { success: true, filePath };
  }
}
