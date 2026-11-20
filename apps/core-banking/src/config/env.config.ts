import { z } from 'zod';

const CoreBankingEnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().url().default('http://localhost:3000'),
  PANEL_URL: z.string().url().default('http://localhost:3001'),
});

export type CoreBankingEnv = z.infer<typeof CoreBankingEnvSchema>;

export function validateEnv(): CoreBankingEnv {
  const result = CoreBankingEnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ خطای اعتبارسنجی متغیرهای محیطی core-banking:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error(' پیکربندی نامعتبر محیطی - متوقف کردن سرویس');
  }
  return result.data;
}

export const env = validateEnv();
