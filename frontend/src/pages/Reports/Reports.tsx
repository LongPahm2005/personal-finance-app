import React, { useCallback, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, Coins, ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { Loading } from '../../components/ui/Loading';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { DashboardSummary, MonthlyCashFlow, CategoryExpenseReport } from '../../types';

const PIE_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4'];

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [cashFlow, setCashFlow] = useState<MonthlyCashFlow[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpenseReport[]>([]);
  const [balanceTrend, setBalanceTrend] = useState<{ month: string; balance: number }[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, cashRes, categoryRes, trendRes] = await Promise.all([
        api.reports.getDashboardSummary(),
        api.reports.getMonthlyCashFlow(),
        api.reports.getCategoryExpenses(),
        api.reports.getBalanceTrend(6),
      ]);

      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (cashRes.success && cashRes.data) setCashFlow(cashRes.data);
      if (categoryRes.success && categoryRes.data) setCategoryExpenses(categoryRes.data);
      if (trendRes.success && trendRes.data) setBalanceTrend(trendRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return <Loading message="Đang tải báo cáo..." minHeight="400px" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard title="TỔNG SỐ DƯ" value={formatCurrency(summary?.totalBalance ?? 0)} subtitle="Số dư tổng hợp" icon={<Coins size={20} />} iconBg="var(--color-primary-light)" iconColor="var(--color-primary)" />
        <StatCard title="THU NHẬP THÁNG" value={formatCurrency(summary?.monthlyIncome ?? 0)} subtitle="Tổng thu nhập" icon={<ArrowDownLeft size={20} />} iconBg="var(--color-income-bg)" iconColor="var(--color-income)" />
        <StatCard title="CHI TIÊU THÁNG" value={formatCurrency(summary?.monthlyExpense ?? 0)} subtitle="Tổng chi tiêu" icon={<ArrowUpRight size={20} />} iconBg="var(--color-expense-bg)" iconColor="var(--color-expense)" />
        <StatCard title="DÒNG TIỀN RÒNG" value={formatCurrency(summary?.netCashFlow ?? 0)} subtitle="Tăng/giảm trong tháng" icon={<TrendingUp size={20} />} iconBg={summary && summary.netCashFlow >= 0 ? 'var(--color-income-bg)' : 'var(--color-expense-bg)'} iconColor={summary && summary.netCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BarChart3 size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Dòng tiền 6 tháng</h3>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <BarChart data={cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={value => `${Math.round(value / 1000000)}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Legend />
                <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BarChart3 size={18} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Xu hướng số dư</h3>
          </div>
          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer>
              <LineChart data={balanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={value => `${Math.round(value / 1000000)}M`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                <Line type="monotone" dataKey="balance" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <BarChart3 size={18} color="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Chi tiêu theo danh mục</h3>
        </div>

        {categoryExpenses.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>Chưa có dữ liệu chi tiêu danh mục trong tháng này.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(240px, 0.8fr)', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '100%', height: '260px' }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryExpenses} dataKey="total_amount" nameKey="category_name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {categoryExpenses.map((entry, index) => (
                      <Cell key={`${entry.category_id}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {categoryExpenses.map((item, index) => (
                <div key={item.category_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: PIE_COLORS[index % PIE_COLORS.length], display: 'inline-block' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{item.category_name}</span>
                  </div>
                  <div className="font-number" style={{ fontWeight: 700 }}>{formatCurrency(item.total_amount)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
