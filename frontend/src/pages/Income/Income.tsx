import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, ArrowDownLeft } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Transaction, Category } from '../../types';

export const Income: React.FC = () => {
  const context = useOutletContext<{ refreshKey?: number; triggerRefresh?: () => void }>();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formNote, setFormNote] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [txRes, cRes] = await Promise.all([
        api.transactions.list({
          type: 'income',
          search: search || undefined,
          category_id: categoryFilter ? Number(categoryFilter) : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          limit: 100,
        }),
        api.categories.list('income'),
      ]);

      if (txRes.success && txRes.data) {
        setTransactions(txRes.data.items);
      }
      if (cRes.success && cRes.data) {
        setCategories(cRes.data.filter(c => c.is_active));
      }
    } catch (e) {
      console.error(e);
      toast.error('Lỗi tải dữ liệu thu nhập');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, startDate, endDate, toast]);

  useEffect(() => {
    loadData();
  }, [loadData, context?.refreshKey]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingTx(null);
    setFormCategoryId(categories.length > 0 ? String(categories[0].id) : '');
    setFormAmount('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormNote('');
    setIsAddOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setFormCategoryId(tx.category_id ? String(tx.category_id) : '');
    setFormAmount(String(tx.amount));
    setFormDate(tx.transaction_date.slice(0, 10));
    setFormNote(tx.note || '');
    setIsAddOpen(true);
  };

  // Submit form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(formAmount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Số tiền phải lớn hơn 0.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTx) {
        const res = await api.transactions.update(editingTx.id, {
          category_id: formCategoryId ? Number(formCategoryId) : null,
          amount: numAmount,
          transaction_date: `${formDate} 12:00:00`,
          note: formNote.trim() || null,
        });
        if (res.success) {
          toast.success('Cập nhật khoản thu thành công!');
          setIsAddOpen(false);
          loadData();
          context?.triggerRefresh?.();
        } else {
          toast.error('Lỗi cập nhật', res.error);
        }
      } else {
        const res = await api.transactions.create({
          category_id: formCategoryId ? Number(formCategoryId) : null,
          type: 'income',
          amount: numAmount,
          transaction_date: `${formDate} 12:00:00`,
          note: formNote.trim() || null,
        });
        if (res.success) {
          toast.success('Thêm khoản thu nhập thành công!');
          setIsAddOpen(false);
          loadData();
          context?.triggerRefresh?.();
        } else {
          toast.error('Lỗi tạo khoản thu', res.error);
        }
      }
    } catch (err: unknown) {
      toast.error('Lỗi', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setSubmitting(true);
    try {
      const res = await api.transactions.delete(deleteId);
      if (res.success) {
        toast.success('Đã xóa giao dịch thu nhập.');
        setDeleteId(null);
        loadData();
        context?.triggerRefresh?.();
      } else {
        toast.error('Lỗi xóa giao dịch', res.error);
      }
    } catch (err: unknown) {
      toast.error('Lỗi', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Stat Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <StatCard
          title="TỔNG THU NHẬP ĐANG HIỂN THỊ"
          value={formatCurrency(totalIncome)}
          subtitle={`${transactions.length} khoản thu trong danh sách`}
          icon={<ArrowDownLeft size={20} />}
          iconBg="var(--color-income-bg)"
          iconColor="var(--color-income)"
        />
      </div>

      {/* Filter and Actions Bar */}
      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', flex: 1 }}>
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Tìm ghi chú, danh mục..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>

            <div style={{ width: '160px' }}>
              <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Tất cả danh mục"
              />
            </div>

            <div style={{ width: '135px' }}>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                placeholder="Từ ngày"
              />
            </div>

            <div style={{ width: '135px' }}>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                placeholder="Đến ngày"
              />
            </div>

            {(search || categoryFilter || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <Button icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Thêm khoản thu
          </Button>
        </div>
      </Card>

      {/* Table Data */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <Loading minHeight="300px" />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="Không tìm thấy khoản thu nào"
            description="Chưa có khoản thu nhập nào phù hợp với bộ lọc hiện tại."
            actionText="Thêm thu nhập mới"
            onAction={handleOpenAdd}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ngày ghi nhận</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Danh mục</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ghi chú</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Số tiền</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr
                    key={tx.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      {formatDateTime(tx.transaction_date)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.category_name || 'Khác'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: '250px' }}>
                      {tx.note || '-'}
                    </td>
                    <td className="font-number" style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--color-income)', textAlign: 'right' }}>
                      +{formatCurrency(tx.amount)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(tx)}
                          style={{ padding: '4px 8px', height: '28px' }}
                        >
                          <Edit2 size={14} color="var(--color-primary)" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(tx.id)}
                          style={{ padding: '4px 8px', height: '28px' }}
                        >
                          <Trash2 size={14} color="var(--color-expense)" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={editingTx ? 'Chỉnh sửa khoản thu nhập' : 'Thêm khoản thu nhập mới'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button onClick={handleSave} isLoading={submitting}>
              {editingTx ? 'Lưu thay đổi' : 'Thêm thu nhập'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Số tiền (₫)"
            type="number"
            placeholder="Ví dụ: 10000000"
            value={formAmount}
            onChange={e => setFormAmount(e.target.value)}
            required
            autoFocus
          />

          <div>
            <Select
              label="Danh mục thu"
              value={formCategoryId}
              onChange={e => setFormCategoryId(e.target.value)}
              options={categories.map(c => ({ value: c.id, label: c.name }))}
              placeholder={categories.length === 0 ? 'Chưa có danh mục' : '-- Chọn danh mục --'}
            />
          </div>

          <Input
            label="Ngày giao dịch"
            type="date"
            value={formDate}
            onChange={e => setFormDate(e.target.value)}
            required
          />

          <Input
            label="Ghi chú"
            placeholder="Lương tháng này, tiền thưởng dự án..."
            value={formNote}
            onChange={e => setFormNote(e.target.value)}
          />
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa khoản thu"
        message="Bạn có chắc chắn muốn xóa khoản thu nhập này? Số dư ví sẽ tự động bị trừ lại đúng bằng số tiền đã nhận."
        isLoading={submitting}
      />
    </div>
  );
};
