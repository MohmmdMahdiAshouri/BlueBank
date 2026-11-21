import React from 'react';
import type { BankAccount, HealthCheckData } from './types';
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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
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
          <h1 style={{ margin: 0, color: '#0052FF', fontSize: '26px' }}>
            داشبورد مدیریت و نظارت BlueBank
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
            پنل ادمین مبتنی بر Vite 8 + React 19 (پورت {env.VITE_PORT})
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#ECFDF5',
              color: '#10B981',
            }}
          >
            Core Banking: متصل
          </span>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: 'transparent',
              color: '#0F172A',
              border: '1px solid #E2E8F0',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            بروزرسانی داده‌ها
          </button>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>
            وضعیت میکروسرویس Core-Banking
          </h3>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: '#64748B',
            }}
          >
            <span>آدرس اتصال:</span>
            <code>{env.VITE_API_URL}</code>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: '#64748B',
            }}
          >
            <span>وضعیت سلامت سرویس:</span>
            <span style={{ color: '#10B981', fontWeight: 600 }}>
              {healthData.status.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
            <span>زمان فعال بودن (Uptime):</span>
            <span>{healthData.uptime} ثانیه</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>
            مجموع سپرده‌های فعال
          </h3>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0052FF', marginBottom: '4px' }}>
            {(196000000).toLocaleString('fa-IR')} <span style={{ fontSize: '14px' }}>ریال</span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            تعداد کل حساب‌های تحت مدیریت: ۲ حساب
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: '18px', color: '#0F172A' }}>
          لیست حساب‌های بانکی سیستم
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '8px' }}>شماره حساب</th>
              <th style={{ padding: '8px' }}>نام صاحب حساب</th>
              <th style={{ padding: '8px' }}>نوع حساب</th>
              <th style={{ padding: '8px' }}>موجودی</th>
              <th style={{ padding: '8px' }}>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc) => (
              <tr key={acc.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td style={{ padding: '8px' }}>
                  <code>{acc.accountNumber}</code>
                </td>
                <td style={{ padding: '8px' }}>{acc.ownerName}</td>
                <td style={{ padding: '8px' }}>{acc.type}</td>
                <td style={{ padding: '8px' }}>
                  {acc.balance.toLocaleString('fa-IR')} {acc.currency}
                </td>
                <td style={{ padding: '8px' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: acc.isActive ? '#ECFDF5' : '#FEF2F2',
                      color: acc.isActive ? '#10B981' : '#EF4444',
                    }}
                  >
                    {acc.isActive ? 'فعال' : 'مسدود'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
