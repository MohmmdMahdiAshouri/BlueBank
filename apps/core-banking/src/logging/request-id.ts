import { randomUUID } from 'node:crypto';

const SAFE_REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,64}$/;

export function resolveRequestId(rawHeader: string | string[] | undefined): string {
  if (typeof rawHeader === 'string' && SAFE_REQUEST_ID_PATTERN.test(rawHeader)) {
    return rawHeader;
  }

  return randomUUID();
}
