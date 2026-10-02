import React from 'react';

export interface ProgressProps {
  value: number; // 0 - 100+
  max?: number;
  height?: number;
  color?: string;
  showLabel?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  height = 8,
  color,
  showLabel = false,
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  
  let barColor = color;
  if (!barColor) {
    if (value > max) barColor = 'var(--color-expense)';
    else if (percent >= 85) barColor = 'var(--color-warning)';
    else barColor = 'var(--color-primary)';
  }

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '4px',
            color: 'var(--text-secondary)',
          }}
        >
          <span>Tiến độ</span>
          <span>{percent}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: '#E2E8F0',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: '100%',
            backgroundColor: barColor,
            borderRadius: '9999px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
};
