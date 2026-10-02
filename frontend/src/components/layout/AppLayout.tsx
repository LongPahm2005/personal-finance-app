import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { QuickTransactionModal } from '../common/QuickTransactionModal';

// Route metadata for topbar titles
const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Tổng quan tình hình tài chính cá nhân' },
  '/income': { title: 'Quản lý Thu nhập', subtitle: 'Theo dõi các nguồn thu và dòng tiền vào' },
  '/expense': { title: 'Quản lý Chi tiêu', subtitle: 'Kiểm soát và phân loại các khoản chi tiêu' },
  '/transactions': { title: 'Lịch sử Giao dịch', subtitle: 'Toàn bộ biến động tài chính, thu và chi' },
  '/debts': { title: 'Quản lý Công nợ', subtitle: 'Theo dõi nợ phải thu và nợ phải trả' },
  '/budgets': { title: 'Ngân sách Chi tiêu', subtitle: 'Thiết lập và giám sát hạn mức chi tiêu' },
  '/savings': { title: 'Mục tiêu Tiết kiệm', subtitle: 'Đặt mục tiêu và tích lũy tài sản cho tương lai' },
  '/reports': { title: 'Báo cáo Phân tích', subtitle: 'Biểu đồ trực quan và thống kê chi tiết' },
  '/settings': { title: 'Cài đặt & Dữ liệu', subtitle: 'Quản lý danh mục, giao dịch định kỳ và sao lưu' },
};

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentMeta = pageMeta[location.pathname] || {
    title: 'Personal Finance',
    subtitle: 'Quản lý tài chính cá nhân',
  };

  const handleTransactionAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onQuickAdd={() => setIsQuickAddOpen(true)}
        />

        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          <Outlet context={{ refreshKey, triggerRefresh: handleTransactionAdded }} />
        </main>
      </div>

      {/* Quick Add Modal */}
      <QuickTransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={handleTransactionAdded}
      />
    </div>
  );
};
