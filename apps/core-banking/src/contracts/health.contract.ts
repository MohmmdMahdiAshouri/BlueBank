import { z } from 'zod';

export const HealthStatusSchema = z.enum(['ok', 'degraded', 'unhealthy']);
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

export const ServiceHealthSchema = z.object({
  status: HealthStatusSchema,
  latencyMs: z.number().nonnegative(),
  message: z.string().optional(),
});
export type ServiceHealth = z.infer<typeof ServiceHealthSchema>;

export const HealthCheckDataSchema = z.object({
  service: z.string(),
  status: HealthStatusSchema,
  uptime: z.number().nonnegative(),
  version: z.string(),
  timestamp: z.string(),
  services: z.record(z.string(), ServiceHealthSchema).optional(),
});
export type HealthCheckData = z.infer<typeof HealthCheckDataSchema>;
