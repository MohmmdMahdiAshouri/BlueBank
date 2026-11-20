import * as React from 'react';
import { colors, radii, spacing } from '../tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ children, variant = 'info', style, ...props }: BadgeProps) {
  const variantStyles: Record<string, { bg: string; text: string }> = {
    success: { bg: '#ECFDF5', text: colors.status.success },
    warning: { bg: '#FFFBEB', text: colors.status.warning },
    error: { bg: '#FEF2F2', text: colors.status.error },
    info: { bg: '#EFF6FF', text: colors.status.info },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: `${spacing.xs} ${spacing.sm}`,
        borderRadius: radii.full,
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: currentVariant.bg,
        color: currentVariant.text,
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
