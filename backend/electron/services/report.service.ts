import { RowDataPacket } from 'mysql2/promise';
import { getPool } from '../database/connection';
import { TransactionModel } from './transaction.service';
import { DebtModel } from './debt.service';
import { BudgetUsageModel, BudgetService } from './budget.service';
import { WalletService } from './wallet.service';

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  totalReceivable: number;
  totalPayable: number;
  totalSavings: number;
  recentTransactions: TransactionModel[];
  upcomingDebts: DebtModel[];
  budgetAlerts: BudgetUsageModel[];
}

export interface MonthlyCashFlowItem {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
}

export interface CategoryExpenseItem {
  category_id: number;
  category_name: string;
  total_amount: number;
  percentage: number;
}

export class ReportService {
  private budgetService = new BudgetService();

  async getDashboardSummary(): Promise<DashboardData> {
    const pool = getPool();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const startOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01 00:00:00`;
    const lastDay = new Date(currentYear, currentMonth, 0).getDate();
    const endOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;

    // 1. Total balance from visible legacy accounts and the internal transaction ledger
    const totalBalance = await new WalletService().getTotalBalance();

    // 2. Monthly Income & Expense
    const [mRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
      FROM transactions
      WHERE transaction_date >= ? AND transaction_date <= ?
    `, [startOfMonth, endOfMonth]);
    const monthlyIncome = Number(mRows[0]?.inc || 0);
    const monthlyExpense = Number(mRows[0]?.exp || 0);
    const netCashFlow = monthlyIncome - monthlyExpense;

    // 3. Debts (Receivable & Payable)
    const [dRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        SUM(CASE WHEN type = 'receivable' AND status != 'paid' THEN remaining_amount ELSE 0 END) as recv,
        SUM(CASE WHEN type = 'payable' AND status != 'paid' THEN remaining_amount ELSE 0 END) as pay
      FROM debts
    `);
    const totalReceivable = Number(dRows[0]?.recv || 0);
    const totalPayable = Number(dRows[0]?.pay || 0);

    // 4. Savings
    const [sRows] = await pool.query<RowDataPacket[]>(
      'SELECT SUM(current_amount) as total FROM saving_goals WHERE status = "active"'
    );
    const totalSavings = Number(sRows[0]?.total || 0);

    // 5. Recent transactions
    const [txRows] = await pool.query<RowDataPacket[]>(`
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
      LIMIT 6
    `);
    const recentTransactions = txRows.map(r => ({
      ...r,
      amount: Number(r.amount),
    })) as TransactionModel[];

    // 6. Upcoming or Overdue debts
    const [dueRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        id, type, person_name, original_amount, remaining_amount,
        DATE_FORMAT(created_date, '%Y-%m-%d') as created_date,
        DATE_FORMAT(due_date, '%Y-%m-%d') as due_date,
        status, description
      FROM debts
      WHERE status != 'paid' AND due_date IS NOT NULL
      ORDER BY due_date ASC
      LIMIT 5
    `);
    const todayStr = now.toISOString().slice(0, 10);
    const upcomingDebts = dueRows.map(r => {
      let status = r.status;
      if (status !== 'paid' && r.due_date && r.due_date < todayStr) status = 'overdue';
      return {
        ...r,
        original_amount: Number(r.original_amount),
        remaining_amount: Number(r.remaining_amount),
        status,
      };
    }) as DebtModel[];

    // 7. Budget alerts (active budgets with usage >= 80%)
    const activeBudgets = await this.budgetService.getActiveWithUsage();
    const budgetAlerts = activeBudgets.filter(b => b.usage_percent >= 80);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpense,
      netCashFlow,
      totalReceivable,
      totalPayable,
      totalSavings,
      recentTransactions,
      upcomingDebts,
      budgetAlerts,
    };
  }

  async getMonthlyCashFlow(year?: number): Promise<MonthlyCashFlowItem[]> {
    const targetYear = year || new Date().getFullYear();
    const pool = getPool();

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        DATE_FORMAT(transaction_date, '%Y-%m') AS month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
      FROM transactions
      WHERE YEAR(transaction_date) = ?
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
      ORDER BY month ASC
    `, [targetYear]);

    // Format all 12 months so chart has continuous data
    const map = new Map<string, { income: number; expense: number }>();
    for (let m = 1; m <= 12; m++) {
      const key = `${targetYear}-${String(m).padStart(2, '0')}`;
      map.set(key, { income: 0, expense: 0 });
    }

    for (const r of rows) {
      if (map.has(r.month)) {
        map.set(r.month, {
          income: Number(r.income || 0),
          expense: Number(r.expense || 0),
        });
      }
    }

    const result: MonthlyCashFlowItem[] = [];
    map.forEach((val, month) => {
      result.push({
        month,
        income: val.income,
        expense: val.expense,
        net: val.income - val.expense,
      });
    });

    return result;
  }

  async getCategoryExpenses(monthStr?: string): Promise<CategoryExpenseItem[]> {
    const pool = getPool();
    let whereClause = 'WHERE t.type = "expense"';
    const params: unknown[] = [];

    if (monthStr) {
      whereClause += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?';
      params.push(monthStr);
    } else {
      const currentMonth = new Date().toISOString().slice(0, 7);
      whereClause += ' AND DATE_FORMAT(t.transaction_date, "%Y-%m") = ?';
      params.push(currentMonth);
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COALESCE(c.id, 0) AS category_id,
        COALESCE(c.name, 'Khác') AS category_name,
        SUM(t.amount) AS total_amount
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ${whereClause}
      GROUP BY c.id, c.name
      ORDER BY total_amount DESC
    `, params);

    const totalExpense = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);

    return rows.map(r => {
      const amount = Number(r.total_amount);
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return {
        category_id: r.category_id,
        category_name: r.category_name,
        total_amount: amount,
        percentage,
      };
    });
  }

  async getBalanceTrend(months = 6): Promise<{ month: string; balance: number }[]> {
    const pool = getPool();
    // Get net changes per month
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT month, SUM(net) AS net
      FROM (
        SELECT
          DATE_FORMAT(transaction_date, '%Y-%m') AS month,
          CASE
            WHEN type = 'income' THEN amount
            WHEN type = 'expense' THEN -amount
            ELSE 0
          END AS net
        FROM transactions
        UNION ALL
        SELECT
          DATE_FORMAT(p.payment_date, '%Y-%m') AS month,
          CASE WHEN d.type = 'receivable' THEN p.amount ELSE -p.amount END AS net
        FROM debt_payments p
        JOIN debts d ON d.id = p.debt_id
      ) AS monthly_flows
      GROUP BY month
      ORDER BY month DESC
      LIMIT ?
    `, [months]);

    // Current balance includes internal-ledger cash flow and debt payments.
    let runningBalance = await new WalletService().getTotalBalance();

    const reversed = rows.reverse();
    const trend: { month: string; balance: number }[] = [];

    // Calculate backward or forward
    for (let i = reversed.length - 1; i >= 0; i--) {
      trend.unshift({
        month: reversed[i].month,
        balance: runningBalance,
      });
      runningBalance -= Number(reversed[i].net || 0);
    }

    return trend;
  }
}
