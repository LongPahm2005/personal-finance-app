export interface DailyFlow { date: string; income: number; expense: number }

export function addDays(date: string, count: number): string {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}

export function localToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Missing calendar days are zero flow, never missing observations. */
export function prepareDailyFlows(rows: DailyFlow[], first: string, last: string): DailyFlow[] {
  const byDate = new Map<string, DailyFlow>();
  for (const row of rows) {
    if (row.date < first || row.date > last) continue;
    const existing = byDate.get(row.date) || { date: row.date, income: 0, expense: 0 };
    for (const key of ['income', 'expense'] as const) {
      if (!Number.isFinite(row[key]) || row[key] < 0) throw new Error('Dữ liệu thu chi không hợp lệ.');
      existing[key] += row[key];
    }
    byDate.set(row.date, existing);
  }
  const result: DailyFlow[] = [];
  for (let date = first; date <= last; date = addDays(date, 1)) {
    result.push(byDate.get(date) || { date, income: 0, expense: 0 });
  }
  return result;
}
