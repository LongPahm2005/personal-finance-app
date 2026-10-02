import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  style,
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          {...props}
          style={{
            width: '100%',
            height: '40px',
            padding: icon ? '8px 12px 8px 38px' : '8px 12px',
            fontSize: '14px',
            color: 'var(--text-primary)',
            backgroundColor: '#FFFFFF',
            border: `1px solid ${error ? 'var(--color-expense)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? 'var(--color-expense)' : 'var(--color-primary)';
            e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'var(--color-expense)' : 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
        />
      </div>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-expense)', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
