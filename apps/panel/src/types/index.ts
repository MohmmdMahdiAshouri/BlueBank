export interface BankAccount {
  id: string;
  accountNumber: string;
  ownerName: string;
  type: 'SAVINGS' | 'CHECKING' | 'INVESTMENT';
  balance: number;
  currency: 'IRR' | 'USD' | 'EUR';
  isActive: boolean;
  createdAt: string;
}

export interface HealthCheckData {
  service: string;
  status: 'ok' | 'degraded' | 'unhealthy';
  uptime: number;
  version: string;
  timestamp: string;
  services?: Record<string, { status: string; latencyMs: number; message?: string }>;
}
