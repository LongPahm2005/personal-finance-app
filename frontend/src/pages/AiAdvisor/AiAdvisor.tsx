import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  TrendingUp,
  AlertTriangle,
  Send,
  RefreshCw,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import type {
  AiProfile,
  AiRecommendation,
  AiAnomaly,
  AiForecast,
  AiScenario,
  AiChatMessage,
} from '../../types';

export const AiAdvisor: React.FC = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<string>('recommendations');
  const [loading, setLoading] = useState<boolean>(false);

  // Dữ liệu các tab
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [profile, setProfile] = useState<AiProfile | null>(null);
  const [healthStatus, setHealthStatus] = useState<{ score: number; assessment: string } | null>(null);
  const [anomalies, setAnomalies] = useState<AiAnomaly[]>([]);
  const [forecasts, setForecasts] = useState<AiForecast[]>([]);
  const [scenarios, setScenarios] = useState<AiScenario[]>([]);

  // Chat AI state
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Scenario form state
  const [scenarioName, setScenarioName] = useState<string>('Mua xe máy trả góp');
  const [purchasePrice, setPurchasePrice] = useState<number>(35000000);
  const [downPayment, setDownPayment] = useState<number>(10000000);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(2500000);
  const [scenarioMonths, setScenarioMonths] = useState<number>(12);

  // Tải dữ liệu ban đầu
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [recsRes, profRes, anomRes, fcRes, scenRes, chatRes] = await Promise.all([
        api.ai.getRecommendations(),
        api.ai.getProfile(),
        api.ai.getAnomalies(),
        api.ai.getForecasts(),
        api.ai.getScenarios(),
        api.ai.getChatMessages(1),
      ]);

      if (recsRes.success && recsRes.data) setRecommendations(recsRes.data);
      if (profRes.success && profRes.data) setProfile(profRes.data);
      if (anomRes.success && anomRes.data) setAnomalies(anomRes.data);
      if (fcRes.success && fcRes.data) setForecasts(fcRes.data);
      if (scenRes.success && scenRes.data) setScenarios(scenRes.data);
      if (chatRes.success && chatRes.data) setChatMessages(chatRes.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu AI:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 1. Phân tích và sinh quyết định mới từ AI
  const handleGenerateRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.ai.generateRecommendations();
      if (res.success && res.data) {
        setRecommendations(res.data);
        toast.success('AI đã hoàn tất phân tích số liệu tài chính mới nhất!');
      } else {
        toast.error('Không thể sinh khuyến nghị', res.error || 'Vui lòng kiểm tra API Key');
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Chấp nhận khuyến nghị (1-Click Apply)
  const handleApplyRecommendation = async (id: number) => {
    try {
      const res = await api.ai.applyRecommendation(id);
      if (res.success) {
        setRecommendations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'accepted' } : r))
        );
        toast.success('Đã áp dụng quyết định thành công vào kế hoạch tài chính!');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    }
  };

  // 3. Đánh giá sức khỏe tài chính
  const handleEvaluateHealth = async () => {
    try {
      const res = await api.ai.evaluateHealthScore();
      if (res.success && res.data) {
        setHealthStatus(res.data);
        if (profile) setProfile({ ...profile, financial_health_score: res.data.score });
        toast.success(`Điểm sức khỏe tài chính: ${res.data.score}/100`);
      }
    } catch {
      toast.error('Lỗi tính toán');
    }
  };

  // 4. Quét chi tiêu bất thường
  const handleScanAnomalies = async () => {
    try {
      const res = await api.ai.scanAnomalies();
      if (res.success) {
        toast.success(`Đã phát hiện ${res.data || 0} giao dịch cần chú ý!`);
        const anomRes = await api.ai.getAnomalies();
        if (anomRes.success && anomRes.data) setAnomalies(anomRes.data);
      }
    } catch {
      toast.error('Lỗi khi quét');
    }
  };

  // 5. Dự báo dòng tiền
  const handleGenerateForecast = async () => {
    setLoading(true);
    try {
      const res = await api.ai.generateForecast();
      if (res.success && res.data) {
        setForecasts(res.data);
        toast.success('Đã cập nhật dự báo dòng tiền 3 tháng tới!');
      }
    } finally {
      setLoading(false);
    }
  };

  // 6. Chạy mô phỏng kịch bản What-If
  const handleRunScenario = async () => {
    try {
      const res = await api.ai.runScenario({
        name: scenarioName,
        scenario_type: 'large_expense',
        expenseAmount: downPayment,
        monthlyCost: monthlyPayment,
        months: scenarioMonths,
      });
      if (res.success && res.data) {
        setScenarios([res.data, ...scenarios]);
        toast.success('Mô phỏng kịch bản thành công!');
      }
    } catch {
      toast.error('Lỗi mô phỏng');
    }
  };

  // 7. Gửi tin nhắn chat với AI Copilot
  const handleSendMessage = async (textToSend?: string) => {
    const msg = textToSend || inputMessage;
    if (!msg.trim()) return;

    const userMsg: AiChatMessage = { id: Date.now(), role: 'user', content: msg };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await api.ai.sendChatMessage(1, msg);
      if (res.success && res.data) {
        const aiMsg: AiChatMessage = { id: Date.now() + 1, role: 'assistant', content: res.data };
        setChatMessages((prev) => [...prev, aiMsg]);
      } else {
        toast.error('Lỗi phản hồi AI', res.error || 'Vui lòng kiểm tra lại kết nối');
      }
    } finally {
      setIsSending(false);
    }
  };

  const tabs = [
    { id: 'recommendations', label: 'Khuyến nghị & Quyết định', icon: <Zap size={16} />, count: recommendations.filter((r) => r.status === 'pending').length },
    { id: 'chat', label: 'Trợ lý AI Copilot', icon: <Bot size={16} /> },
    { id: 'forecast', label: 'Dự báo & Kịch bản', icon: <TrendingUp size={16} /> },
    { id: 'health', label: 'Sức khỏe & Cảnh báo', icon: <AlertTriangle size={16} />, count: anomalies.length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={24} color="#fde047" />
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>
              Trợ lý Quyết định Tài chính AI (AI-FDSS)
            </h2>
          </div>
          <div style={{ color: '#e0f2fe', fontSize: '14px', maxWidth: '620px' }}>
            Hệ thống phân tích dòng tiền thực tế, phát hiện rủi ro và tự động đưa ra các khuyến nghị tối ưu tài chính cá nhân.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#bfdbfe' }}>Điểm sức khỏe tài chính</div>
            <div style={{ fontSize: '28px', fontWeight: 800 }}>
              {profile?.financial_health_score ?? 0}
              <span style={{ fontSize: '14px', fontWeight: 400 }}>/100</span>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={handleGenerateRecommendations}
            isLoading={loading}
            style={{ backgroundColor: '#ffffff', color: '#1e3a8a', fontWeight: 600 }}
          >
            <RefreshCw size={16} style={{ marginRight: '6px' }} />
            Phân tích lại
          </Button>
        </div>
      </div>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* TAB 1: KHUYẾN NGHỊ & QUYẾT ĐỊNH (5.5) */}
      {activeTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Đề xuất quyết định tài chính từ AI ({recommendations.length})
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Bấm "Áp dụng" để tự động cập nhật vào kế hoạch tài chính
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {recommendations.map((rec) => (
              <Card
                key={rec.id}
                style={{
                  padding: '20px',
                  borderLeft: rec.status === 'accepted' ? '4px solid #10b981' : '4px solid #3b82f6',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                    {rec.title}
                  </div>
                  <Badge variant={rec.status === 'accepted' ? 'income' : 'info'}>
                    {rec.status === 'accepted' ? 'Đã áp dụng' : 'Khuyến nghị mới'}
                  </Badge>
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rec.summary}
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <strong style={{ color: 'var(--text-primary)' }}>Lập luận AI: </strong>
                  {rec.detailed_reasoning}
                </div>

                {rec.potential_savings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ước tính tiết kiệm được:</span>
                    <strong style={{ color: '#10b981', fontSize: '15px' }}>
                      +{formatCurrency(rec.potential_savings)}
                    </strong>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', gap: '10px' }}>
                  {rec.status === 'accepted' ? (
                    <Button variant="secondary" disabled style={{ width: '100%' }}>
                      <CheckCircle size={16} style={{ marginRight: '6px', color: '#10b981' }} />
                      Đã áp dụng vào hệ thống
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => handleApplyRecommendation(rec.id)}
                      style={{ width: '100%' }}
                    >
                      <CheckCircle size={16} style={{ marginRight: '6px' }} />
                      Đồng ý & Áp dụng (1-Click)
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TRỢ LÝ AI COPILOT CHAT (5.6) */}
      {activeTab === 'chat' && (
        <Card style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '620px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', marginBottom: '14px' }}>
            <Bot size={22} color="var(--color-primary)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Trợ lý Cố vấn Quyết định Tài chính</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hỏi đáp trực tiếp dựa trên dữ liệu thu/chi và số dư thực tế của bạn</div>
            </div>
          </div>

          {/* Quick prompt chips */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '10px' }}>
            {[
              'Tháng này tôi còn bao nhiêu tiền có thể tiêu?',
              'Làm sao để trả hết nợ nhanh nhất?',
              'Đánh giá giúp tôi cơ cấu chi tiêu tháng này',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => handleSendMessage(chip)}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages list */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingRight: '6px',
            }}
          >
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : 'var(--bg-primary)',
                  color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {msg.content}
              </div>
            ))}
            {isSending && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                AI đang suy nghĩ và phân tích dữ liệu tài chính...
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
            <input
              type="text"
              placeholder="Nhập câu hỏi tài chính của bạn (ví dụ: Có nên mua laptop 20 triệu lúc này?)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '14px',
              }}
            />
            <Button variant="primary" onClick={() => handleSendMessage()} isLoading={isSending}>
              <Send size={16} />
            </Button>
          </div>
        </Card>
      )}

      {/* TAB 3: DỰ BÁO DÒNG TIỀN & MÔ PHỎNG WHAT-IF (5.3 & 5.4) */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 5.3 Dự báo dòng tiền */}
          <Card style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Dự báo dòng tiền & Số dư tương lai (5.3)</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Mô hình chuỗi thời gian ước tính 3 tháng tới dựa trên thói quen chi tiêu</div>
              </div>
              <Button variant="secondary" onClick={handleGenerateForecast}>
                Cập nhật dự báo
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {forecasts.map((fc) => (
                <Card key={fc.id} style={{ padding: '16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
                    Tháng {fc.forecast_period}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>Dự báo thu:</span>
                    <strong style={{ color: '#10b981' }}>+{formatCurrency(fc.predicted_income)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                    <span>Dự báo chi:</span>
                    <strong style={{ color: '#ef4444' }}>-{formatCurrency(fc.predicted_expense)}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>Số dư dự kiến:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(fc.predicted_ending_balance)}</strong>
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          {/* 5.4 Mô phỏng What-If */}
          <Card style={{ padding: '20px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700 }}>
              Mô phỏng kịch bản giả định What-If (5.4)
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Tính toán thử tính khả thi trước khi quyết định mua sắm món đồ lớn hoặc chuẩn bị cho rủi ro
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <Input
                label="Tên kịch bản"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
              <Input
                label="Giá trị món đồ (VND)"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
              />
              <Input
                label="Số tiền trả trước (VND)"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
              />
              <Input
                label="Trả góp hàng tháng (VND)"
                type="number"
                value={monthlyPayment}
                onChange={(e) => setMonthlyPayment(Number(e.target.value))}
              />
              <Input
                label="Thời hạn (tháng)"
                type="number"
                value={scenarioMonths}
                onChange={(e) => setScenarioMonths(Number(e.target.value))}
              />
            </div>

            <Button variant="primary" onClick={handleRunScenario}>
              Chạy mô phỏng đánh giá AI
            </Button>

            {/* Danh sách kết quả mô phỏng */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    padding: '14px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px' }}>{sc.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sc.created_at?.slice(0, 10)}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {sc.ai_evaluation}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: SỨC KHỎE TÀI CHÍNH & CẢNH BÁO BẤT THƯỜNG (5.1 & 5.2) */}
      {activeTab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            <Card style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700 }}>Hồ sơ & Khẩu vị rủi ro (5.1)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Khẩu vị rủi ro:</span>
                  <Badge variant="info">{profile?.risk_tolerance?.toUpperCase() || 'MODERATE'}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mục tiêu quỹ khẩn cấp:</span>
                  <strong>{profile?.emergency_fund_target_months || 6} tháng chi tiêu</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Đánh giá hiện tại:</span>
                  <strong>
                    {healthStatus?.assessment ||
                      (profile?.financial_health_score && profile.financial_health_score > 0
                        ? 'Khá (Dòng tiền ổn định)'
                        : 'Chưa có dữ liệu')}
                  </strong>
                </div>
                <Button variant="secondary" onClick={handleEvaluateHealth} style={{ marginTop: '10px' }}>
                  Đo lại điểm sức khỏe
                </Button>
              </div>
            </Card>

            <Card style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Cảnh báo chi tiêu bất thường (5.2)</h3>
                <Button variant="secondary" onClick={handleScanAnomalies}>
                  Quét ngay
                </Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {anomalies.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Không có khoản chi bất thường nào gần đây.</div>
                ) : (
                  anomalies.map((an) => (
                    <div
                      key={an.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#fff1f2',
                        border: '1px solid #fecdd3',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ color: '#be123c', fontWeight: 700, marginBottom: '2px' }}>{an.description}</div>
                      <div style={{ color: '#881337' }}>{an.suggested_action}</div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
