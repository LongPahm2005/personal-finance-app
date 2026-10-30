import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sliders,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type { AiForecast, AiScenario } from '../../types';

export const ForecastScenarios: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [forecasts, setForecasts] = useState<AiForecast[]>([]);
  const [scenarios, setScenarios] = useState<AiScenario[]>([]);

  // Form kịch bản mô phỏng
  const [scenarioName, setScenarioName] = useState<string>('Mua xe máy trả góp');
  const [scenarioType, setScenarioType] = useState<'large_expense' | 'income_loss' | 'custom'>('large_expense');
  const [purchasePrice, setPurchasePrice] = useState<number>(35000000);
  const [downPayment, setDownPayment] = useState<number>(10000000);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(2500000);
  const [scenarioMonths, setScenarioMonths] = useState<number>(12);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fcRes, scRes] = await Promise.all([
        api.ai.getForecasts(),
        api.ai.getScenarios(),
      ]);
      if (fcRes.success && fcRes.data) setForecasts(fcRes.data);
      if (scRes.success && scRes.data) setScenarios(scRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu dự báo & kịch bản:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Chạy cập nhật dự báo dòng tiền AI
  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const res = await api.ai.generateForecast();
      if (res.success && res.data) {
        setForecasts(res.data);
        toast.success('AI đã hoàn tất tính toán dự báo dòng tiền 3 tháng tới!');
      } else {
        toast.error('Lỗi dự báo', res.error || 'Vui lòng kiểm tra lại');
      }
    } finally {
      setLoading(false);
    }
  };

  // Chạy mô phỏng kịch bản What-If
  const handleRunScenario = async () => {
    if (!scenarioName.trim()) {
      toast.error('Vui lòng nhập tên kịch bản');
      return;
    }
    setIsSimulating(true);
    try {
      const res = await api.ai.runScenario({
        name: scenarioName,
        scenario_type: scenarioType,
        expenseAmount: downPayment,
        monthlyCost: monthlyPayment,
        months: scenarioMonths,
      });
      if (res.success && res.data) {
        setScenarios([res.data, ...scenarios]);
        toast.success('Mô phỏng kịch bản What-If thành công!');
      } else {
        toast.error('Mô phỏng thất bại', res.error || 'Vui lòng thử lại');
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const chartData = forecasts.map((f) => ({
    period: f.forecast_period,
    'Số dư dự kiến': f.predicted_ending_balance,
    'Kịch bản thận trọng': f.lower_bound_balance,
    'Kịch bản tích cực': f.upper_bound_balance,
    'Thu nhập dự tính': f.predicted_income,
    'Chi tiêu dự tính': f.predicted_expense,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner Giới thiệu Module */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)',
          borderRadius: '16px',
          padding: '22px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(2, 132, 199, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <TrendingUp size={24} color="#38bdf8" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
              Dự báo Dòng tiền & Mô phỏng Kịch bản (What-If)
            </h2>
          </div>
          <div style={{ color: '#e0f2fe', fontSize: '13px', maxWidth: '640px' }}>
            Hỗ trợ ra quyết định trước khi mua sắm tài sản lớn hoặc đầu tư, giúp bạn dự báo sức khỏe dòng tiền trong tương lai và hạn chế nguy cơ mất thanh khoản.
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={handleGenerateForecast}
          isLoading={loading}
          style={{ backgroundColor: '#ffffff', color: '#0369a1', fontWeight: 600 }}
        >
          <RefreshCw size={16} style={{ marginRight: '6px' }} />
          Cập nhật Dự báo AI
        </Button>
      </div>

      {/* PHẦN 1: DỰ BÁO DÒNG TIỀN TƯƠNG LAI (Module 5.3) */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              Biểu đồ Dự báo Số dư & Dòng tiền Tương lai (3 Tháng tới)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Mô hình Time-Series kết hợp phân tích chu kỳ chi tiêu và biến động lịch sử
            </span>
          </div>
          <Badge variant="info">Mô hình AI: Time-Series Forecast</Badge>
        </div>

        {forecasts.length === 0 ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px dashed #cbd5e1',
            }}
          >
            <TrendingUp size={36} color="#94a3b8" style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>
              Chưa có dữ liệu dự báo dòng tiền
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginBottom: '14px' }}>
              Nhấn nút bên dưới để AI tự động phân tích và tạo dự báo cho 3 tháng tới.
            </div>
            <Button variant="primary" onClick={handleGenerateForecast} isLoading={loading}>
              Khởi tạo Dự báo ngay
            </Button>
          </div>
        ) : (
          <>
            <div style={{ width: '100%', height: 280, marginTop: '8px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}Tr`}
                  />
                  <Tooltip
                    formatter={(val: unknown) => [formatCurrency(Number(val)), '']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Kịch bản tích cực"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorUpper)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Số dư dự kiến"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Kịch bản thận trọng"
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bảng số liệu chi tiết các tháng */}
            <div style={{ marginTop: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Kỳ dự báo</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Thu nhập dự kiến</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Chi tiêu dự kiến</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Số dư cuối kỳ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Khoảng tin cậy</th>
                  </tr>
                </thead>
                <tbody>
                  {forecasts.map((f) => (
                    <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600 }}>{f.forecast_period}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a' }}>
                        +{formatCurrency(f.predicted_income)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#dc2626' }}>
                        -{formatCurrency(f.predicted_expense)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                        {formatCurrency(f.predicted_ending_balance)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontSize: '12px', color: '#64748b' }}>
                        {formatCurrency(f.lower_bound_balance)} ~ {formatCurrency(f.upper_bound_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {/* PHẦN 2: MÔ PHỎNG KỊCH BẢN GIẢ ĐỊNH WHAT-IF (Module 5.4) */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Sliders size={20} color="var(--color-primary)" />
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
            Công cụ Mô phỏng Kịch bản Giả định (What-If Analysis)
          </h3>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          Giả định các quyết định tài chính tương lai (mua xe trả góp, chuẩn bị mua sắm đồ đạc, phòng ngừa giảm thu nhập) để AI đánh giá độ an toàn trước khi hành động.
        </div>

        {/* Form thiết lập kịch bản */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Input
              label="Tên kịch bản kế hoạch"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="VD: Mua xe máy trả góp"
            />

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                Loại kịch bản
              </label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value as 'large_expense' | 'income_loss' | 'custom')}
                style={{
                  width: '100%',
                  height: '38px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  padding: '0 10px',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="large_expense">Mua sắm tài sản lớn / Trả góp</option>
                <option value="income_loss">Dự phòng giảm thu nhập</option>
                <option value="custom">Kế hoạch chi tiêu tùy chỉnh</option>
              </select>
            </div>

            <Input
              label="Tổng giá trị món đồ (VND)"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
            />

            <Input
              label="Số tiền trả trước / thanh toán ngay (VND)"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
            />

            <Input
              label="Chi phí phát sinh hàng tháng (VND)"
              type="number"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(Number(e.target.value))}
            />

            <Input
              label="Thời hạn thực hiện (tháng)"
              type="number"
              value={scenarioMonths}
              onChange={(e) => setScenarioMonths(Number(e.target.value))}
            />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="primary"
              icon={<Sparkles size={16} />}
              onClick={handleRunScenario}
              isLoading={isSimulating}
            >
              Chạy Mô phỏng & Đánh giá Rủi ro
            </Button>
          </div>
        </div>

        {/* Danh sách các kịch bản đã mô phỏng */}
        <h4 style={{ margin: '16px 0 12px 0', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Các kịch bản đã phân tích ({scenarios.length})
        </h4>

        {scenarios.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Chưa có kịch bản mô phỏng nào. Hãy nhập thông tin phía trên để bắt đầu thử nghiệm.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scenarios.map((sc) => (
              <div
                key={sc.id}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '16px 18px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>{sc.name}</span>
                    <Badge variant="info">{sc.scenario_type === 'large_expense' ? 'Mua sắm lớn' : 'Kịch bản tùy chỉnh'}</Badge>
                  </div>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {sc.created_at ? sc.created_at.slice(0, 10) : ''}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #0284c7',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: '#334155',
                  }}
                >
                  <strong style={{ color: '#0369a1', display: 'block', marginBottom: '4px' }}>
                    💡 Đánh giá từ Trí tuệ Nhân tạo AI:
                  </strong>
                  {sc.ai_evaluation}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
