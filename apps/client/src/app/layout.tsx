import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'BlueBank - نئوبانک هوشمند',
  description: 'سیستم بانکداری مدرن و یکپارچه BlueBank',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
          backgroundColor: '#F4F7FB',
          color: '#0F172A',
        }}
      >
        {children}
      </body>
    </html>
  );
}
