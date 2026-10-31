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
  code?: string;
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

// AI Decision Support (Module 5)
export interface AiProfile {
  id: number;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  monthly_baseline_income: number;
  emergency_fund_target_months: number;
  financial_health_score: number;
  financial_priorities: string[];
  last_analyzed_at?: string;
}

export interface AiRecommendation {
  id: number;
  type: string;
  title: string;
  summary: string;
  detailed_reasoning: string;
  potential_savings: number;
  action_payload: Record<string, unknown> | null;
  status: 'pending' | 'accepted' | 'rejected' | 'dismissed';
  confidence_score: number;
  created_at?: string;
  applied_at?: string;
}

export interface AiAnomaly {
  id: number;
  transaction_id: number | null;
  category_id: number | null;
  category_name?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  anomaly_type: string;
  description: string;
  suggested_action: string | null;
  is_resolved: number;
  created_at?: string;
}

export interface AiForecast {
  id: number;
  forecast_period: string;
  predicted_income: number;
  predicted_expense: number;
  predicted_ending_balance: number;
  lower_bound_balance: number;
  upper_bound_balance: number;
  model_name: string;
  created_at?: string;
}

export interface DailyBaseline {
  createdAt: string;
  asOf: string;
  modelName: string;
  confidence: 'Thấp';
  historyDays: number;
  openingBalance: number;
  dataRange: { start: string; end: string };
  points: Array<{ date: string; income: number; expense: number; balance: number }>;
}

export interface AiConnectionStatus {
  connected: boolean;
  model: string;
  models: string[];
  message: string;
}

export interface AiScenario {
  id: number;
  name: string;
  scenario_type: string;
  parameters: Record<string, unknown>;
  simulation_result: Record<string, unknown>;
  ai_evaluation: string;
  created_at?: string;
}

export interface AiChatSession {
  id: number;
  title: string;
  created_at: string;
}

export interface AiChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiConfig {
  id: number;
  provider: string;
  api_key: string;
  model_name: string;
  temperature: number;
  is_active: number;
}
