import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, RefreshCw, ShieldCheck, Sparkles, XCircle, Zap } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { AiAnomaly, AiProfile, AiRecommendation, SavingGoal } from '../../types';

export const AiRecommendations: React.FC<{ goals: SavingGoal[] }> = ({ goals }) => {
  const toast = useToast();
  const [recommendations, setRecommendations] = useState<AiRecommendation[]>([]);
  const [anomalies, setAnomalies] = useState<AiAnomaly[]>([]);
  const [profile, setProfile] = useState<AiProfile | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const loadAiData = useCallback(async () => {
    const [anomaliesRes, profileRes] = await Promise.all([
      api.ai.getAnomalies(), api.ai.getProfile(),
    ]);
    if (anomaliesRes.success && anomaliesRes.data) setAnomalies(anomaliesRes.data);
    if (profileRes.success && profileRes.data) setProfile(profileRes.data);
  }, []);

  useEffect(() => { loadAiData(); }, [loadAiData]);

  const handleGenerateAiRecommendations = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.ai.generateSavingsRecommendations(goals
        .filter(goal => goal.status === 'active')
        .map(({ id, name, target_amount, current_amount, target_date, description }) => ({
          id, name, target_amount, current_amount, target_date, description,
        })));
      if (res.success && res.data) {
        setRecommendations(res.data);
        toast.success('AI đã phân tích dữ liệu và cập nhật khuyến nghị mới!');
      } else toast.error('Lỗi phân tích AI', res.error || 'Vui lòng kiểm tra lại');
    } finally { setIsAiLoading(false); }
  };

  const handleApplyRecommendation = async (id: number) => {
    try {
      const res = await api.ai.applyRecommendation(id);
      if (res.success) {
        setRecommendations(prev => prev.map(item => item.id === id ? { ...item, status: 'accepted' } : item));
        toast.success('Đã áp dụng quyết định thành công!');
        loadAiData();
      }
    } catch { toast.error('Lỗi khi áp dụng khuyến nghị'); }
  };

  const handleDismissRecommendation = async (id: number) => {
    try {
      const res = await api.ai.dismissRecommendation(id);
      if (res.success) {
        setRecommendations(prev => prev.map(item => item.id === id ? { ...item, status: 'dismissed' } : item));
        toast.success('Đã bỏ qua khuyến nghị');
      }
    } catch { toast.error('Lỗi thao tác'); }
  };

  const handleScanAnomalies = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.ai.scanAnomalies();
      if (res.success) {
        toast.success(`Đã quét xong: Phát hiện ${res.data || 0} giao dịch bất thường!`);
        const anomaliesRes = await api.ai.getAnomalies();
        if (anomaliesRes.success && anomaliesRes.data) setAnomalies(anomaliesRes.data);
      }
    } finally { setIsAiLoading(false); }
  };

  const handleEvaluateHealth = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.ai.evaluateHealthScore();
      if (res.success && res.data) {
        setProfile(current => current ? { ...current, financial_health_score: res.data!.score } : current);
        toast.success(`Điểm sức khỏe tài chính: ${res.data.score}/100 (${res.data.assessment})`);
      }
    } finally { setIsAiLoading(false); }
  };

  return (
    <Card style={{ padding: '20px 24px', border: '1px solid #bfdbfe', background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={20} color="#ffffff" /></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>Khuyến nghị &amp; Quyết định Tài chính từ AI</h3>
              <Badge variant="income">Sức khỏe: {profile?.financial_health_score ?? 100}/100</Badge>
            </div>
            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>AI phân tích cơ cấu thu chi, nợ và số dư để gợi ý tối ưu dòng tiền cá nhân</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button size="sm" variant="outline" icon={<ShieldCheck size={14} />} onClick={handleEvaluateHealth} isLoading={isAiLoading}>Đo lại điểm</Button>
          <Button size="sm" variant="outline" icon={<AlertCircle size={14} />} onClick={handleScanAnomalies} isLoading={isAiLoading}>Quét chi tiêu lạ</Button>
          <Button size="sm" variant="primary" icon={<RefreshCw size={14} />} onClick={handleGenerateAiRecommendations} isLoading={isAiLoading}>Phân tích lại với AI</Button>
        </div>
      </div>
      {anomalies.length > 0 && <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {anomalies.map(anomaly => <div key={anomaly.id} style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} color="#e11d48" /><span style={{ fontSize: '13px', color: '#9f1239', fontWeight: 600 }}>{anomaly.description}</span><span style={{ fontSize: '12px', color: '#be123c' }}>— {anomaly.suggested_action}</span></div>
          <Badge variant="expense">GIAO DỊCH BẤT THƯỜNG</Badge>
        </div>)}
      </div>}
      {recommendations.filter(item => item.status === 'pending').length === 0 ? (
        <div style={{ padding: '18px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '13px' }}>
          <CheckCircle size={20} color="#16a34a" style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
          Tài chính của bạn hiện tại đang an toàn và ổn định. Nhấn <strong>"Phân tích lại với AI"</strong> để AI rà soát sâu các dữ liệu thu chi mới nhất.
        </div>
      ) : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
        {recommendations.filter(item => item.status === 'pending').slice(0, 4).map(rec => <div key={rec.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}><span style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{rec.title}</span><Badge variant={rec.confidence_score >= 0.85 ? 'income' : 'info'}>{rec.confidence_score ? `Độ tin cậy ${Math.round(rec.confidence_score * 100)}%` : 'KHUYẾN NGHỊ'}</Badge></div>
            <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>{rec.summary}</p>
            {rec.potential_savings > 0 && <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 600, marginBottom: '12px' }}>🎯 Tiết kiệm tiềm năng: {formatCurrency(rec.potential_savings)}</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '10px', flexWrap: 'wrap' }}>
            <Button size="sm" variant="ghost" icon={<XCircle size={14} />} onClick={() => handleDismissRecommendation(rec.id)}>Bỏ qua</Button>
            <Button size="sm" variant="primary" icon={<Zap size={14} />} onClick={() => handleApplyRecommendation(rec.id)}>Áp dụng quyết định</Button>
          </div>
        </div>)}
      </div>}
    </Card>
  );
};
