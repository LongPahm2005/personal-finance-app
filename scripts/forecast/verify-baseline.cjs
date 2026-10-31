const assert = require('node:assert/strict');
const { forecastBaseline } = require('../../backend/dist-electron/services/forecast/forecast.js');
const { prepareDailyFlows } = require('../../backend/dist-electron/services/forecast/features.js');

assert.throws(() => forecastBaseline([], null, '2026-10-31', 0), /30/);
assert.throws(() => forecastBaseline([], '2026-10-02', '2026-10-31', 0), /30/);
const zero = forecastBaseline([], '2026-10-01', '2026-10-31', 0);
assert.equal(zero.points.length, 90);
assert.ok(zero.points.every(day => day.balance === 0));
assert.equal(zero.points[0].date, '2026-11-01');
assert.equal(zero.points.at(-1).date, '2027-01-29');
const forecast = forecastBaseline([
  { date: '2026-10-01', income: 30000000, expense: 0 },
  { date: '2026-10-05', income: 0, expense: 15000000 },
  { date: '2026-10-31', income: 999999999, expense: 0 },
  { date: '2026-11-01', income: 999999999, expense: 0 },
], '2026-10-01', '2026-10-31', 0);
assert.equal(forecast.points.at(-1).balance, 45000000);
assert.ok(forecast.points.every(day => Number.isSafeInteger(day.balance)));
assert.equal(prepareDailyFlows([], '2024-02-28', '2024-03-01').length, 3);
const fractional = forecastBaseline([{ date: '2026-10-01', income: 10, expense: 0 }], '2026-10-01', '2026-10-31', 0);
assert.equal(fractional.points.reduce((sum, day) => sum + day.income, 0), 30);
console.log('Baseline checks passed: insufficient history, zero balance, missing days, 90-day horizon, leap day, no future leakage, integer cumulative rounding.');
