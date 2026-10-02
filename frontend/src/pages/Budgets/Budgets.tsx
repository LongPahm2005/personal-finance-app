import React, { useCallback, useEffect, useState } from 'react';
import { PieChart, Plus, Trash2, Pencil } from 'lucide-react';
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
import { Budget, Category } from '../../types';

export const Budgets: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [usageMap, setUsageMap] = useState<Record<number, { used_amount: number; remaining_amount: number; usage_percent: number; is_over_budget: boolean }>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [budgetRes, catRes, activeUsageRes] = await Promise.all([
        api.budgets.list(),
        api.categories.list('expense'),
        api.budgets.getActive(),
      ]);

      if (budgetRes.success && budgetRes.data) {
        setBudgets(budgetRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data.filter(c => c.is_active));
      }
      if (activeUsageRes.success && activeUsageRes.data) {
        const nextMap = Object.fromEntries(
          activeUsageRes.data.map(item => [item.budget.id, {
            used_amount: item.used_amount,
            remaining_amount: item.remaining_amount,
            usage_percent: item.usage_percent,
            is_over_budget: item.is_over_budget,
          }])
        );
        setUsageMap(nextMap);
      }
    } catch (error) {
      toast.error('Lỗi tải ngân sách', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setStartDate('');
    setEndDate('');
    setDescription('');
    setSelectedCategoryIds([]);
    setSelectedBudget(null);
  };

  const openCreate = () => {
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setName(budget.name);
    setAmount(String(budget.amount));
    setStartDate(budget.start_date);
    setEndDate(budget.end_date);
    setDescription(budget.description || '');
    setSelectedCategoryIds((budget.categories || []).map(c => c.id));
    setIsOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !amount || !startDate || !endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        amount: Number(amount),
        start_date: startDate,
        end_date: endDate,
        description: description || null,
        category_ids: selectedCategoryIds,
      };

      const res = selectedBudget ? await api.budgets.update(selectedBudget.id, payload) : await api.budgets.create(payload);
      if (res.success) {
        toast.success(selectedBudget ? 'Cập nhật ngân sách thành công' : 'Tạo ngân sách thành công');
        setIsOpen(false);
        resetForm();
        loadData();
      } else {
        toast.error('Không thể lưu ngân sách', res.error);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      const res = await api.budgets.delete(deleteId);
      if (res.success) {
        toast.success('Xóa ngân sách thành công');
        setDeleteId(null);
        loadData();
      } else {
        toast.error('Xóa ngân sách thất bại', res.error);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard title="NGÂN SÁCH HOẠT ĐỘNG" value={String(budgets.length)} subtitle="Số kế hoạch đang sử dụng" icon={<PieChart size={20} />} iconBg="var(--color-primary-light)" iconColor="var(--color-primary)" />
      </div>

      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Ngân sách chi tiêu</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Giới hạn chi theo danh mục và thời gian</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={openCreate}>Thêm ngân sách</Button>
        </div>
      </Card>

      {loading ? (
        <Loading minHeight="300px" />
      ) : budgets.length === 0 ? (
        <EmptyState title="Chưa có ngân sách" description="Tạo ngân sách mới để theo dõi chi tiêu theo danh mục." actionText="Tạo ngân sách" onAction={openCreate} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {budgets.map(budget => {
            const currentUsage = usageMap[budget.id];
            const used = currentUsage?.used_amount ?? 0;
            const remaining = currentUsage?.remaining_amount ?? budget.amount;
            const percent = currentUsage?.usage_percent ?? 0;
            return (
              <Card key={budget.id} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{budget.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{(budget.categories || []).map(c => c.name).join(', ') || 'Tất cả danh mục'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(budget)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(budget.id)}><Trash2 size={14} color="var(--color-expense)" /></Button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hạn mức</span>
                  <span className="font-number" style={{ fontWeight: 700 }}>{formatCurrency(budget.amount)}</span>
                </div>
                <div style={{ width: '100%', height: '10px', borderRadius: '999px', backgroundColor: 'var(--bg-hover)', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', backgroundColor: percent >= 80 ? 'var(--color-expense)' : 'var(--color-primary)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Đã dùng: <span className="font-number" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(used)}</span></span>
                  <span>Còn lại: <span className="font-number" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(remaining)}</span></span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={selectedBudget ? 'Cập nhật ngân sách' : 'Tạo ngân sách'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={submitting}>Hủy</Button>
            <Button onClick={handleSave} isLoading={submitting}>{selectedBudget ? 'Lưu thay đổi' : 'Thêm ngân sách'}</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Tên ngân sách" value={name} onChange={e => setName(e.target.value)} placeholder="Ví dụ: Tiêu dùng hàng tháng" />
          <Input label="Hạn mức (₫)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000000" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Từ ngày" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <Input label="Đến ngày" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <Input label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} placeholder="Mục đích chi tiêu" />

          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Danh mục áp dụng</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(cat => (
                <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-hover)', padding: '8px 10px', borderRadius: 'var(--radius-md)', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => setSelectedCategoryIds(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Xác nhận xóa ngân sách"
        message="Bạn có chắc muốn xóa ngân sách này? Số liệu đã ghi nhận sẽ không còn được lồng vào tính toán chi tiêu."
        isLoading={submitting}
      />
    </div>
  );
};
