import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import { Card, StatCard } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Transaction } from '../../types';

type TxTab = 'all' | 'income' | 'expense';

export const Transactions: React.FC = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TxTab>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.transactions.list({
        type: tab === 'all' ? undefined : tab,
        search: search || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        limit: 200,
      });

      if (res.success && res.data) {
        setTransactions(res.data.items);
      } else {
        toast.error('Không thể tải lịch sử giao dịch', res.error || 'Vui lòng thử lại');
      }
    } catch (error) {
      toast.error('Lỗi hệ thống', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [endDate, search, startDate, tab, toast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const totalIncome = transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <StatCard
          title="THU NHẬP"
          value={formatCurrency(totalIncome)}
          subtitle="Tổng khoản thu trong bộ lọc"
          icon={<ArrowDownLeft size={20} />}
          iconBg="var(--color-income-bg)"
          iconColor="var(--color-income)"
        />
        <StatCard
          title="CHI TIÊU"
          value={formatCurrency(totalExpense)}
          subtitle="Tổng khoản chi trong bộ lọc"
          icon={<ArrowUpRight size={20} />}
          iconBg="var(--color-expense-bg)"
          iconColor="var(--color-expense)"
        />
      </div>

      <Card style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(['all', 'income', 'expense'] as TxTab[]).map(item => (
              <Button
                key={item}
                variant={tab === item ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTab(item)}
              >
                {item === 'all' && 'Tất cả'}
                {item === 'income' && 'Thu nhập'}
                {item === 'expense' && 'Chi tiêu'}
              </Button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
            <div style={{ width: '220px' }}>
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo mô tả..." icon={<Search size={16} />} />
            </div>
            <div style={{ width: '150px' }}>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={{ width: '150px' }}>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <Loading minHeight="300px" />
        ) : transactions.length === 0 ? (
          <EmptyState title="Chưa có giao dịch" description="Không tìm thấy dữ liệu nào phù hợp với bộ lọc hiện tại." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ngày</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Loại</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Danh mục</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Số tiền</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const sign = tx.type === 'expense' ? '-' : '+';
                  const color = tx.type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)';
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{formatDateTime(tx.transaction_date)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '4px 8px',
                          borderRadius: '999px',
                          backgroundColor: tx.type === 'expense' ? 'var(--color-expense-bg)' : tx.type === 'income' ? 'var(--color-income-bg)' : 'var(--color-primary-light)',
                          color: tx.type === 'expense' ? 'var(--color-expense)' : tx.type === 'income' ? 'var(--color-income)' : 'var(--color-primary)',
                          fontWeight: 600,
                          fontSize: '12px',
                        }}>
                          {tx.type === 'income' ? 'Thu nhập' : tx.type === 'expense' ? 'Chi tiêu' : tx.type === 'transfer' ? 'Chuyển tiền' : 'Điều chỉnh'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{tx.category_name || 'Khác'}</td>
                      <td className="font-number" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color }}>
                        {sign}{formatCurrency(tx.amount)}
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{tx.note || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
