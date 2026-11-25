import { resolve } from 'node:path';
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  CLIENT_URL: z.url().default('http://localhost:3000'),
  PANEL_URL: z.url().default('http://localhost:3001'),
});

export type Env = z.infer<typeof envSchema>;

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
