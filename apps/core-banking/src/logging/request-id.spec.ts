import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveRequestId } from './request-id';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('resolveRequestId', () => {
  it('accepts valid safe request IDs up to 64 characters', () => {
    // Arrange
    const maxLenId = 'a'.repeat(64);
    const traceId = 'req_trace-123.abc';

    // Act
    const resolvedMax = resolveRequestId(maxLenId);
    const resolvedTrace = resolveRequestId(traceId);

    // Assert
    assert.equal(resolvedMax, maxLenId);
    assert.equal(resolvedTrace, traceId);
  });

  it('generates a UUID when header is missing, empty, too long, an array, or unsafe', () => {
    // Arrange
    const inputs: Array<string | string[] | undefined> = [
      undefined,
      '',
      '   ',
      'a'.repeat(65),
      'bad id with spaces',
      'bad\nnewline',
      'bad/slash',
      '<script>alert(1)</script>',
      ['first-id', 'second-id'],
    ];

    // Act
    const results = inputs.map((input) => resolveRequestId(input));

    // Assert
    for (const [index, result] of results.entries()) {
      assert.match(result, UUID_REGEX);
      assert.notEqual(result, inputs[index]);
    }
  });
});
