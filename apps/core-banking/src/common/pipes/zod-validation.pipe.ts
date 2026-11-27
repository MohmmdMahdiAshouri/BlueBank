import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

export class ZodValidationPipe<T = unknown> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown, _metadata: ArgumentMetadata): T {
    void _metadata;
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  }
}
