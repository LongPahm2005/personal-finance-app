import React, { useState, useEffect } from 'react';
import { Database, Download, ShieldCheck, FileText, Sparkles, Check, Save, RotateCcw } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';

const availableModels = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    badge: 'Khuyên dùng',
    purpose: 'Tư vấn nhanh & Ra quyết định hàng ngày',
    description: 'Tốc độ phản hồi cực nhanh, tối ưu hóa sinh quyết định tài chính tự động (1-Click) và phân tích giao dịch theo thời gian thực.',
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Thế hệ mới',
    purpose: 'Đa tác vụ & Xử lý khối lượng lớn',
    description: 'Dòng Flash nâng cấp mới nhất, tối ưu xử lý đồng thời nhiều kịch bản What-If và rà soát bất thường trên lượng lớn giao dịch.',
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Cân bằng',
    purpose: 'Lập luận chi tiết & Dự báo dòng tiền',
    description: 'Cân bằng hoàn hảo giữa tốc độ và chiều sâu lập luận phân tích xu hướng thu chi trong 30-90 ngày tới.',
  },
  {
    id: 'gemini-flash-latest',
    name: 'Gemini Flash Latest',
    badge: 'Tự động',
    purpose: 'Phiên bản luôn cập nhật',
    description: 'Hệ thống tự động liên kết với bản phát hành chính thức ổn định nhất từ hạ tầng Google Cloud.',
  },
];

