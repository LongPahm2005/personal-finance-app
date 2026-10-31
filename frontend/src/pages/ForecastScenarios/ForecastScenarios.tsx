import { ScenarioCalculationDetails, type ScenarioCalculation } from './ScenarioCalculationDetails';
import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DailyForecast } from './DailyForecast';
import { ScenarioNumberInput, type ScenarioNumber } from './ScenarioNumberInput';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { AiScenario } from '../../types';

export const ForecastScenarios: React.FC = () => {
  const toast = useToast();
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [scenarios, setScenarios] = useState<AiScenario[]>([]);
  const [scenarioError, setScenarioError] = useState('');
  const [scenarioStorageReady, setScenarioStorageReady] = useState(false);

  // Form kịch bản mô phỏng
  const [scenarioName, setScenarioName] = useState<string>('Mua xe máy trả góp');
  const [scenarioType, setScenarioType] = useState<'large_expense' | 'income_loss' | 'custom'>('large_expense');
  const [purchasePrice, setPurchasePrice] = useState<ScenarioNumber>(35000000);
  const [downPayment, setDownPayment] = useState<ScenarioNumber>(10000000);
  const [monthlyPayment, setMonthlyPayment] = useState<ScenarioNumber>(2500000);
  const [scenarioMonths, setScenarioMonths] = useState<ScenarioNumber>(12);
  const [incomeLossPercent, setIncomeLossPercent] = useState<ScenarioNumber>(30);
  const [showValidation, setShowValidation] = useState(false);
  const fieldErrors = {
    purchasePrice: scenarioType === 'large_expense' && (purchasePrice === '' || purchasePrice <= 0) ? 'Giá trị món đồ phải lớn hơn 0.' : '',
    downPayment: scenarioType !== 'income_loss' && downPayment === '' ? 'Vui lòng nhập số tiền trả trước (có thể bằng 0).' : scenarioType === 'large_expense' && purchasePrice !== '' && downPayment !== '' && downPayment > purchasePrice ? 'Tiền trả trước không được vượt giá trị món đồ.' : '',
    monthlyPayment: scenarioType !== 'income_loss' && monthlyPayment === '' ? 'Vui lòng nhập chi phí hàng tháng (có thể bằng 0).' : scenarioType === 'large_expense' && purchasePrice !== '' && downPayment !== '' && downPayment < purchasePrice && monthlyPayment === 0 ? 'Cần nhập khoản trả hàng tháng khi chưa thanh toán đủ.' : '',
    percent: scenarioType === 'income_loss' && (incomeLossPercent === '' || incomeLossPercent < 1 || incomeLossPercent > 100) ? 'Nhập mức giảm từ 1 đến 100%.' : '',
    total: scenarioType === 'large_expense' && purchasePrice !== '' && downPayment !== '' && monthlyPayment !== '' && scenarioMonths !== '' && monthlyPayment * scenarioMonths < purchasePrice - downPayment ? 'Tổng trả góp chưa đủ phần giá mua còn lại.' : scenarioType === 'large_expense' && purchasePrice !== '' && downPayment === purchasePrice && Number(monthlyPayment) > 0 ? 'Đã trả đủ giá mua; khoản trả góp hàng tháng phải bằng 0.' : scenarioType === 'custom' && downPayment === 0 && monthlyPayment === 0 ? 'Kế hoạch cần ít nhất một khoản chi lớn hơn 0.' : '',
    months: scenarioMonths === '' || scenarioMonths < 1 ? 'Thời hạn phải từ 1 đến 600 tháng.' : '',
  };

  useEffect(() => {
    let active = true;
    api.ai.getScenarios().then(result => {
      if (!active) return;
      if (result.success && result.data) {
        setScenarios(result.data);
        setScenarioStorageReady(true);
      }
      else setScenarioError(result.error || 'Không tải được kịch bản.');
    }).catch(() => { if (active) setScenarioError('Không tải được kịch bản. Kiểm tra kết nối database.'); });
    return () => { active = false; };
  }, []);

  const handleRunScenario = async () => {
    if (!scenarioStorageReady) return;
    setShowValidation(true);
    if (Object.values(fieldErrors).some(Boolean)) {
      toast.error('Thông tin chưa hợp lệ', 'Vui lòng kiểm tra các ô được đánh dấu.');
      return;
    }
    if (!scenarioName.trim()) {
      toast.error('Vui lòng nhập tên kịch bản');
      return;
    }
    setIsSimulating(true);
    try {
      const res = await api.ai.runScenario({
        name: scenarioName,
        scenario_type: scenarioType,
        ...(scenarioType === 'large_expense' ? { purchasePrice: Number(purchasePrice) } : {}),
        ...(scenarioType === 'income_loss' ? { incomeLossPercent: Number(incomeLossPercent) } : {}),
        ...(scenarioType !== 'income_loss' ? { expenseAmount: Number(downPayment), monthlyCost: Number(monthlyPayment) } : {}),
        months: Number(scenarioMonths),
      });
      if (res.success && res.data) {
        setScenarios([res.data, ...scenarios]);
        toast.success('Mô phỏng kịch bản What-If thành công!');
      } else {
        toast.error('Mô phỏng thất bại', res.error || 'Vui lòng thử lại');
      }
    } catch {
      toast.error('Mô phỏng thất bại', 'Không kết nối được backend. Vui lòng thử lại.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <DailyForecast />

      <Card style={{ padding: '24px 28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
        {scenarioError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-expense-bg)',
              color: 'var(--color-expense)',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
              border: '1px solid var(--color-expense-border)',
            }}
          >
            {scenarioError}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)',
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Công cụ Mô phỏng Kịch bản Giả định (What-If Analysis)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Nhập giả định để so sánh số dư và xem từng bước tính theo từng loại kịch bản.
              </p>
            </div>
          </div>
          <Badge variant="info">Mô phỏng Độ nhạy</Badge>
        </div>

        {/* Form thiết lập kịch bản */}
        <div
          style={{
            backgroundColor: '#F8FAFC',
            padding: '22px 24px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            marginTop: '16px',
            marginBottom: '28px',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Input
              label="Tên kịch bản kế hoạch"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              placeholder="VD: Mua xe máy trả góp"
            />

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                Loại kịch bản
              </label>
              <select
                value={scenarioType}
                onChange={(e) => setScenarioType(e.target.value as 'large_expense' | 'income_loss' | 'custom')}
                style={{
                  width: '100%',
                  height: '40px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '13.5px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-focus)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--ring-focus)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#CBD5E1';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="large_expense">Mua sắm tài sản lớn / Trả góp</option>
                <option value="income_loss">Dự phòng giảm thu nhập</option>
                <option value="custom">Kế hoạch chi tiêu tùy chỉnh</option>
              </select>
            </div>

            {scenarioType === 'large_expense' && <>
            <ScenarioNumberInput
              label="Tổng giá trị món đồ (VND)"
              money
              value={purchasePrice}
              onChange={setPurchasePrice}
              error={showValidation ? fieldErrors.purchasePrice : undefined}
            />
            </>}
            {scenarioType !== 'income_loss' && <>

            <ScenarioNumberInput
              label={scenarioType === 'large_expense' ? 'Số tiền trả trước (VND)' : 'Khoản chi ban đầu (VND)'}
              money
              value={downPayment}
              onChange={setDownPayment}
              error={showValidation ? fieldErrors.downPayment : undefined}
            />

            <ScenarioNumberInput
              label={scenarioType === 'large_expense' ? 'Khoản trả góp mỗi tháng (VND)' : 'Khoản chi bổ sung mỗi tháng (VND)'}
              money
              value={monthlyPayment}
              onChange={setMonthlyPayment}
              error={showValidation ? fieldErrors.monthlyPayment : undefined}
            />

            </>}
            {scenarioType === 'income_loss' && <ScenarioNumberInput
              label="Mức giảm thu nhập (%)" value={incomeLossPercent} onChange={setIncomeLossPercent} max={100}
              helperText="Nhập tỷ lệ giảm từ 1 đến 100%" error={showValidation ? fieldErrors.percent : undefined}
            />}

            <ScenarioNumberInput
              label="Thời hạn thực hiện (tháng)"
              value={scenarioMonths}
              onChange={setScenarioMonths}
              error={showValidation ? fieldErrors.months : undefined}
            />
          </div>

          {showValidation && fieldErrors.total && <p role="alert" style={{ color: 'var(--color-expense)', fontSize: 13 }}>{fieldErrors.total}</p>}
          {scenarioType === 'large_expense' && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Nhập khoản trả góp theo báo giá của bên cho vay. Tổng thanh toán = trả trước + khoản trả mỗi tháng × số tháng; chênh lệch với giá mua có thể gồm lãi/phí, không dùng để suy ra lãi suất.</p>}
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles size={16} />}
              onClick={handleRunScenario}
              disabled={!scenarioStorageReady}
              isLoading={isSimulating}
              style={{
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                padding: '10px 22px',
                fontSize: '14px',
              }}
            >
              Chạy Mô phỏng & Đánh giá Rủi ro
            </Button>
          </div>
        </div>

        {/* Danh sách các kịch bản đã mô phỏng */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Các kịch bản đã phân tích</span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                backgroundColor: '#F1F5F9',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {scenarios.length}
            </span>
          </h4>
        </div>

        {scenarios.length === 0 ? (
          <div
            style={{
              padding: '36px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13.5px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px dashed #E2E8F0',
            }}
          >
            Chưa có kịch bản mô phỏng nào. Hãy nhập thông số phía trên và bấm &quot;Chạy Mô phỏng&quot; để tính dòng tiền.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {scenarios.map((sc) => {
              const calculation = sc.simulation_result.calculation as ScenarioCalculation | undefined;
              const current = calculation?.version === 1;
              const isWarning = current && calculation.status !== 'stable';
              const isSuccess = current && calculation.status === 'stable';

              const cardBorder = isWarning ? '#FDE68A' : isSuccess ? '#A7F3D0' : '#BAE6FD';
              const cardBg = isWarning ? 'linear-gradient(180deg, #FFFDF5 0%, #FFFFFF 100%)' : isSuccess ? 'linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)' : 'linear-gradient(180deg, #F0F9FF 0%, #FFFFFF 100%)';
              const badgeVariant = isWarning ? 'warning' : isSuccess ? 'income' : 'info';
              const statusText = !current ? 'Kết quả cũ' : isWarning ? 'Cảnh báo dòng tiền' : 'Không âm cuối tháng';

              return (
                <div
                  key={sc.id}
                  className="interactive-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '20px 22px',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                        {sc.name}
                      </span>
                      <Badge variant="info">
                        {sc.scenario_type === 'large_expense' ? 'Mua trả góp' : sc.scenario_type === 'income_loss' ? 'Giảm thu nhập' : sc.scenario_type === 'custom' ? 'Chi tiêu tùy chỉnh' : 'Loại cũ'}
                      </Badge>
                      <Badge variant={badgeVariant}>
                        {statusText}
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{sc.created_at ? sc.created_at.slice(0, 10) : 'Gần đây'}</span>
                    </div>
                  </div>

                  {/* Khối Đánh giá của AI */}
                  <div
                    style={{
                      background: cardBg,
                      padding: '16px 18px',
                      borderRadius: '12px',
                      border: `1px solid ${cardBorder}`,
                      borderLeft: isWarning ? '4px solid #D97706' : isSuccess ? '4px solid #059669' : '4px solid #0284C7',
                      fontSize: '13.5px',
                      lineHeight: 1.6,
                      color: 'var(--text-primary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {isWarning ? (
                        <AlertTriangle size={17} color="#D97706" />
                      ) : isSuccess ? (
                        <CheckCircle2 size={17} color="#059669" />
                      ) : (
                        <Sparkles size={17} color="#0284C7" />
                      )}
                      <strong style={{ color: isWarning ? '#B45309' : isSuccess ? '#047857' : '#0369A1', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        Đánh giá theo dòng tiền đã tính
                      </strong>
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      {current ? sc.ai_evaluation : 'Kết quả cũ chưa có bảng tính kiểm chứng. Hãy chạy lại với loại kịch bản và thông số mong muốn.'}
                    </div>
                  </div>
                  <ScenarioCalculationDetails calculation={calculation} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
