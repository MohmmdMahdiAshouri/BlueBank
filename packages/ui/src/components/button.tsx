import * as React from 'react';
import { colors, radii, spacing } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, variant = 'primary', size = 'md', isLoading = false, style, disabled, ...props },
    ref,
  ) => {
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      border: 'none',
      transition: 'all 0.2s ease-in-out',
      borderRadius: radii.md,
      fontFamily: 'inherit',
      textDecoration: 'none',
      ...style,
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: `${spacing.xs} ${spacing.sm}`, fontSize: '13px' },
      md: { padding: `${spacing.sm} ${spacing.md}`, fontSize: '15px' },
      lg: { padding: `${spacing.md} ${spacing.lg}`, fontSize: '17px' },
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: colors.brand.primary,
        color: '#FFFFFF',
      },
      secondary: {
        backgroundColor: colors.brand.background,
        color: colors.brand.textPrimary,
      },
      outline: {
        backgroundColor: 'transparent',
        border: `1px solid ${colors.brand.border}`,
        color: colors.brand.textPrimary,
      },
      danger: {
        backgroundColor: colors.status.error,
        color: '#FFFFFF',
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          ...baseStyle,
          ...sizeStyles[size],
          ...variantStyles[variant],
        }}
        {...props}
      >
        {isLoading ? 'در حال بارگذاری...' : children}
      </button>
    );
  },
);

Button.displayName = 'Button';
