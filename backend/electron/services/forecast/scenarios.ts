export interface ScenarioInput {
  name: string;
  scenario_type: 'large_expense' | 'income_loss' | 'custom';
  purchasePrice?: number;
  expenseAmount?: number;
  monthlyCost?: number;
  incomeLossPercent?: number;
  months?: number;
}

export function calculateScenario(data: ScenarioInput, snapshot: { totalBalance: number; monthlyIncome: number; monthlyExpense: number }) {
  const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`;
  const checked = (value: number) => {
    if (!Number.isSafeInteger(value)) throw new Error('Kết quả vượt phạm vi số nguyên VND an toàn.');
    return value;
  };
  if (!data || typeof data.name !== 'string' || !data.name.trim()) throw new Error('Vui lòng nhập tên kịch bản.');
  if (!['large_expense', 'income_loss', 'custom'].includes(data.scenario_type)) throw new Error('Loại kịch bản không hợp lệ.');
  for (const value of [data.purchasePrice, data.expenseAmount, data.monthlyCost]) {
    if (value !== undefined && (!Number.isSafeInteger(value) || value < 0 || value > 9_999_999_999_999)) throw new Error('Số tiền phải là số nguyên VND không âm và không vượt 9.999.999.999.999.');
  }
  if (!Number.isSafeInteger(data.months) || data.months! < 1 || data.months! > 600) throw new Error('Thời hạn phải là số nguyên từ 1 đến 600 tháng.');
  const months = data.months!;
  const opening = checked(Math.round(snapshot.totalBalance));
  const income = checked(Math.round(snapshot.monthlyIncome));
  const expense = checked(Math.round(snapshot.monthlyExpense));
  const surplus = checked(income - expense);
  const steps: Array<{ label: string; formula: string; substitution: string; value: number }> = [];
  const step = (label: string, formula: string, substitution: string, value: number) => steps.push({ label, formula, substitution, value: checked(value) });
  step('Thặng dư cơ sở mỗi tháng', 'Thu nhập − Chi tiêu', `${money(income)} − ${money(expense)}`, surplus);
  let upfront = 0;
  let monthlyImpact = 0;
  if (data.scenario_type === 'large_expense') {
    const price = data.purchasePrice;
    if (!price) throw new Error('Giá trị món đồ phải lớn hơn 0.');
    if (data.expenseAmount === undefined || data.monthlyCost === undefined) throw new Error('Vui lòng nhập tiền trả trước và khoản trả góp hàng tháng.');
    upfront = data.expenseAmount;
    monthlyImpact = data.monthlyCost;
    if (upfront > price) throw new Error('Tiền trả trước không được vượt giá trị món đồ.');
    const principal = price - upfront;
    const installments = checked(monthlyImpact * months);
    if (principal > 0 && monthlyImpact === 0) throw new Error('Cần nhập khoản trả hàng tháng khi chưa thanh toán đủ.');
    if (installments < principal) throw new Error('Tổng khoản trả góp chưa đủ phần giá mua còn lại. Kiểm tra số tiền mỗi tháng hoặc thời hạn.');
    if (principal === 0 && monthlyImpact > 0) throw new Error('Đã thanh toán đủ giá mua; khoản trả góp hàng tháng phải bằng 0.');
    step('Phần giá mua còn lại', 'Giá mua − Trả trước', `${money(price)} − ${money(upfront)}`, principal);
    step('Tổng các khoản trả góp', 'Trả góp mỗi tháng × Số tháng', `${money(monthlyImpact)} × ${months}`, installments);
    step('Tổng tiền thanh toán', 'Trả trước + Tổng trả góp', `${money(upfront)} + ${money(installments)}`, upfront + installments);
    step('Chênh lệch so với giá mua', 'Tổng tiền thanh toán − Giá mua', `${money(upfront + installments)} − ${money(price)}`, upfront + installments - price);
  } else if (data.scenario_type === 'income_loss') {
    const percent = data.incomeLossPercent;
    if (!Number.isInteger(percent) || percent! < 1 || percent! > 100) throw new Error('Mức giảm thu nhập phải là số nguyên từ 1 đến 100%.');
    monthlyImpact = Math.round(income * percent! / 100);
    step('Thu nhập giảm mỗi tháng', 'Thu nhập cơ sở × Tỷ lệ giảm', `${money(income)} × ${percent}% (làm tròn VND)`, monthlyImpact);
    step('Thu nhập sau giảm', 'Thu nhập cơ sở − Mức giảm', `${money(income)} − ${money(monthlyImpact)}`, income - monthlyImpact);
  } else {
    if (data.expenseAmount === undefined || data.monthlyCost === undefined) throw new Error('Vui lòng nhập khoản chi ban đầu và chi hàng tháng.');
    upfront = data.expenseAmount;
    monthlyImpact = data.monthlyCost;
    if (upfront === 0 && monthlyImpact === 0) throw new Error('Kế hoạch cần ít nhất một khoản chi lớn hơn 0.');
    step('Tổng chi bổ sung', 'Chi ban đầu + Chi mỗi tháng × Số tháng', `${money(upfront)} + ${money(monthlyImpact)} × ${months}`, upfront + monthlyImpact * months);
  }
  const afterUpfront = checked(opening - upfront);
  const newSurplus = checked(surplus - monthlyImpact);
  step('Số dư sau chi ban đầu', 'Số dư hiện tại − Khoản chi ban đầu', `${money(opening)} − ${money(upfront)}`, afterUpfront);
  step('Thặng dư sau kịch bản mỗi tháng', 'Thặng dư cơ sở − Tác động mỗi tháng', `${money(surplus)} − ${money(monthlyImpact)}`, newSurplus);
  const schedule = Array.from({ length: months + 1 }, (_, month) => ({
    month,
    baseline: checked(opening + month * surplus),
    balance: checked(afterUpfront + month * newSurplus),
    difference: checked(-upfront - month * monthlyImpact),
  }));
  const ending = schedule[months].balance;
  const difference = schedule[months].difference;
  step('Số dư cuối thời hạn', 'Số dư sau chi ban đầu + Số tháng × Thặng dư mới', `${money(afterUpfront)} + ${months} × (${money(newSurplus)})`, ending);
  step('Chênh lệch cuối kỳ so với cơ sở', '−Chi ban đầu − Số tháng × Tác động mỗi tháng', `−${money(upfront)} − ${months} × ${money(monthlyImpact)}`, difference);
  const minimumBalance = Math.min(...schedule.map(row => row.balance));
  const firstNegativeMonth = schedule.find(row => row.balance < 0)?.month ?? null;
  const status = minimumBalance < 0 ? 'danger' : newSurplus < 0 ? 'warning' : 'stable';
  const evaluation = `${status === 'danger' ? 'Nguy hiểm' : status === 'warning' ? 'Cảnh báo' : 'Theo giả định hiện tại'}: số dư thấp nhất ${money(minimumBalance)}, số dư cuối ${months} tháng ${money(ending)}; thặng dư sau kịch bản ${money(newSurplus)}/tháng. ${firstNegativeMonth !== null ? firstNegativeMonth === 0 ? 'Số dư âm ngay sau khoản chi ban đầu.' : `Số dư âm lần đầu ở tháng ${firstNegativeMonth}.` : 'Không có số dư âm ở các mốc cuối tháng trong thời hạn mô phỏng.'}`;
  const calculation = {
    version: 1, status, snapshot: { openingBalance: opening, monthlyIncome: income, monthlyExpense: expense }, steps, schedule,
    assumptions: [
      'Thu nhập và chi tiêu cơ sở là tổng giao dịch của tháng hiện tại tại thời điểm chạy, có thể chưa đủ tháng; giả định giữ nguyên mỗi tháng tiếp theo.',
      'Tháng 0 là sau khoản chi ban đầu; các tháng 1 trở đi là mốc cuối tháng. Chưa phản ánh ngày nhận lương hay thanh toán trong tháng.',
      data.scenario_type === 'large_expense' ? 'Khoản trả góp do bạn nhập, giả định trả đều trong toàn bộ thời hạn; chênh lệch với giá mua có thể gồm lãi/phí, không suy ra lãi suất.' : 'Tác động kịch bản chỉ áp dụng trong số tháng đã chọn.',
      'Đây là tính toán dòng tiền theo giả định, chưa phải xác suất an toàn hay kết quả Monte Carlo.',
    ],
  };
  return { remainingBalance: afterUpfront, newMonthlySurplus: newSurplus, durationMonths: months, minimumBalance, firstNegativeMonth, endingBalance: ending, difference, calculation, evaluation };
}
