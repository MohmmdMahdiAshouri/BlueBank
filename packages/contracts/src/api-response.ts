import { z } from 'zod';

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    timestamp: z.string(),
    correlationId: z.string().optional(),
  });

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  correlationId?: string;
}

export function createSuccessResponse<T>(data: T, correlationId?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
  };
}

export function createErrorResponse(error: ApiError, correlationId?: string): ApiResponse<never> {
  return {
    success: false,
    error,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
  };
}
