import { z } from 'zod';

const ClientEnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:4000'),
});

export type ClientEnv = z.infer<typeof ClientEnvSchema>;

export function validateClientEnv(): ClientEnv {
  const result = ClientEnvSchema.safeParse({
    PORT: process.env.PORT,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!result.success) {
    console.error('❌ خطای اعتبارسنجی متغیرهای محیطی Client:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('پیکربندی نامعتبر کلاینت - متوقف کردن سرویس');
  }

  return result.data;
}

export const env = validateClientEnv();
