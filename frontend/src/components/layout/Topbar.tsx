import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export interface TopbarProps {
  title: string;
  subtitle?: string;
  onQuickAdd?: () => void;
  actions?: React.ReactNode;
}

export const Topbar: React.FC<TopbarProps> = ({ title, subtitle, onQuickAdd, actions }) => {
  const today = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Capitalize first letter of weekday
  const capitalizedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div>
        <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-primary)',
            padding: '6px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-color)',
          }}
        >
          <Calendar size={14} color="var(--text-muted)" />
          <span>{capitalizedDate}</span>
        </div>

        {actions}

        {onQuickAdd && (
          <Button onClick={onQuickAdd} icon={<Plus size={16} />} size="sm">
            Thêm giao dịch
          </Button>
        )}
      </div>
    </header>
  );
};
