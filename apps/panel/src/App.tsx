import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, colors, spacing } from '@repo/ui';
import type { BankAccount, HealthCheckData } from '@repo/contracts';
import { env } from './env';

export default function App() {
  const accounts: BankAccount[] = [
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      accountNumber: '6219861012345678',
      ownerName: 'سارا محمدی',
      type: 'SAVINGS',
      balance: 154000000,
      currency: 'IRR',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
      accountNumber: '6219861087654321',
      ownerName: 'علی رضایی',
      type: 'CHECKING',
      balance: 42000000,
      currency: 'IRR',
      isActive: true,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
  ];

  const healthData: HealthCheckData = {
    service: 'core-banking',
    status: 'ok',
    uptime: 7200,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'ok', latencyMs: 2 },
      paymentGateway: { status: 'ok', latencyMs: 15 },
    },
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: spacing.xl }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.xl,
          borderBottom: `1px solid ${colors.brand.border}`,
          paddingBottom: spacing.md,
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: colors.brand.primary, fontSize: '26px' }}>
            داشبورد مدیریت و نظارت BlueBank
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.brand.textSecondary, fontSize: '14px' }}>
            پنل ادمین مبتنی بر Vite + React (پورت {env.VITE_PORT})
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <Badge variant="success">Core Banking: متصل</Badge>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            بروزرسانی داده‌ها
          </Button>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: spacing.lg,
          marginBottom: spacing.xl,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>وضعیت میکروسرویس Core-Banking</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}
            >
              <span>آدرس اتصال:</span>
              <code>{env.VITE_API_URL}</code>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}
            >
              <span>وضعیت سلامت سرویس:</span>
              <Badge variant="success">{healthData.status.toUpperCase()}</Badge>
            </div>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', marginBottom: spacing.sm }}
            >
              <span>زمان فعال بودن (Uptime):</span>
              <span>{healthData.uptime} ثانیه</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مجموع سپرده‌های فعال</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 700,
                color: colors.brand.primary,
                marginBottom: spacing.xs,
              }}
            >
              {(196000000).toLocaleString('fa-IR')} <span style={{ fontSize: '14px' }}>ریال</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px' }}>تعداد کل حساب‌های تحت مدیریت: ۲ حساب</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست حساب‌های بانکی سیستم</CardTitle>
        </CardHeader>
        <CardContent>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${colors.brand.border}` }}>
                <th style={{ padding: spacing.sm }}>شماره حساب</th>
                <th style={{ padding: spacing.sm }}>نام صاحب حساب</th>
                <th style={{ padding: spacing.sm }}>نوع حساب</th>
                <th style={{ padding: spacing.sm }}>موجودی</th>
                <th style={{ padding: spacing.sm }}>وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc) => (
                <tr key={acc.id} style={{ borderBottom: `1px solid ${colors.brand.border}` }}>
                  <td style={{ padding: spacing.sm }}>
                    <code>{acc.accountNumber}</code>
                  </td>
                  <td style={{ padding: spacing.sm }}>{acc.ownerName}</td>
                  <td style={{ padding: spacing.sm }}>{acc.type}</td>
                  <td style={{ padding: spacing.sm }}>
                    {acc.balance.toLocaleString('fa-IR')} {acc.currency}
                  </td>
                  <td style={{ padding: spacing.sm }}>
                    <Badge variant={acc.isActive ? 'success' : 'error'}>
                      {acc.isActive ? 'فعال' : 'مسدود'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
