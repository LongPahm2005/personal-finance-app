import React from 'react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder,
  style,
  id,
  ...props
}) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}

      <select
        id={selectId}
        {...props}
        style={{
          width: '100%',
          height: '40px',
          padding: '8px 12px',
          fontSize: '14px',
          color: 'var(--text-primary)',
          backgroundColor: '#FFFFFF',
          border: `1px solid ${error ? 'var(--color-expense)' : 'var(--border-color)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease',
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
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-expense)', fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
};
