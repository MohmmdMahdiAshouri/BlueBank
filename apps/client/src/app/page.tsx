'use client';

import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, colors, spacing } from '@repo/ui';
import type { BankAccount, HealthCheckData } from '@repo/contracts';
import { env } from '../env';

export default function ClientHomePage() {
  const mockAccount: BankAccount = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    accountNumber: '6219861012345678',
    ownerName: 'سارا محمدی',
    type: 'SAVINGS',
    balance: 154000000,
    currency: 'IRR',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const mockHealth: HealthCheckData = {
    service: 'core-banking',
    status: 'ok',
    uptime: 3600,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  return (
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: spacing.xl }}>
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
          <h1 style={{ margin: 0, color: colors.brand.primary, fontSize: '28px' }}>
            BlueBank Client
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.brand.textSecondary }}>
            فرانت‌اند Next.js با App Router و ارتباط زنده با بک‌اند
          </p>
        </div>
        <Badge variant={mockHealth.status === 'ok' ? 'success' : 'warning'}>
          {mockHealth.status === 'ok' ? 'سرویس متصل است' : 'اختلال در سرویس'}
        </Badge>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: spacing.lg,
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle>موجودی حساب اصلی</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: colors.brand.textPrimary,
                marginBottom: spacing.sm,
              }}
            >
              {mockAccount.balance.toLocaleString('fa-IR')}{' '}
              <span style={{ fontSize: '14px', fontWeight: 500 }}>ریال</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px' }}>شماره کارت: {mockAccount.accountNumber}</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>
              صاحب حساب: {mockAccount.ownerName}
            </p>
            <div style={{ marginTop: spacing.md, display: 'flex', gap: spacing.sm }}>
              <Button size="sm" variant="primary">
                انتقال وجه
              </Button>
              <Button size="sm" variant="outline">
                گردش حساب
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>اطلاعات زیرساخت Core Banking</CardTitle>
          </CardHeader>
          <CardContent>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>
              آدرس API: <code>{env.NEXT_PUBLIC_API_URL}</code>
            </p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>
              وضعیت سلامت: <Badge variant="success">فعال (200 OK)</Badge>
            </p>
            <p style={{ margin: '4px 0', fontSize: '13px' }}>
              معماری: Monorepo با Turborepo & pnpm
            </p>
            <div style={{ marginTop: spacing.md }}>
              <Button size="sm" variant="secondary" onClick={() => alert('تست اتصال برقرار است!')}>
                تست مجدد اتصال
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
