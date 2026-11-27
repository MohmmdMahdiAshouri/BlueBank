import { resolve } from 'node:path';
import { z } from 'zod';

const booleanEnvSchema = z
  .union([z.boolean(), z.string()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) {
      return false;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = value.trim().toLowerCase();
    if (normalized === '' || normalized === 'false') {
      return false;
    }

    if (normalized === 'true') {
      return true;
    }

    ctx.addIssue({
      code: 'custom',
      message: 'Invalid boolean: expected "true" or "false"',
    });
    return z.NEVER;
  });

const corsOriginsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) {
      return [];
    }

    const rawItems = Array.isArray(value) ? value : value.split(',');
    const origins = rawItems.map((item) => item.trim()).filter((item) => item.length > 0);

    for (const origin of origins) {
      if (!z.url().safeParse(origin).success) {
        ctx.addIssue({
          code: 'custom',
          message: `Invalid CORS origin URL: "${origin}"`,
        });
        return z.NEVER;
      }
    }

    return origins;
  });

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    HOST: z.string().trim().min(1).default('0.0.0.0'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    CLIENT_URL: z.url().default('http://localhost:3000'),
    PANEL_URL: z.url().default('http://localhost:3001'),
    CORS_ORIGINS: corsOriginsSchema,
    TRUST_PROXY: booleanEnvSchema,
    BODY_LIMIT: z.coerce
      .number()
      .int()
      .min(1)
      .default(1024 * 1024),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production' && data.CORS_ORIGINS.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['CORS_ORIGINS'],
        message:
          'CORS_ORIGINS is required in production and must include at least one allowed origin',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

/**
 * Resolves `.env*` file paths in precedence order (highest priority first)
 * across the application root and current working directory.
 */
export function getEnvFilePaths(
  nodeEnv: string = process.env.NODE_ENV || 'development',
  cwd: string = process.cwd(),
  appRoot: string = resolve(__dirname, '../..'),
): string[] {
  const fileNames = [`.env.${nodeEnv}.local`, '.env.local', `.env.${nodeEnv}`, '.env'];

  const paths: string[] = [];
  const seen = new Set<string>();

  for (const fileName of fileNames) {
    for (const dir of [appRoot, cwd]) {
      const filePath = resolve(dir, fileName);
      if (!seen.has(filePath)) {
        seen.add(filePath);
        paths.push(filePath);
      }
    }
  }

  return paths;
}

function formatEnvIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((issue) => {
      const variable = issue.path.length > 0 ? issue.path.join('.') : 'ENV';
      return `  - ${variable}: ${issue.message}`;
    })
    .join('\n');
}

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`Invalid environment configuration:\n${formatEnvIssues(result.error.issues)}`);
  }

  return result.data;
}
