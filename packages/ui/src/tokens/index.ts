export const colors = {
  brand: {
    primary: '#0052FF',
    primaryHover: '#0041CC',
    secondary: '#00D1FF',
    background: '#F4F7FB',
    surface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
} as const;

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '16px',
  full: '9999px',
} as const;
