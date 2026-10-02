import React, { useCallback, useEffect, useState } from 'react';
import { PiggyBank, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { SavingGoal } from '../../types';

export const Savings: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [isGoalOpen, setIsGoalOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingGoal | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [contribution, setContribution] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.savings.list();
      if (res.success && res.data) setGoals(res.data);
    } catch (error) {
      toast.error('Lỗi tải mục tiêu tiết kiệm', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetGoalForm = () => {
    setName('');
    setTarget('');
    setCurrentAmount('');
    setTargetDate('');
    setDescription('');
    setSelectedGoal(null);
  };

  const handleSaveGoal = async () => {
    if (!name.trim() || !target) {
      toast.error('Vui lòng điền đầy đủ tên và mục tiêu');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        target_amount: Number(target),
        current_amount: Number(currentAmount) || 0,
        target_date: targetDate || null,
        description: description || null,
      };

      const res = selectedGoal ? await api.savings.update(selectedGoal.id, payload) : await api.savings.create(payload);

      if (res.success) {
        toast.success(selectedGoal ? 'Cập nhật mục tiêu thành công' : 'Tạo mục tiêu tiết kiệm thành công');
        setIsGoalOpen(false);
        resetGoalForm();
        loadData();
      } else {
        toast.error('Không thể lưu mục tiêu', res.error);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddContribution = async () => {
    if (!selectedGoal || !contribution) {
      toast.error('Vui lòng nhập số tiền đóng góp');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.savings.addAmount(selectedGoal.id, Number(contribution));
      if (res.success) {
        toast.success('Đóng góp thành công');
        setIsContributeOpen(false);
        setContribution('');
        loadData();
      } else {
        toast.error('Không thể đóng góp', res.error);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteGoal = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      const res = await api.savings.delete(deleteId);
      if (res.success) {
        toast.success('Xóa mục tiêu thành công');
        setDeleteId(null);
        loadData();
      } else {
        toast.error('Xóa thất bại', res.error);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <StatCard title="TỔNG MỤC TIÊU" value={String(goals.length)} subtitle="Các mục tiêu tiết kiệm đang hoạt động" icon={<PiggyBank size={20} />} iconBg="var(--color-primary-light)" iconColor="var(--color-primary)" />

      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Mục tiêu tiết kiệm</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Theo dõi tiến độ và đóng góp định kỳ</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => { resetGoalForm(); setIsGoalOpen(true); }}>Thêm mục tiêu</Button>
        </div>
      </Card>

      {loading ? (
        <Loading minHeight="300px" />
      ) : goals.length === 0 ? (
        <EmptyState title="Chưa có mục tiêu tiết kiệm" description="Tạo mục tiêu đầu tiên để xây kế hoạch tích lũy tài chính." actionText="Thêm mục tiêu" onAction={() => setIsGoalOpen(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {goals.map(goal => {
            const progress = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
            return (
              <Card key={goal.id} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{goal.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{goal.target_date ? `Đến ${goal.target_date}` : 'Không xác định thời hạn'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="ghost" size="sm" onClick={() => { setSelectedGoal(goal); setName(goal.name); setTarget(String(goal.target_amount)); setCurrentAmount(String(goal.current_amount)); setTargetDate(goal.target_date || ''); setDescription(goal.description || ''); setIsGoalOpen(true); }}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(goal.id)}><Trash2 size={14} color="var(--color-expense)" /></Button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tiến độ</span>
                  <span style={{ fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--bg-hover)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress >= 100 ? 'var(--color-income)' : 'var(--color-primary)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Hiện có <span className="font-number" style={{ fontWeight: 700 }}>{formatCurrency(goal.current_amount)}</span></span>
                  <span>Mục tiêu <span className="font-number" style={{ fontWeight: 700 }}>{formatCurrency(goal.target_amount)}</span></span>
                </div>
                <Button variant="secondary" icon={<TrendingUp size={14} />} onClick={() => { setSelectedGoal(goal); setIsContributeOpen(true); }}>Thêm đóng góp</Button>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isGoalOpen}
        onClose={() => setIsGoalOpen(false)}
        title={selectedGoal ? 'Cập nhật mục tiêu' : 'Tạo mục tiêu mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsGoalOpen(false)} disabled={submitting}>Hủy</Button>
            <Button onClick={handleSaveGoal} isLoading={submitting}>{selectedGoal ? 'Lưu thay đổi' : 'Tạo mục tiêu'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Tên mục tiêu" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Khởi nghiệp, du học..." />
          <Input label="Mục tiêu (₫)" type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="50000000" />
          <Input label="Số tiền hiện có (₫)" type="number" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} placeholder="0" />
          <Input label="Ngày mục tiêu" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          <Input label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mục tiêu tiết kiệm của bạn" />
        </div>
      </Modal>

      <Modal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        title={selectedGoal ? `Đóng góp cho ${selectedGoal.name}` : 'Đóng góp'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsContributeOpen(false)} disabled={submitting}>Hủy</Button>
            <Button onClick={handleAddContribution} isLoading={submitting}>Xác nhận</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Input label="Số tiền đóng góp (₫)" type="number" value={contribution} onChange={e => setContribution(e.target.value)} placeholder="500000" />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteGoal}
        title="Xác nhận xóa mục tiêu"
        message="Bạn có muốn xóa mục tiêu tiết kiệm này khỏi danh sách quản lý?"
        isLoading={submitting}
      />
    </div>
  );
};
