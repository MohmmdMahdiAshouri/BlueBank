import { z } from 'zod';

const PanelEnvSchema = z.object({
  VITE_PORT: z.coerce.number().default(3001),
  VITE_API_URL: z.string().url().default('http://localhost:4000'),
});

export type PanelEnv = z.infer<typeof PanelEnvSchema>;

export function validatePanelEnv(): PanelEnv {
  const result = PanelEnvSchema.safeParse({
    VITE_PORT: import.meta.env.VITE_PORT,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });

  if (!result.success) {
    console.error('❌ خطای اعتبارسنجی متغیرهای محیطی Panel:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    throw new Error('پیکربندی نامعتبر پنل ادمین - متوقف کردن سرویس');
  }

  return result.data;
}

export const env = validatePanelEnv();
