import type { DestinationStream } from 'pino';
import type { Options } from 'pino-http';
import type { Env } from '../config/env.config';
import { resolveRequestId } from './request-id';

const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
];

export function createPinoHttpOptions(
  config: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'>,
  stream?: DestinationStream,
): Options {
  const isDevelopment = config.NODE_ENV === 'development';

  return {
    level: config.LOG_LEVEL,
    redact: {
      paths: REDACTED_PATHS,
      censor: '[REDACTED]',
    },
    genReqId: (req) => {
      if (typeof req.id === 'string' && req.id.length > 0) {
        return req.id;
      }

      return resolveRequestId(req.headers['x-request-id']);
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) {
        return 'error';
      }
      if (res.statusCode >= 400) {
        return 'warn';
      }
      return 'info';
    },
    ...(stream ? { stream } : {}),
    ...(!stream && isDevelopment && config.LOG_LEVEL !== 'silent'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              translateTime: 'SYS:standard',
            },
          },
        }
      : {}),
  };
}
