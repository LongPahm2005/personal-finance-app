const assert = require('node:assert/strict');
const connection = require('../../backend/dist-electron/database/connection.js');
const { AiService } = require('../../backend/dist-electron/services/ai.service.js');

async function main() {
  const service = new AiService();
  const valid = { name: 'Input check', scenario_type: 'large_expense', purchasePrice: 1000000, expenseAmount: 0, monthlyCost: 100000, months: 12 };
  const originalPool = connection.getPool;
  let writes = 0;
  // In-memory stub only: never connect to or change the user's database.
  connection.getPool = () => ({ query: async () => { writes++; return [{ insertId: 1 }]; } });
  service.reportService = { getDashboardSummary: async () => ({ totalBalance: 20000000, monthlyIncome: 10000000, monthlyExpense: 5000000 }) };
  try {
    for (const changes of [
      { expenseAmount: -1 }, { monthlyCost: -1 }, { purchasePrice: -1 },
      { purchasePrice: 0 }, { expenseAmount: 1000001 }, { monthlyCost: 0 },
      { months: 0 }, { months: -1 }, { months: 1.5 }, { months: 601 },
      { months: undefined }, { monthlyCost: NaN }, { expenseAmount: Infinity },
      { purchasePrice: 10000000000000 }, { expenseAmount: '100.000' },
    ]) await assert.rejects(service.runScenario({ ...valid, ...changes }));
    assert.equal(writes, 0);
    const zeroDown = await service.runScenario(valid);
    assert.equal(zeroDown.simulation_result.remainingBalance, 20000000);
    const paid = await service.runScenario({ ...valid, expenseAmount: 1000000, monthlyCost: 0 });
    assert.equal(paid.simulation_result.newMonthlySurplus, 5000000);
    assert.equal(writes, 2);
    console.log('Scenario input checks passed: reject negative/invalid/oversized values, invalid duration and excessive down payment; preserve valid zero amounts. No database changes.');
  } finally { connection.getPool = originalPool; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