export const Settings: React.FC = () => {
  const toast = useToast();
  const [backupPath, setBackupPath] = useState('');
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Model Selection (Module 6.1)
  const [activeModel, setActiveModel] = useState('gemini-3-flash-preview');
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview');
  const [isSavingModel, setIsSavingModel] = useState(false);

  const hasModelChanged = selectedModel !== activeModel;

  useEffect(() => {
    const loadAiConfig = async () => {
      try {
        const res = await api.ai.getConfig();
        if (res.success && res.data && res.data.model_name) {
          setActiveModel(res.data.model_name);
          setSelectedModel(res.data.model_name);
        }
      } catch (err) {
        console.error('Lỗi nạp config AI:', err);
      }
    };
    loadAiConfig();
  }, []);

  const handleSaveModel = async () => {
    setIsSavingModel(true);
    try {
      const res = await api.ai.saveModel(selectedModel);
      if (res.success) {
        setActiveModel(selectedModel);
        toast.success(`Đã lưu thay đổi sang mô hình: ${selectedModel}`);
      } else {
        toast.error('Lưu mô hình thất bại', res.error || 'Vui lòng thử lại');
      }
    } catch (err: unknown) {
      toast.error('Lỗi khi lưu', (err as Error).message || 'Vui lòng khởi động lại ứng dụng');
    } finally {
      setIsSavingModel(false);
    }
  };

  const handleCancelModelChange = () => {
    setSelectedModel(activeModel);
  };

  const handleTestDb = async () => {
    setIsRunning(true);
    try {
      const res = await api.system.testDb();
      const nextStatus = {
        success: Boolean(res.success),
        message: res.message || res.error || (res.success ? 'Kết nối database OK' : 'Kết nối database không thành công'),
      };
      setDbStatus(nextStatus);
      if (res.success) {
        toast.success('Kết nối database MySQL thành công');
      } else {
        toast.error('Kết nối database thất bại', res.message || res.error || 'Vui lòng kiểm tra cấu hình');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleBackup = async () => {
    setIsRunning(true);
    try {
      const res = await api.system.backupDb(backupPath || undefined);
      if (res.success) {
        toast.success('Sao lưu dữ liệu thành công');
      } else {
        toast.error('Sao lưu thất bại', res.error || res.message || 'Vui lòng thử lại');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = async () => {
    setIsRunning(true);
    try {
      const res = await api.system.exportData();
      if (res.success) {
        toast.success('Xuất file CSV thành công');
      } else {
        toast.error('Xuất dữ liệu thất bại', res.error || res.message || 'Vui lòng thử lại');
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 6.1 Tùy chọn Mô hình AI (Hoàn toàn ẩn Key API, chỉ hiển thị tùy chọn Model) */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Sparkles size={24} color="#f59e0b" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Cấu hình Mô hình Trí tuệ Nhân tạo (Module 6.1)</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Tùy chọn mô hình AI phù hợp với mục đích phân tích tài chính và tư vấn của bạn
              </div>
            </div>
          </div>
          <Badge variant="income">ĐANG HOẠT ĐỘNG</Badge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '640px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Chọn mô hình AI (Google Gemini):
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {availableModels.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.04)' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="radio"
                      name="aiModel"
                      checked={isSelected}
                      onChange={() => setSelectedModel(m.id)}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                          {m.name}
                        </span>
                        {m.id === activeModel && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              fontWeight: 700,
                            }}
                          >
                            ✓ ĐANG KÍCH HOẠT
                          </span>
                        )}
                        {m.badge && (
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: isSelected ? 'var(--color-primary)' : '#f1f5f9',
                              color: isSelected ? '#ffffff' : '#475569',
                              fontWeight: 600,
                            }}
                          >
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', marginTop: '3px' }}>
                        🎯 Mục đích: {m.purpose}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {m.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Thanh tác vụ: Chỉ hiển thị nút 'Lưu thay đổi' khi người dùng chọn mô hình khác */}
          {hasModelChanged ? (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '12px 16px',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                marginTop: '6px',
                animation: 'fadeIn 0.2s ease-in-out',
              }}
            >
              <Button
                variant="primary"
                icon={<Save size={16} />}
                onClick={handleSaveModel}
                isLoading={isSavingModel}
              >
                Lưu thay đổi
              </Button>
              <Button
                variant="outline"
                icon={<RotateCcw size={16} />}
                onClick={handleCancelModelChange}
                disabled={isSavingModel}
              >
                Hủy bỏ
              </Button>
              <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 500 }}>
                Bạn đang chuyển sang: <strong>{selectedModel}</strong>
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
              <Badge variant="income">
                <Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Đang sử dụng: {activeModel}
              </Badge>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                (Chọn một mô hình khác ở trên để xuất hiện nút Lưu thay đổi)
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* 6.3 Kiểm tra kết nối & Tiện ích */}
      <Card style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Database size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Hệ thống & Cơ sở dữ liệu (Module 6.3)</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Card style={{ padding: '16px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700 }}>Kết nối MySQL</span>
              <ShieldCheck size={18} color={dbStatus?.success ? 'var(--color-income)' : 'var(--text-muted)'} />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '13px' }}>
              {dbStatus ? dbStatus.message : 'Chưa kiểm tra (Mặc định: MySQL 3306)'}
            </div>
            <Button variant="secondary" onClick={handleTestDb} isLoading={isRunning}>
              Kiểm tra kết nối
            </Button>
          </Card>

          <Card style={{ padding: '16px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700 }}>Xuất dữ liệu</span>
              <FileText size={18} color="var(--color-primary)" />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '13px' }}>
              Xuất toàn bộ báo cáo giao dịch sang file CSV/Excel để phân tích bên ngoài.
            </div>
            <Button variant="secondary" onClick={handleExport} isLoading={isRunning}>
              Xuất CSV
            </Button>
          </Card>
        </div>
      </Card>

      {/* 6.2 Sao lưu dữ liệu */}
      <Card style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Database size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Sao lưu dữ liệu cá nhân (Module 6.2)</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px' }}>
          <Input
            label="Đường dẫn thư mục lưu backup"
            value={backupPath}
            onChange={(e) => setBackupPath(e.target.value)}
            placeholder="D:/backup/personal-finance (để trống sẽ lưu vào Documents)"
          />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button icon={<Download size={16} />} onClick={handleBackup} isLoading={isRunning}>
              Sao lưu MySQL Database
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
