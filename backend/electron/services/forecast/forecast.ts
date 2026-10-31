import { addDays, prepareDailyFlows, type DailyFlow } from './features';

export interface DailyBaseline {
  createdAt: string;
  asOf: string;
  modelName: string;
  confidence: 'Thấp';
  historyDays: number;
  openingBalance: number;
  dataRange: { start: string; end: string };
  points: Array<DailyFlow & { balance: number }>;
}

/** Baseline uses the last 30 completed days, excluding today's partial data. */
export function forecastBaseline(rows: DailyFlow[], firstDate: string | null, asOf: string, openingBalance: number): DailyBaseline {
  if (!firstDate || firstDate >= asOf) throw new Error('Cần tối thiểu 30 ngày dữ liệu để dự báo.');
  const historyDays = Math.round((Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${firstDate}T00:00:00Z`)) / 86400000);
  if (historyDays < 30) throw new Error(`Cần tối thiểu 30 ngày dữ liệu để dự báo (hiện có ${historyDays} ngày).`);
  if (!Number.isSafeInteger(openingBalance)) throw new Error('Số dư phải là số nguyên VND trong phạm vi an toàn.');
  const start = addDays(asOf, -30);
  const end = addDays(asOf, -1);
  const history = prepareDailyFlows(rows, start, end);
  const income = history.reduce((total, day) => total + day.income, 0) / 30;
  const expense = history.reduce((total, day) => total + day.expense, 0) / 30;
  // Round cumulative totals so daily rounding does not accumulate monetary drift.
  const points = Array.from({ length: 90 }, (_, index) => {
    const day = index + 1;
    const balance = openingBalance + Math.round(day * income) - Math.round(day * expense);
    if (!Number.isSafeInteger(balance)) throw new Error('Kết quả vượt phạm vi số nguyên VND an toàn.');
    return {
      date: addDays(asOf, day),
      income: Math.round(day * income) - Math.round(index * income),
      expense: Math.round(day * expense) - Math.round(index * expense),
      balance,
    };
  });
  return { createdAt: new Date().toISOString(), asOf, modelName: 'Trung bình trượt 30 ngày (baseline)', confidence: 'Thấp', historyDays, openingBalance, dataRange: { start, end }, points };
}
