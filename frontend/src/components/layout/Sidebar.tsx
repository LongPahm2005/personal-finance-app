import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  CircleDollarSign,
  Scale,
  PieChart,
  PiggyBank,
  BarChart3,
  Settings,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    groupName: 'TỔNG QUAN',
    items: [
      { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    ],
  },
  {
    groupName: 'GIAO DỊCH',
    items: [
      { to: '/income', label: 'Thu nhập', icon: <ArrowDownLeft size={18} /> },
      { to: '/expense', label: 'Chi tiêu', icon: <ArrowUpRight size={18} /> },
      { to: '/transactions', label: 'Lịch sử giao dịch', icon: <Receipt size={18} /> },
    ],
  },
  {
    groupName: 'TÀI CHÍNH',
    items: [
      { to: '/debts', label: 'Công nợ', icon: <Scale size={18} /> },
      { to: '/budgets', label: 'Ngân sách', icon: <PieChart size={18} /> },
      { to: '/savings', label: 'Tiết kiệm', icon: <PiggyBank size={18} /> },
    ],
  },
  {
    groupName: 'PHÂN TÍCH',
    items: [
      { to: '/reports', label: 'Báo cáo', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    groupName: 'HỆ THỐNG',
    items: [
      { to: '/settings', label: 'Cài đặt & Sao lưu', icon: <Settings size={18} /> },
    ],
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: '230px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Logo */}
      <div
        style={{
          height: '64px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
          }}
        >
          <CircleDollarSign size={19} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            Personal Finance
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
            Quản lý tài chính cá nhân
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {navGroups.map(group => (
          <div key={group.groupName}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.5px',
                padding: '0 10px',
                marginBottom: '6px',
              }}
            >
              {group.groupName}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Desktop v1.0.0</span>
        <span style={{ color: 'var(--color-income)', fontWeight: 600 }}>● MySQL Local</span>
      </div>
    </aside>
  );
};
