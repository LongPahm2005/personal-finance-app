import React, { useCallback, useEffect, useState } from 'react';
import { Scale, Plus, CircleDollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Debt } from '../../types';

export const Debts: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState({ totalReceivable: 0, totalPayable: 0, overdueCount: 0 });
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<'receivable' | 'payable'>('receivable');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, debtRes] = await Promise.all([
        api.debts.getSummary(),
        api.debts.list(),
      ]);
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
      if (debtRes.success && debtRes.data) setDebts(debtRes.data);
    } catch (error) {
      toast.error('Lỗi tải công nợ', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!personName.trim() || !amount) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.debts.create({
        type,
        person_name: personName.trim(),
        original_amount: Number(amount),
        created_date: new Date().toISOString().slice(0, 10),
        due_date: dueDate || null,
        description: description || null,
      });
      if (res.success) {
        toast.success('Đã tạo dữ liệu công nợ');
        setIsCreateOpen(false);
        setPersonName('');
        setAmount('');
        setDueDate('');
        setDescription('');
        loadData();
      } else {
        toast.error('Tạo công nợ thất bại', res.error);
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePay = async () => {
    if (!selectedDebt || !payAmount) {
      toast.error('Vui lòng nhập số tiền thanh toán');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.debts.pay(selectedDebt.id, {
        amount: Number(payAmount),
        payment_date: `${payDate} 08:00:00`,
        note: payNote || 'Ghi nhận thanh toán',
      });
      if (res.success) {
        toast.success('Ghi nhận thanh toán thành công');
        setIsPayOpen(false);
        setSelectedDebt(null);
        setPayAmount('');
        setPayNote('');
        loadData();
      } else {
        toast.error('Thanh toán thất bại', res.error);
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
        <StatCard title="TỔNG PHẢI THU" value={formatCurrency(summary.totalReceivable)} subtitle="Số nợ chưa thanh toán" icon={<CircleDollarSign size={20} />} iconBg="var(--color-income-bg)" iconColor="var(--color-income)" />
        <StatCard title="TỔNG PHẢI TRẢ" value={formatCurrency(summary.totalPayable)} subtitle="Khoản nợ cần trả" icon={<Scale size={20} />} iconBg="var(--color-expense-bg)" iconColor="var(--color-expense)" />
        <StatCard title="QUÁ HẠN" value={String(summary.overdueCount)} subtitle="Đã quá hạn" icon={<AlertTriangle size={20} />} iconBg="var(--color-warning-bg)" iconColor="var(--color-warning)" />
      </div>

      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Danh sách công nợ</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Theo dõi khoản nợ phải thu và phải trả</p>
          </div>
          <Button icon={<Plus size={16} />} onClick={() => setIsCreateOpen(true)}>Ghi nhận công nợ</Button>
        </div>
      </Card>

      {loading ? (
        <Loading minHeight="300px" />
      ) : debts.length === 0 ? (
        <EmptyState title="Chưa có công nợ" description="Ghi nhận khoản nợ đầu tiên để bắt đầu theo dõi." actionText="Thêm công nợ" onAction={() => setIsCreateOpen(true)} />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Người</th>
                  <th style={{ padding: '12px 16px' }}>Loại</th>
                  <th style={{ padding: '12px 16px' }}>Tổng</th>
                  <th style={{ padding: '12px 16px' }}>Đã thanh toán</th>
                  <th style={{ padding: '12px 16px' }}>Còn lại</th>
                  <th style={{ padding: '12px 16px' }}>Hạn</th>
                  <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                  <th style={{ padding: '12px 16px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {debts.map(debt => (
                  <tr key={debt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{debt.person_name}</td>
                    <td style={{ padding: '12px 16px' }}>{debt.type === 'receivable' ? 'Phải thu' : 'Phải trả'}</td>
                    <td className="font-number" style={{ padding: '12px 16px', fontWeight: 700 }}>{formatCurrency(debt.original_amount)}</td>
                    <td className="font-number" style={{ padding: '12px 16px' }}>{formatCurrency(debt.original_amount - debt.remaining_amount)}</td>
                    <td className="font-number" style={{ padding: '12px 16px', color: debt.type === 'receivable' ? 'var(--color-income)' : 'var(--color-expense)', fontWeight: 700 }}>{formatCurrency(debt.remaining_amount)}</td>
                    <td style={{ padding: '12px 16px' }}>{debt.due_date ? formatDate(debt.due_date) : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '999px', backgroundColor: debt.status === 'paid' ? 'var(--color-income-bg)' : debt.status === 'overdue' ? 'var(--color-expense-bg)' : 'var(--color-warning-bg)', color: debt.status === 'paid' ? 'var(--color-income)' : debt.status === 'overdue' ? 'var(--color-expense)' : 'var(--color-warning)', fontSize: '12px', fontWeight: 600 }}>
                        {debt.status === 'paid' ? 'Đã thanh toán' : debt.status === 'overdue' ? 'Quá hạn' : debt.status === 'partial' ? 'Một phần' : 'Chưa thanh toán'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {debt.status === 'paid' ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-income)', fontWeight: 700 }}>
                          <CheckCircle2 size={16} />
                          Hoàn tất
                        </span>
                      ) : (
                        <Button variant="secondary" size="sm" onClick={() => { setSelectedDebt(debt); setIsPayOpen(true); }}>Thanh toán</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Ghi nhận công nợ"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={submitting}>Hủy</Button>
            <Button onClick={handleCreate} isLoading={submitting}>Lưu</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Select label="Loại công nợ" value={type} onChange={e => setType(e.target.value as 'receivable' | 'payable')} options={[{ value: 'receivable', label: 'Phải thu' }, { value: 'payable', label: 'Phải trả' }]} />
          <Input label="Tên người / đơn vị" value={personName} onChange={e => setPersonName(e.target.value)} placeholder="Ví dụ: Công ty ABC" />
          <Input label="Số tiền gốc" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="5000000" />
          <Input label="Ngày đến hạn" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <Input label="Mô tả" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ghi chú ..." />
        </div>
      </Modal>

      <Modal
        isOpen={isPayOpen}
        onClose={() => setIsPayOpen(false)}
        title={selectedDebt ? `Thanh toán cho ${selectedDebt.person_name}` : 'Thanh toán'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsPayOpen(false)} disabled={submitting}>Hủy</Button>
            <Button onClick={handlePay} isLoading={submitting}>Xác nhận</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input label="Số tiền thanh toán (₫)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} placeholder="500000" />
          <Input label="Ngày thanh toán" type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
          <Input label="Ghi chú" value={payNote} onChange={e => setPayNote(e.target.value)} placeholder="Hạn mức thanh toán" />
        </div>
      </Modal>
    </div>
  );
};
