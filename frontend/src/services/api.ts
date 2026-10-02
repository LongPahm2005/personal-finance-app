import {
  ApiResponse,
  Category,
  Wallet,
  Transaction,
  Debt,
  DebtPayment,
  Budget,
  BudgetUsage,
  SavingGoal,
  RecurringTransaction,
  DashboardSummary,
  PaginatedResult,
  TransactionFilterParams,
  MonthlyCashFlow,
  CategoryExpenseReport,
} from '../types';

export const api = {
  system: {
    testDb: async (): Promise<ApiResponse> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.system.testDb();
    },
    backupDb: async (targetPath?: string): Promise<ApiResponse<{ filePath: string }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.system.backupDb(targetPath) as Promise<ApiResponse<{ filePath: string }>>;
    },
    restoreDb: async (filePath?: string): Promise<ApiResponse<{ message: string }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.system.restoreDb(filePath) as Promise<ApiResponse<{ message: string }>>;
    },
    exportData: async (): Promise<ApiResponse<{ filePath?: string; csvContent?: string }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.system.exportData() as Promise<ApiResponse<{ filePath?: string; csvContent?: string }>>;
    },
  },

  categories: {
    list: async (type?: 'income' | 'expense'): Promise<ApiResponse<Category[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.categories.list(type) as Promise<ApiResponse<Category[]>>;
    },
    create: async (data: { name: string; type: 'income' | 'expense'; description?: string }): Promise<ApiResponse<Category>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.categories.create(data) as Promise<ApiResponse<Category>>;
    },
    update: async (id: number, data: Partial<Category>): Promise<ApiResponse<Category>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.categories.update(id, data) as Promise<ApiResponse<Category>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.categories.delete(id) as Promise<ApiResponse<void>>;
    },
  },

  wallets: {
    list: async (): Promise<ApiResponse<Wallet[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.list() as Promise<ApiResponse<Wallet[]>>;
    },
    getById: async (id: number): Promise<ApiResponse<Wallet>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.getById(id) as Promise<ApiResponse<Wallet>>;
    },
    create: async (data: { name: string; initial_balance?: number; description?: string }): Promise<ApiResponse<Wallet>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.create(data) as Promise<ApiResponse<Wallet>>;
    },
    update: async (id: number, data: { name?: string; description?: string; is_active?: number }): Promise<ApiResponse<Wallet>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.update(id, data) as Promise<ApiResponse<Wallet>>;
    },
    deactivate: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.deactivate(id) as Promise<ApiResponse<void>>;
    },
    activate: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.activate(id) as Promise<ApiResponse<void>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.delete(id) as Promise<ApiResponse<void>>;
    },
    getTotalBalance: async (): Promise<ApiResponse<number>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.getTotalBalance() as Promise<ApiResponse<number>>;
    },
    adjustBalance: async (walletId: number, newBalance: number, note?: string): Promise<ApiResponse<Wallet>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.wallets.adjustBalance(walletId, newBalance, note) as Promise<ApiResponse<Wallet>>;
    },
  },

  transactions: {
    list: async (filters: TransactionFilterParams): Promise<ApiResponse<PaginatedResult<Transaction>>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.list(filters) as Promise<ApiResponse<PaginatedResult<Transaction>>>;
    },
    getById: async (id: number): Promise<ApiResponse<Transaction>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.getById(id) as Promise<ApiResponse<Transaction>>;
    },
    create: async (data: {
      wallet_id?: number;
      category_id?: number | null;
      type: 'income' | 'expense' | 'adjustment';
      amount: number;
      transaction_date?: string;
      note?: string | null;
    }): Promise<ApiResponse<Transaction>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.create(data) as Promise<ApiResponse<Transaction>>;
    },
    createTransfer: async (data: {
      from_wallet_id: number;
      to_wallet_id: number;
      amount: number;
      transaction_date?: string;
      note?: string | null;
    }): Promise<ApiResponse<{ from: Transaction; to: Transaction }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.createTransfer(data) as Promise<ApiResponse<{ from: Transaction; to: Transaction }>>;
    },
    update: async (id: number, data: Partial<Transaction>): Promise<ApiResponse<Transaction>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.update(id, data) as Promise<ApiResponse<Transaction>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.delete(id) as Promise<ApiResponse<void>>;
    },
    getRecent: async (limit?: number): Promise<ApiResponse<Transaction[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.getRecent(limit) as Promise<ApiResponse<Transaction[]>>;
    },
    getMonthly: async (year: number, month: number): Promise<ApiResponse<{ income: number; expense: number }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.transactions.getMonthly(year, month) as Promise<ApiResponse<{ income: number; expense: number }>>;
    },
  },

  debts: {
    list: async (filters?: { type?: 'receivable' | 'payable'; status?: string; search?: string }): Promise<ApiResponse<Debt[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.list(filters) as Promise<ApiResponse<Debt[]>>;
    },
    getById: async (id: number): Promise<ApiResponse<Debt>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.getById(id) as Promise<ApiResponse<Debt>>;
    },
    create: async (data: {
      type: 'receivable' | 'payable';
      person_name: string;
      original_amount: number;
      created_date?: string;
      due_date?: string | null;
      description?: string | null;
    }): Promise<ApiResponse<Debt>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.create(data) as Promise<ApiResponse<Debt>>;
    },
    update: async (id: number, data: { person_name?: string; due_date?: string | null; description?: string | null }): Promise<ApiResponse<Debt>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.update(id, data) as Promise<ApiResponse<Debt>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.delete(id) as Promise<ApiResponse<void>>;
    },
    pay: async (debtId: number, data: { wallet_id?: number; amount: number; payment_date?: string; note?: string | null }): Promise<ApiResponse<{ debt: Debt; payment: DebtPayment }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.pay(debtId, data) as Promise<ApiResponse<{ debt: Debt; payment: DebtPayment }>>;
    },
    getPayments: async (debtId: number): Promise<ApiResponse<DebtPayment[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.getPayments(debtId) as Promise<ApiResponse<DebtPayment[]>>;
    },
    getSummary: async (): Promise<ApiResponse<{ totalReceivable: number; totalPayable: number; overdueCount: number }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.debts.getSummary() as Promise<ApiResponse<{ totalReceivable: number; totalPayable: number; overdueCount: number }>>;
    },
  },

  budgets: {
    list: async (): Promise<ApiResponse<Budget[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.list() as Promise<ApiResponse<Budget[]>>;
    },
    getById: async (id: number): Promise<ApiResponse<Budget>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.getById(id) as Promise<ApiResponse<Budget>>;
    },
    create: async (data: {
      name: string;
      amount: number;
      start_date: string;
      end_date: string;
      description?: string | null;
      category_ids?: number[];
    }): Promise<ApiResponse<Budget>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.create(data) as Promise<ApiResponse<Budget>>;
    },
    update: async (id: number, data: {
      name?: string;
      amount?: number;
      start_date?: string;
      end_date?: string;
      description?: string | null;
      category_ids?: number[];
    }): Promise<ApiResponse<Budget>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.update(id, data) as Promise<ApiResponse<Budget>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.delete(id) as Promise<ApiResponse<void>>;
    },
    getUsage: async (id: number): Promise<ApiResponse<BudgetUsage>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.getUsage(id) as Promise<ApiResponse<BudgetUsage>>;
    },
    getActive: async (): Promise<ApiResponse<BudgetUsage[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.budgets.getActive() as Promise<ApiResponse<BudgetUsage[]>>;
    },
  },

  savings: {
    list: async (): Promise<ApiResponse<SavingGoal[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.savings.list() as Promise<ApiResponse<SavingGoal[]>>;
    },
    getById: async (id: number): Promise<ApiResponse<SavingGoal>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.savings.getById(id) as Promise<ApiResponse<SavingGoal>>;
    },
    create: async (data: {
      name: string;
      target_amount: number;
      current_amount?: number;
      target_date?: string | null;
      description?: string | null;
    }): Promise<ApiResponse<SavingGoal>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.savings.create(data) as Promise<ApiResponse<SavingGoal>>;
    },
    update: async (id: number, data: Partial<SavingGoal>): Promise<ApiResponse<SavingGoal>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.savings.update(id, data) as Promise<ApiResponse<SavingGoal>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.savings.delete(id) as Promise<ApiResponse<void>>;
    },
    addAmount: async (id: number, amount: number): Promise<ApiResponse<SavingGoal>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.savings.addAmount(id, amount) as Promise<ApiResponse<SavingGoal>>;
    },
  },

  recurring: {
    list: async (): Promise<ApiResponse<RecurringTransaction[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.recurring.list() as Promise<ApiResponse<RecurringTransaction[]>>;
    },
    create: async (data: {
      wallet_id: number;
      category_id?: number | null;
      type: 'income' | 'expense';
      amount: number;
      description?: string | null;
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      next_date: string;
    }): Promise<ApiResponse<RecurringTransaction>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.recurring.create(data) as Promise<ApiResponse<RecurringTransaction>>;
    },
    update: async (id: number, data: Partial<RecurringTransaction>): Promise<ApiResponse<RecurringTransaction>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.recurring.update(id, data) as Promise<ApiResponse<RecurringTransaction>>;
    },
    delete: async (id: number): Promise<ApiResponse<void>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.recurring.delete(id) as Promise<ApiResponse<void>>;
    },
    processDue: async (): Promise<ApiResponse<number>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.recurring.processDue() as Promise<ApiResponse<number>>;
    },
  },

  reports: {
    getDashboardSummary: async (): Promise<ApiResponse<DashboardSummary & {
      recentTransactions: Transaction[];
      upcomingDebts: Debt[];
      budgetAlerts: BudgetUsage[];
    }>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.reports.getDashboardSummary() as Promise<ApiResponse<DashboardSummary & {
        recentTransactions: Transaction[];
        upcomingDebts: Debt[];
        budgetAlerts: BudgetUsage[];
      }>>;
    },
    getMonthlyCashFlow: async (year?: number): Promise<ApiResponse<MonthlyCashFlow[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.reports.getMonthlyCashFlow(year) as Promise<ApiResponse<MonthlyCashFlow[]>>;
    },
    getCategoryExpenses: async (month?: string): Promise<ApiResponse<CategoryExpenseReport[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.reports.getCategoryExpenses(month) as Promise<ApiResponse<CategoryExpenseReport[]>>;
    },
    getBalanceTrend: async (months?: number): Promise<ApiResponse<{ month: string; balance: number }[]>> => {
      if (!window.api) return { success: false, error: 'Electron API không khả dụng.' };
      return window.api.reports.getBalanceTrend(months) as Promise<ApiResponse<{ month: string; balance: number }[]>>;
    },
  },
};
