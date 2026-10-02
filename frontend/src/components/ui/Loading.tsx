import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC<{ message?: string; minHeight?: string }> = ({
  message = 'Đang tải dữ liệu...',
  minHeight = '200px',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        minHeight,
        color: 'var(--text-muted)',
      }}
    >
      <Loader2 size={32} color="var(--color-primary)" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)' }}>{message}</span>
    </div>
  );
};
