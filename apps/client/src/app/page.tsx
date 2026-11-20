'use client';

import React from 'react';
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
    <main style={{ maxWidth: '960px', margin: '0 auto', padding: '32px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: '#0052FF', fontSize: '28px' }}>BlueBank Client</h1>
          <p style={{ margin: '4px 0 0', color: '#64748B' }}>
            فرانت‌اند مدرن Next.js 16 (App Router) و ارتباط یکپارچه با میکروسرویس Core Banking
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: mockHealth.status === 'ok' ? '#ECFDF5' : '#FFFBEB',
            color: mockHealth.status === 'ok' ? '#10B981' : '#F59E0B',
          }}
        >
          {mockHealth.status === 'ok' ? 'سرویس متصل است' : 'اختلال در سرویس'}
        </span>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>
            موجودی حساب اصلی
          </h3>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
            {mockAccount.balance.toLocaleString('fa-IR')}{' '}
            <span style={{ fontSize: '14px', fontWeight: 500 }}>ریال</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            شماره کارت: {mockAccount.accountNumber}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748B' }}>
            صاحب حساب: {mockAccount.ownerName}
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button
              style={{
                backgroundColor: '#0052FF',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              انتقال وجه
            </button>
            <button
              style={{
                backgroundColor: 'transparent',
                color: '#0F172A',
                border: '1px solid #E2E8F0',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              گردش حساب
            </button>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E2E8F0',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>
            اطلاعات زیرساخت Core Banking
          </h3>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748B' }}>
            آدرس API: <code>{env.NEXT_PUBLIC_API_URL}</code>
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748B' }}>
            فناوری فرانت‌اند: <strong>Next.js 16 (App Router)</strong>
          </p>
          <p style={{ margin: '4px 0', fontSize: '13px', color: '#64748B' }}>
            معماری: Monorepo با Turborepo & pnpm
          </p>
          <div style={{ marginTop: '16px' }}>
            <button
              onClick={() => alert('تست اتصال به Core-Banking برقرار است!')}
              style={{
                backgroundColor: '#F4F7FB',
                color: '#0F172A',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              تست مجدد اتصال
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
