import { useId, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';

export interface ScenarioCalculation {
  version: number;
  status: 'danger' | 'warning' | 'stable';
  snapshot: { openingBalance: number; monthlyIncome: number; monthlyExpense: number };
  steps: Array<{ label: string; formula: string; substitution: string; value: number }>;
  schedule: Array<{ month: number; baseline: number; balance: number; difference: number }>;
  assumptions: string[];
}

export function ScenarioCalculationDetails({ calculation }: { calculation?: ScenarioCalculation }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div style={{ marginTop: 14 }}>
    <Button variant="secondary" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      {open ? 'Ẩn cách tính' : 'Xem cách tính'}
    </Button>
    {open && <div id={id} style={{ padding: '16px 0 0', fontSize: 13 }}>
      {!calculation || calculation.version !== 1 ? <p>Kết quả cũ chưa lưu công thức và số liệu nguồn. Hãy chạy lại kịch bản để xem cách tính chính xác; hệ thống không tự suy đoán dữ liệu của lần chạy cũ.</p> : <>
        <p><strong>Số liệu tại thời điểm chạy:</strong> Số dư {formatCurrency(calculation.snapshot.openingBalance)} · Thu nhập tháng {formatCurrency(calculation.snapshot.monthlyIncome)} · Chi tiêu tháng {formatCurrency(calculation.snapshot.monthlyExpense)}</p>
        <ol style={{ paddingLeft: 22 }}>
          {calculation.steps.map((step, index) => <li key={index} style={{ marginBottom: 12 }}>
            <strong>{step.label}</strong><div>{step.formula}</div>
            <div>{step.substitution} = <strong>{formatCurrency(step.value)}</strong></div>
          </li>)}
        </ol>
        <h5 style={{ margin: '16px 0 8px', fontSize: 14 }}>Số dư theo tháng</h5>
        <div style={{ maxHeight: 320, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
            <thead><tr>{['Mốc', 'Cơ sở', 'Sau kịch bản', 'Chênh lệch'].map(label => <th key={label} style={{ padding: 10, textAlign: 'left', background: '#f8fafc', position: 'sticky', top: 0 }}>{label}</th>)}</tr></thead>
            <tbody>{calculation.schedule.map(row => <tr key={row.month}>
              <td style={{ padding: 10 }}>{row.month === 0 ? 'Sau chi ban đầu' : `Cuối tháng ${row.month}`}</td>
              <td style={{ padding: 10 }}>{formatCurrency(row.baseline)}</td>
              <td style={{ padding: 10, color: row.balance < 0 ? '#b91c1c' : undefined }}>{formatCurrency(row.balance)}</td>
              <td style={{ padding: 10 }}>{formatCurrency(row.difference)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <ul>{calculation.assumptions.map(note => <li key={note} style={{ marginTop: 8 }}>{note}</li>)}</ul>
      </>}
    </div>}
  </div>;
}
