// Category
export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  description: string | null;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

// Wallet
export interface Wallet {
  id: number;
  name: string;
  initial_balance: number;
  current_balance: number;
  description: string | null;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

// Transaction
export type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';

export interface Transaction {
  id: number;
  wallet_id: number;
  wallet_name?: string;
  category_id: number | null;
  category_name?: string;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  note: string | null;
  transfer_id: number | null;
  created_at?: string;
  updated_at?: string;
}

// Debt
export type DebtType = 'receivable' | 'payable';
export type DebtStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface Debt {
  id: number;
  type: DebtType;
  person_name: string;
  original_amount: number;
  remaining_amount: number;
  created_date: string;
  due_date: string | null;
  status: DebtStatus;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

// Debt Payment
export interface DebtPayment {
  id: number;
  debt_id: number;
  wallet_id: number;
  wallet_name?: string;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at?: string;
}

// Budget
export interface Budget {
  id: number;
  name: string;
  amount: number;
  start_date: string;
  end_date: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  categories?: Category[];
}

export interface BudgetCategory {
  budget_id: number;
  category_id: number;
}

export interface BudgetUsage {
  budget: Budget;
  used_amount: number;
  remaining_amount: number;
  usage_percent: number;
  is_over_budget: boolean;
}

// Saving Goal
export type SavingGoalStatus = 'active' | 'completed' | 'cancelled';

export interface SavingGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  description: string | null;
  status: SavingGoalStatus;
  created_at?: string;
  updated_at?: string;
}

// Recurring Transaction
export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
  id: number;
  wallet_id: number;
  wallet_name?: string;
  category_id: number | null;
  category_name?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  frequency: RecurringFrequency;
  next_date: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

// API Response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Query Filters & Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFilterParams extends PaginationParams {
  type?: TransactionType;
  wallet_id?: number;
  category_id?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
}

// Dashboard & Reports
export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashFlow: number;
  totalReceivable: number;
  totalPayable: number;
  totalSavings: number;
}

export interface CategoryExpenseReport {
  category_id: number;
  category_name: string;
  total_amount: number;
  percentage: number;
}

export interface MonthlyCashFlow {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
}
