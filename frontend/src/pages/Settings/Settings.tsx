import React, { useState } from 'react';
import { Database, Download, ShieldCheck, FileText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';

export const Settings: React.FC = () => {
  const toast = useToast();
  const [backupPath, setBackupPath] = useState('');
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

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
        toast.success('Kết nối database thành công');
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
      <Card style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Database size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Cài đặt hệ thống</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <Card style={{ padding: '16px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700 }}>Kết nối DB</span>
              <ShieldCheck size={18} color={dbStatus?.success ? 'var(--color-income)' : 'var(--text-muted)'} />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '13px' }}>
              {dbStatus ? dbStatus.message : 'Chưa kiểm tra'}
            </div>
            <Button variant="secondary" onClick={handleTestDb} isLoading={isRunning}>Kiểm tra kết nối</Button>
          </Card>

          <Card style={{ padding: '16px', backgroundColor: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700 }}>Xuất dữ liệu</span>
              <FileText size={18} color="var(--color-primary)" />
            </div>
            <div style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '13px' }}>Xuất báo cáo giao dịch sang CSV để lưu trữ hoặc chia sẻ.</div>
            <Button variant="secondary" onClick={handleExport} isLoading={isRunning}>Xuất CSV</Button>
          </Card>
        </div>
      </Card>

      <Card style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
          <Database size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Sao lưu dữ liệu</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '520px' }}>
          <Input
            label="Đường dẫn thư mục lưu backup"
            value={backupPath}
            onChange={e => setBackupPath(e.target.value)}
            placeholder="D:/backup/personal-finance"
          />
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button icon={<Download size={16} />} onClick={handleBackup} isLoading={isRunning}>Sao lưu database</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
