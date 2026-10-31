import { useEffect, useRef, useState } from 'react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Sparkles, CheckCircle2, AlertCircle, RefreshCw, Cpu } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { DailyBaseline, AiConnectionStatus } from '../../types';

export function DailyForecast() {
  const [forecast, setForecast] = useState<DailyBaseline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState(2000000);
  const [connection, setConnection] = useState<AiConnectionStatus | null>(null);
  const [aiError, setAiError] = useState('');
  const [checking, setChecking] = useState(false);
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);

  const generate = async () => {
    const id = ++request.current;
    setLoading(true);
    setError('');
    try {
      const result = await api.ai.generateDailyBaseline();
      if (id !== request.current) return;
      if (result.success && result.data) setForecast(result.data);
      else setError(result.error || 'Không thể tạo dự báo. Vui lòng thử lại.');
    } catch {
      if (id === request.current) setError('Không kết nối được bộ xử lý dự báo. Hãy khởi động lại ứng dụng.');
    } finally {
      if (id === request.current) setLoading(false);
    }
  };

  const checkAi = async () => {
    setChecking(true);
    setConnection(null);
    setAiError('');
    try {
      const result = await api.ai.testConnection();
      if (result.success && result.data) {
        setConnection(result.data);
        setModel(result.data.model);
      } else setAiError(result.error || 'Không kết nối được AI.');
    } catch {
      setAiError('Không kiểm tra được kết nối AI. Hãy khởi động lại Electron và thử lại.');
    } finally { setChecking(false); }
  };

  const saveModel = async () => {
    setSaving(true);
    setAiError('');
    try {
      const result = await api.ai.saveModel(model);
      if (!result.success) setAiError(result.error || 'Không lưu được mô hình.');
      else await checkAi();
    } catch { setAiError('Không lưu được mô hình. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  };

  const firstWarning = forecast?.points.find(point => point.balance < threshold);
  const lowest = forecast ? Math.min(...forecast.points.map(point => point.balance)) : null;

  return <>
    {/* Banner Tiêu đề Mô phỏng */}
    <div
      style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #0369A1 100%)',
        padding: '24px 28px',
        borderRadius: '16px',
        color: '#FFFFFF',
        boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <TrendingUp size={24} color="#7DD3FC" />
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Dự báo Dòng tiền & Mô phỏng Kịch bản (What-If)
          </h2>
        </div>
        <p style={{ margin: 0, fontSize: '13.5px', color: '#E0F2FE', maxWidth: '650px', lineHeight: 1.5 }}>
          Dự báo 90 ngày từ lịch sử giao dịch thực tế. Mô hình toán học thống kê phân tích sức chịu tải của dòng tiền và cảnh báo nguy cơ mất thanh khoản.
        </p>
      </div>
      <Badge variant="info">AI & Time-Series Engine</Badge>
    </div>

    {/* Card Dự báo Số dư 90 Ngày */}
    <Card style={{ padding: '24px 28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '8px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Dự báo số dư 90 ngày tới (Baseline Forecast)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Trung bình trượt 30 ngày (moving baseline) theo lịch sử thu chi thực tế của bạn.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            onClick={generate}
            isLoading={loading}
            variant="primary"
            icon={<RefreshCw size={15} />}
            style={{ boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' }}
          >
            {forecast ? 'Cập nhật dự báo' : 'Khởi tạo Dự báo ngay'}
          </Button>
          {loading && (
            <Button variant="secondary" onClick={() => { request.current++; setLoading(false); }}>
              Bỏ qua kết quả
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div style={{ padding: '12px 16px', backgroundColor: '#F0F9FF', borderRadius: '8px', color: '#0369A1', fontSize: '13px', margin: '14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          <span>Đang trích xuất giao dịch thực tế và tính toán mô hình dự báo...</span>
        </div>
      )}

      {error && (
        <div role="alert" style={{ padding: '12px 16px', backgroundColor: 'var(--color-expense-bg)', border: '1px solid var(--color-expense-border)', borderRadius: '8px', color: 'var(--color-expense)', fontSize: '13px', margin: '14px 0' }}>
          {error}
        </div>
      )}

      {!forecast && !loading && (
        <div
          style={{
            padding: '36px',
            textAlign: 'center',
            background: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '12px',
            marginTop: '16px',
          }}
        >
          <TrendingUp size={36} color="#94A3B8" style={{ marginBottom: '8px' }} />
          <div style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>
            Chưa có dữ liệu dự báo dòng tiền
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748B', marginTop: '4px' }}>
            Cần tối thiểu các giao dịch thu/chi để AI bắt đầu mô phỏng đường số dư.
          </div>
        </div>
      )}

      {forecast && <>
        <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: '14px 0 16px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center' }}>
          <span>🕒 Tính lúc <strong>{new Date(forecast.createdAt).toLocaleString('vi-VN')}</strong></span>
          <span>📅 Dữ liệu: <strong>{formatDate(forecast.dataRange.start)} – {formatDate(forecast.dataRange.end)}</strong></span>
          <span>💰 Số dư hiện tại: <strong style={{ color: 'var(--color-primary)' }}>{formatCurrency(forecast.openingBalance)}</strong></span>
        </div>

        <div style={{ maxWidth: '320px', marginBottom: '16px' }}>
          <Input
            label="Ngưỡng cảnh báo thanh khoản (VND)"
            type="number"
            min={0}
            step={1}
            value={threshold}
            onChange={event => {
              const value = Number(event.target.value);
              if (Number.isSafeInteger(value) && value >= 0) setThreshold(value);
            }}
          />
        </div>

        <div style={{ height: 320, marginTop: 12, backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecast.points} margin={{ top: 15, right: 25, bottom: 5, left: 15 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={55} fontSize={11} stroke="#64748B" />
              <YAxis tickFormatter={value => `${(value / 1000000).toFixed(1)}Tr`} domain={['auto', 'auto']} fontSize={11} stroke="#64748B" />
              <Tooltip labelFormatter={label => formatDate(String(label))} formatter={value => [formatCurrency(Number(value)), 'Số dư baseline']} contentStyle={{ borderRadius: '8px', border: '1px solid #CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }} />
              <ReferenceLine y={threshold} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Ngưỡng an toàn', fill: '#EF4444', fontSize: 11 }} />
              <Line dataKey="balance" name="Số dư baseline" stroke="#2563EB" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Khối Tóm tắt Thống kê An toàn */}
        <div
          style={{
            marginTop: '18px',
            padding: '14px 18px',
            backgroundColor: firstWarning ? '#FFFBEB' : '#ECFDF5',
            borderRadius: '10px',
            border: firstWarning ? '1px solid #FDE68A' : '1px solid #A7F3D0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {firstWarning ? (
              <AlertCircle size={20} color="#D97706" />
            ) : (
              <CheckCircle2 size={20} color="#059669" />
            )}
            <div style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
              Số dư thấp nhất dự kiến: <strong style={{ color: firstWarning ? '#B45309' : '#047857' }}>{formatCurrency(lowest)}</strong>. {firstWarning ? `Chạm ngưỡng rủi ro lần đầu: ${formatDate(firstWarning.date)}.` : 'An toàn: Không chạm ngưỡng cảnh báo trong 90 ngày.'}
            </div>
          </div>
          <Badge variant={firstWarning ? 'warning' : 'income'}>
            {firstWarning ? 'Cần chú ý dòng tiền' : 'Độ an toàn tốt'}
          </Badge>
        </div>
      </>}
    </Card>

    {/* Card Cấu hình Trợ lý AI Gemini */}
    <Card style={{ padding: '22px 28px', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Cpu size={19} color="var(--color-primary)" />
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Trạng thái Động cơ AI (Google Gemini Cloud)
        </h3>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Kiểm tra độ sẵn sàng của mô hình AI cho các phân tích kịch bản What-If và Chatbot Copilot.
      </p>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={checkAi} isLoading={checking} disabled={saving} icon={<Sparkles size={15} />}>
          Kiểm tra kết nối AI
        </Button>

        {!connection && !aiError && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Chưa thực hiện kiểm tra kết nối.</span>
        )}

        {aiError && (
          <span style={{ fontSize: '13px', color: 'var(--color-expense)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={15} />
            {aiError}
          </span>
        )}

        {connection && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: connection.connected ? '#047857' : '#B45309',
                backgroundColor: connection.connected ? '#ECFDF5' : '#FFFBEB',
                padding: '4px 10px',
                borderRadius: '6px',
                border: connection.connected ? '1px solid #A7F3D0' : '1px solid #FDE68A',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {connection.connected ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {connection.message} ({connection.model})
            </span>

            {connection.models.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  aria-label="Mô hình Gemini được tài khoản hỗ trợ"
                  value={model}
                  onChange={event => setModel(event.target.value)}
                  style={{
                    height: '36px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 10px',
                    fontSize: '13px',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                >
                  {!connection.models.includes(model) && <option value={model}>{model} (không khả dụng)</option>}
                  {connection.models.map(name => <option key={name} value={name}>{name}</option>)}
                </select>

                <Button onClick={saveModel} isLoading={saving} disabled={checking || !connection.models.includes(model)} size="sm">
                  Lưu & Áp dụng
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  </>;
}
