import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { api } from '../../services/api';
import { Category } from '../../types';
import { useToast } from '../ui/Toast';

export interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultType?: 'income' | 'expense';
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultType = 'expense',
}) => {
  const toast = useToast();
  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    setType(defaultType);
  }, [defaultType, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      const cRes = await api.categories.list();
      if (cRes.success && cRes.data) {
        setCategories(cRes.data.filter(c => c.is_active));
      }
    }
    loadData();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!numAmount || numAmount <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ lớn hơn 0.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.transactions.create({
        category_id: categoryId ? Number(categoryId) : null,
        type,
        amount: numAmount,
        transaction_date: `${date} ${new Date().toTimeString().slice(0, 8)}`,
        note: note.trim() || undefined,
      });

      if (res.success) {
        toast.success(type === 'income' ? 'Đã ghi nhận thu nhập!' : 'Đã ghi nhận chi tiêu!');
        onClose();
        onSuccess?.();
        setAmount('');
        setNote('');
      } else {
        toast.error('Lỗi khi lưu giao dịch', res.error);
      }
    } catch (err: unknown) {
      toast.error('Lỗi', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm giao dịch mới"
      maxWidth="500px"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Lưu giao dịch
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Type toggle */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            backgroundColor: 'var(--bg-primary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setType('expense')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: type === 'expense' ? 'var(--color-expense)' : 'transparent',
              color: type === 'expense' ? '#FFFFFF' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Chi tiêu
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: type === 'income' ? 'var(--color-income)' : 'transparent',
              color: type === 'income' ? '#FFFFFF' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            Thu nhập
          </button>
        </div>

        {/* Amount */}
        <Input
          label="Số tiền (₫)"
          type="number"
          placeholder="Ví dụ: 150000"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
          autoFocus
        />

        <Select
          label="Danh mục"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          options={filteredCategories.map(c => ({ value: c.id, label: c.name }))}
          placeholder={filteredCategories.length === 0 ? 'Chưa có danh mục' : '-- Chọn danh mục --'}
        />

        {/* Date */}
        <Input
          label="Ngày giao dịch"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />

        {/* Note */}
        <Input
          label="Ghi chú"
          type="text"
          placeholder="Chi tiết giao dịch..."
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </form>
    </Modal>
  );
};
