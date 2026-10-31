import { getPool } from '../database/connection';
import type { RowDataPacket } from '../database/types';
import { WalletService } from './wallet.service';
import { forecastBaseline } from './forecast/forecast';
import { addDays, localToday } from './forecast/features';

export class ForecastService {
  async generateBaseline() {
    const pool = getPool();
    const asOf = localToday();
    const [[range], [rows], totalBalance] = await Promise.all([
      pool.query<RowDataPacket[]>(
        "SELECT DATE_FORMAT(MIN(transaction_date), '%Y-%m-%d') AS first_date FROM transactions WHERE type IN ('income', 'expense') AND transaction_date < ?", [asOf]),
      pool.query<RowDataPacket[]>(`
        SELECT DATE_FORMAT(transaction_date, '%Y-%m-%d') AS date,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
        FROM transactions
        WHERE type IN ('income', 'expense') AND transaction_date >= ? AND transaction_date < ?
        GROUP BY DATE_FORMAT(transaction_date, '%Y-%m-%d') ORDER BY date
      `, [addDays(asOf, -30), asOf]),
      new WalletService().getTotalBalance(),
    ]);
    return forecastBaseline(rows.map(row => ({ date: String(row.date), income: Number(row.income), expense: Number(row.expense) })),
      range[0]?.first_date ? String(range[0].first_date) : null, asOf, Math.round(totalBalance));
  }
}
