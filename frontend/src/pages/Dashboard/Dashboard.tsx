import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  PiggyBank,
  AlertTriangle,
  Receipt,
  TrendingUp,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  DashboardSummary,
  Transaction,
  Debt,
  BudgetUsage,
  MonthlyCashFlow,
  CategoryExpenseReport,
  AiRecommendation,
  AiAnomaly,
  AiProfile,
} from '../../types';

const PIE_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const context = useOutletContext<{ refreshKey?: number }>();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [upcomingDebts, setUpcomingDebts] = useState<Debt[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetUsage[]>([]);
  const [cashFlow, setCashFlow] = useState<MonthlyCashFlow[]>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<CategoryExpenseReport[]>([]);

  // AI Decision Support states on Dashboard
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<AiAnomaly[]>([]);
  const [profile, setProfile] = useState<AiProfile | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, cfRes, ceRes, recsRes, anomRes, profRes] = await Promise.all([
        api.reports.getDashboardSummary(),
        api.reports.getMonthlyCashFlow(),
        api.reports.getCategoryExpenses(),
        api.ai.getRecommendations(),
        api.ai.getAnomalies(),
        api.ai.getProfile(),
      ]);

      if (sumRes.success && sumRes.data) {
        setSummary({
          totalBalance: sumRes.data.totalBalance,
          monthlyIncome: sumRes.data.monthlyIncome,
          monthlyExpense: sumRes.data.monthlyExpense,
          netCashFlow: sumRes.data.netCashFlow,
          totalReceivable: sumRes.data.totalReceivable,
          totalPayable: sumRes.data.totalPayable,
          totalSavings: sumRes.data.totalSavings,
        });
        setRecentTransactions(sumRes.data.recentTransactions || []);
        setUpcomingDebts(sumRes.data.upcomingDebts || []);
        setBudgetAlerts(sumRes.data.budgetAlerts || []);
      }

      if (cfRes.success && cfRes.data) {
        setCashFlow(cfRes.data);
      }
      if (ceRes.success && ceRes.data) {
        setCategoryExpenses(ceRes.data);
      }
      if (recsRes.success && recsRes.data) {
        setRecommendations(recsRes.data);
      }
      if (anomRes.success && anomRes.data) {
        setAnomalies(anomRes.data);
      }
      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      }
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateAiRecommendations = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.ai.generateRecommendations();
      if (res.success && res.data) {
        setRecommendations(res.data);
        toast.success('AI đã phân tích dữ liệu và cập nhật khuyến nghị mới!');
      } else {
        toast.error('Lỗi phân tích AI', res.error || 'Vui lòng kiểm tra lại');
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyRecommendation = async (id: number) => {
    try {
      const res = await api.ai.applyRecommendation(id);
      if (res.success) {
        setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' } : r));
        toast.success('Đã áp dụng quyết định thành công!');
        loadDashboardData();
      }
    } catch {
      toast.error('Lỗi khi áp dụng khuyến nghị');
    }
  };

  const handleDismissRecommendation = async (id: number) => {
    try {
      const res = await api.ai.dismissRecommendation(id);
      if (res.success) {
        setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: 'dismissed' } : r));
        toast.success('Đã bỏ qua khuyến nghị');
      }
    } catch {
      toast.error('Lỗi thao tác');
    }
  };

  const handleScanAnomalies = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.ai.scanAnomalies();
      if (res.success) {
        toast.success(`Đã quét xong: Phát hiện ${res.data || 0} giao dịch bất thường!`);
        const anomRes = await api.ai.getAnomalies();
        if (anomRes.success && anomRes.data) setAnomalies(anomRes.data);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEvaluateHealth = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.ai.evaluateHealthScore();
      if (res.success && res.data) {
        if (profile) setProfile({ ...profile, financial_health_score: res.data.score });
        toast.success(`Điểm sức khỏe tài chính: ${res.data.score}/100 (${res.data.assessment})`);
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, context?.refreshKey]);

  if (loading && !summary) {
    return <Loading message="Đang tải dữ liệu tổng quan..." minHeight="400px" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Stat KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard
          title="TỔNG SỐ DƯ"
          value={formatCurrency(summary?.totalBalance)}
          subtitle="Tổng tiền hiện có"
          icon={<Coins size={20} />}
          iconBg="var(--color-primary-light)"
          iconColor="var(--color-primary)"
        />

        <StatCard
          title="THU NHẬP THÁNG"
          value={formatCurrency(summary?.monthlyIncome)}
          subtitle="Tổng thu tháng hiện tại"
          icon={<ArrowDownLeft size={20} />}
          iconBg="var(--color-income-bg)"
          iconColor="var(--color-income)"
        />

        <StatCard
          title="CHI TIÊU THÁNG"
          value={formatCurrency(summary?.monthlyExpense)}
          subtitle="Tổng chi tháng hiện tại"
          icon={<ArrowUpRight size={20} />}
          iconBg="var(--color-expense-bg)"
          iconColor="var(--color-expense)"
        />

        <StatCard
          title="DÒNG TIỀN RÒNG"
          value={formatCurrency(summary?.netCashFlow)}
          subtitle={summary && summary.netCashFlow >= 0 ? 'Thặng dư ngân sách' : 'Thâm hụt chi tiêu'}
          icon={<TrendingUp size={20} />}
          iconBg={summary && summary.netCashFlow >= 0 ? 'var(--color-income-bg)' : 'var(--color-expense-bg)'}
          iconColor={summary && summary.netCashFlow >= 0 ? 'var(--color-income)' : 'var(--color-expense)'}
        />
      </div>

      {/* Sub-KPIs: Debts & Savings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CÔNG NỢ CẦN THU</span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-income)', marginTop: '2px' }}>
              {formatCurrency(summary?.totalReceivable)}
            </div>
          </div>
          <Scale size={20} color="var(--color-income)" />
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CÔNG NỢ PHẢI TRẢ</span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-expense)', marginTop: '2px' }}>
              {formatCurrency(summary?.totalPayable)}
            </div>
          </div>
          <Scale size={20} color="var(--color-expense)" />
        </Card>

        <Card style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>QUỸ TIẾT KIỆM TÍCH LŨY</span>
            <div className="font-number" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px' }}>
              {formatCurrency(summary?.totalSavings)}
            </div>
          </div>
          <PiggyBank size={20} color="var(--color-primary)" />
        </Card>
      </div>

      {/* 2. Urgent Alerts (Overdue Debts or Budget Alerts) */}
      {(upcomingDebts.some(d => d.status === 'overdue') || budgetAlerts.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {upcomingDebts
            .filter(d => d.status === 'overdue')
            .map(debt => (
              <div
                key={`overdue-${debt.id}`}
                style={{
                  backgroundColor: 'var(--color-expense-bg)',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <AlertTriangle size={18} color="var(--color-expense)" />
                  <span style={{ fontSize: '13.5px', color: '#991B1B', fontWeight: 600 }}>
                    Cảnh báo quá hạn: Khoản {debt.type === 'receivable' ? 'phải thu từ' : 'phải trả cho'}{' '}
                    <strong>{debt.person_name}</strong> số tiền{' '}
                    <strong>{formatCurrency(debt.remaining_amount)}</strong> đã quá hạn ngày {formatDate(debt.due_date)}.
                  </span>
                </div>
                <Button size="sm" variant="danger" onClick={() => navigate('/debts')}>
                  Xử lý nợ
                </Button>
              </div>
            ))}

          {budgetAlerts.map(b => (
            <div
              key={`budget-${b.budget.id}`}
              style={{
                backgroundColor: b.is_over_budget ? 'var(--color-expense-bg)' : 'var(--color-warning-bg)',
                border: `1px solid ${b.is_over_budget ? '#FCA5A5' : '#FDE68A'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={18} color={b.is_over_budget ? 'var(--color-expense)' : 'var(--color-warning)'} />
                <span style={{ fontSize: '13.5px', color: b.is_over_budget ? '#991B1B' : '#92400E', fontWeight: 600 }}>
                  {b.is_over_budget
                    ? `Ngân sách "${b.budget.name}" đã VƯỢT hạn mức (${b.usage_percent}%)! Đã chi ${formatCurrency(b.used_amount)} / ${formatCurrency(b.budget.amount)}.`
                    : `Ngân sách "${b.budget.name}" sắp chạm ngưỡng giới hạn (${b.usage_percent}%).`}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/budgets')}>
                Xem ngân sách
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* 2.5 HỖ TRỢ RA QUYẾT ĐỊNH & CẢNH BÁO TÀI CHÍNH TỪ AI (Trọng tâm đề tài) */}
      <Card style={{ padding: '20px 24px', border: '1px solid #bfdbfe', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>
                  Khuyến nghị & Quyết định Tài chính từ AI
                </h3>
                <Badge variant="income">
                  Sức khỏe: {profile?.financial_health_score ?? 100}/100
                </Badge>
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                AI phân tích cơ cấu thu chi, nợ và số dư để gợi ý tối ưu dòng tiền cá nhân
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              size="sm"
              variant="outline"
              icon={<ShieldCheck size={14} />}
              onClick={handleEvaluateHealth}
              isLoading={isAiLoading}
            >
              Đo lại điểm
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<AlertCircle size={14} />}
              onClick={handleScanAnomalies}
              isLoading={isAiLoading}
            >
              Quét chi tiêu lạ
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<RefreshCw size={14} />}
              onClick={handleGenerateAiRecommendations}
              isLoading={isAiLoading}
            >
              Phân tích lại với AI
            </Button>
          </div>
        </div>

        {/* Danh sách cảnh báo chi tiêu bất thường (nếu có) */}
        {anomalies.length > 0 && (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {anomalies.map((an) => (
              <div
                key={an.id}
                style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} color="#e11d48" />
                  <span style={{ fontSize: '13px', color: '#9f1239', fontWeight: 600 }}>
                    {an.description}
                  </span>
                  <span style={{ fontSize: '12px', color: '#be123c' }}>
                    — {an.suggested_action}
                  </span>
                </div>
                <Badge variant="expense">GIAO DỊCH BẤT THƯỜNG</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Danh sách Khuyến nghị Quyết định AI */}
        {recommendations.filter(r => r.status === 'pending').length === 0 ? (
          <div
            style={{
              padding: '18px',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
              color: '#64748b',
              fontSize: '13px',
            }}
          >
            <CheckCircle size={20} color="#16a34a" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Tài chính của bạn hiện tại đang an toàn và ổn định. Nhấn <strong>"Phân tích lại với AI"</strong> để AI rà soát sâu các dữ liệu thu chi mới nhất.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {recommendations
              .filter(r => r.status === 'pending')
              .slice(0, 4)
              .map(rec => (
                <div
                  key={rec.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                        {rec.title}
                      </span>
                      <Badge variant={rec.confidence_score >= 0.85 ? 'income' : 'info'}>
                        {rec.confidence_score ? `Độ tin cậy ${Math.round(rec.confidence_score * 100)}%` : 'KHUYẾN NGHỊ'}
                      </Badge>
                    </div>
                    <p style={{ margin: '0 0 10px 0', fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>
                      {rec.summary}
                    </p>
                    {rec.potential_savings > 0 && (
                      <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 600, marginBottom: '12px' }}>
                        🎯 Tiết kiệm tiềm năng: {formatCurrency(rec.potential_savings)}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<XCircle size={14} />}
                      onClick={() => handleDismissRecommendation(rec.id)}
                    >
                      Bỏ qua
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={<Zap size={14} />}
                      onClick={() => handleApplyRecommendation(rec.id)}
                    >
                      Áp dụng quyết định
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* 3. Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Income vs Expense Chart */}
        <Card>
          <CardHeader
            title="Dòng tiền Thu - Chi theo Tháng"
            subtitle="So sánh doanh thu và chi phí trong năm"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                Xem chi tiết <ChevronRight size={14} />
              </Button>
            }
          />
          <div style={{ width: '100%', height: '280px', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="#94A3B8"
                  tickFormatter={val => `${(val / 1000000).toFixed(0)}Tr`}
                />
                <Tooltip
                  formatter={(val: unknown) => [formatCurrency(Number(val)), '']}
                  labelFormatter={lbl => `Tháng: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Thu nhập" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Chi tiêu" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Expenses Breakdown */}
        <Card>
          <CardHeader
            title="Cơ cấu Chi tiêu theo Danh mục"
            subtitle="Tỷ lệ phân bổ chi tiêu tháng này"
          />
          {categoryExpenses.length === 0 ? (
            <EmptyState
              title="Chưa có dữ liệu chi tiêu"
              description="Hãy thêm các khoản chi tiêu để xem phân tích cơ cấu danh mục."
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', height: '280px' }}>
              <div style={{ width: '55%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="total_amount"
                      nameKey="category_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {categoryExpenses.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: unknown) => [formatCurrency(Number(val)), 'Số tiền']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend list */}
              <div
                style={{
                  width: '45%',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingRight: '8px',
                }}
              >
                {categoryExpenses.slice(0, 6).map((cat, idx) => (
                  <div key={cat.category_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: 'var(--text-secondary)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.category_name}
                      </span>
                    </div>
                    <span className="font-number" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Bottom Grid: Recent Transactions & Active Budgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Recent Transactions List */}
        <Card>
          <CardHeader
            title="Giao dịch gần đây"
            subtitle="Các khoản thu chi mới nhất được ghi nhận"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                Xem tất cả <ChevronRight size={14} />
              </Button>
            }
          />

          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Chưa có giao dịch nào"
              description="Bấm 'Thêm giao dịch' ở góc trên để tạo giao dịch đầu tiên của bạn."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentTransactions.map(tx => {
                let badgeVariant: 'income' | 'expense' | 'transfer' | 'adjustment' = 'expense';
                let sign = '-';
                let amountColor = 'var(--color-expense)';

                if (tx.type === 'income') {
                  badgeVariant = 'income';
                  sign = '+';
                  amountColor = 'var(--color-income)';
                } else if (tx.type === 'transfer') {
                  badgeVariant = 'transfer';
                  sign = '';
                  amountColor = 'var(--color-info)';
                } else if (tx.type === 'adjustment') {
                  badgeVariant = 'adjustment';
                  sign = '±';
                  amountColor = '#7E22CE';
                }

                return (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor:
                            tx.type === 'income'
                              ? 'var(--color-income-bg)'
                              : tx.type === 'expense'
                              ? 'var(--color-expense-bg)'
                              : 'var(--color-info-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: amountColor,
                          flexShrink: 0,
                        }}
                      >
                        <Receipt size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {tx.category_name || (tx.type === 'transfer' ? 'Chuyển tiền' : 'Giao dịch')}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {formatDate(tx.transaction_date)}
                          {tx.note && ` • ${tx.note}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        className="font-number"
                        style={{
                          fontSize: '14.5px',
                          fontWeight: 700,
                          color: amountColor,
                        }}
                      >
                        {sign}
                        {formatCurrency(tx.amount)}
                      </div>
                      <Badge variant={badgeVariant} size="sm">
                        {tx.type === 'income' ? 'Thu' : tx.type === 'expense' ? 'Chi' : tx.type === 'transfer' ? 'Chuyển' : 'Chỉnh'}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Upcoming Debts Due List */}
        <Card>
          <CardHeader
            title="Công nợ cần chú ý"
            subtitle="Các khoản nợ sắp đến hạn thanh toán"
            action={
              <Button variant="ghost" size="sm" onClick={() => navigate('/debts')}>
                Xem công nợ <ChevronRight size={14} />
              </Button>
            }
          />

          {upcomingDebts.length === 0 ? (
            <EmptyState
              title="Không có nợ đến hạn"
              description="Tất cả các khoản nợ của bạn đang trong hạn thanh toán an toàn."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingDebts.map(debt => {
                const isOverdue = debt.status === 'overdue';
                return (
                  <div
                    key={debt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-primary)',
                      border: `1px solid ${isOverdue ? '#FCA5A5' : 'var(--border-color)'}`,
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {debt.person_name}
                        </span>
                        <Badge variant={debt.type === 'receivable' ? 'income' : 'expense'}>
                          {debt.type === 'receivable' ? 'Phải thu' : 'Phải trả'}
                        </Badge>
                        {isOverdue && <Badge variant="warning">Quá hạn</Badge>}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        Hạn: {debt.due_date ? formatDate(debt.due_date) : 'Không có hạn'}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div className="font-number" style={{ fontSize: '15px', fontWeight: 700, color: debt.type === 'receivable' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                        {formatCurrency(debt.remaining_amount)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Gốc: {formatCurrency(debt.original_amount)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
