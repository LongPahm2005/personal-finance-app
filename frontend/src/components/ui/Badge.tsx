import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'income' | 'expense' | 'transfer' | 'adjustment' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  let bg = 'var(--bg-hover)';
  let color = 'var(--text-secondary)';

  if (variant === 'income') {
    bg = 'var(--color-income-bg)';
    color = 'var(--color-income)';
  } else if (variant === 'expense') {
    bg = 'var(--color-expense-bg)';
    color = 'var(--color-expense)';
  } else if (variant === 'transfer') {
    bg = 'var(--color-info-bg)';
    color = 'var(--color-info)';
  } else if (variant === 'warning') {
    bg = 'var(--color-warning-bg)';
    color = '#B45309';
  } else if (variant === 'info') {
    bg = 'var(--color-primary-light)';
    color = 'var(--color-primary)';
  } else if (variant === 'adjustment') {
    bg = '#F3E8FF';
    color = '#7E22CE';
  }

  const padding = size === 'sm' ? '3px 8px' : '5px 12px';
  const fontSize = size === 'sm' ? '12px' : '13px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: bg,
        color,
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
};
