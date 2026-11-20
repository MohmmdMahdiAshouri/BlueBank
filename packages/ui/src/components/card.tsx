import * as React from 'react';
import { colors, radii, spacing } from '../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bordered?: boolean;
}

export function Card({ children, bordered = true, style, ...props }: CardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.brand.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    border: bordered ? `1px solid ${colors.brand.border}` : 'none',
    ...style,
  };

  return (
    <div style={cardStyle} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottom: `1px solid ${colors.brand.border}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{
        margin: 0,
        fontSize: '18px',
        fontWeight: 700,
        color: colors.brand.textPrimary,
        ...style,
      }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{ color: colors.brand.textSecondary, ...style }} {...props}>
      {children}
    </div>
  );
}
