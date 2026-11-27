import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ArgumentMetadata } from '@nestjs/common';
import { ZodError, z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const metadata: ArgumentMetadata = { type: 'body' };

  it('returns the parsed and transformed value when input is valid', () => {
    // Arrange
    const schema = z.object({
      name: z.string().trim().min(1),
      amount: z.coerce.number().int().positive(),
      currency: z.string().default('IRR'),
    });
    const pipe = new ZodValidationPipe(schema);
    const input = { name: '  Alice  ', amount: '2500', extra: 'ignored' };

    // Act
    const result = pipe.transform(input, metadata);

    // Assert
    assert.deepEqual(result, {
      name: 'Alice',
      amount: 2500,
      currency: 'IRR',
    });
  });

  it('throws ZodError when validation fails', () => {
    // Arrange
    const schema = z.object({
      email: z.email(),
      amount: z.number().positive(),
    });
    const pipe = new ZodValidationPipe(schema);
    let caughtError: unknown;

    // Act
    try {
      pipe.transform({ email: 'not-an-email', amount: -5 }, metadata);
    } catch (error) {
      caughtError = error;
    }

    // Assert
    assert.ok(caughtError instanceof ZodError);
    assert.equal(caughtError.issues.length, 2);
  });
});
