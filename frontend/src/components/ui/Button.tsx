import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  let bg = 'var(--color-primary)';
  let color = '#FFFFFF';
  let border = '1px solid transparent';
  let hoverBg = 'var(--color-primary-dark)';

  if (variant === 'secondary') {
    bg = 'var(--bg-hover)';
    color = 'var(--text-primary)';
    border = '1px solid var(--border-color)';
    hoverBg = 'var(--bg-active)';
  } else if (variant === 'danger') {
    bg = 'var(--color-expense)';
    color = '#FFFFFF';
    hoverBg = '#B91C1C';
  } else if (variant === 'outline') {
    bg = 'transparent';
    color = 'var(--color-primary)';
    border = '1px solid var(--color-primary)';
    hoverBg = 'var(--color-primary-light)';
  } else if (variant === 'ghost') {
    bg = 'transparent';
    color = 'var(--text-secondary)';
    hoverBg = 'var(--bg-hover)';
  }

  let padding = '8px 16px';
  let fontSize = '14px';
  let height = '38px';

  if (size === 'sm') {
    padding = '6px 12px';
    fontSize = '13px';
    height = '32px';
  } else if (size === 'lg') {
    padding = '10px 20px';
    fontSize = '15px';
    height = '44px';
  }

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        height,
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: 'var(--radius-md)',
        border,
        backgroundColor: isHovered && !disabled && !isLoading ? hoverBg : bg,
        color,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        outline: 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {isLoading ? (
        <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
