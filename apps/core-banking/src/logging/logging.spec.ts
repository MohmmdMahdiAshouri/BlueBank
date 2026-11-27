import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { IncomingMessage } from 'node:http';
import { Writable } from 'node:stream';
import {
  Controller,
  Get,
  Logger as NestLogger,
  RequestMethod,
  VersioningType,
} from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Logger, LoggerModule } from 'nestjs-pino';
import type { Env } from '../config/env.config';
import { createPinoHttpOptions } from './pino.config';
import { resolveRequestId } from './request-id';

@Controller('probe-logging')
class LoggingProbeController {
  private readonly logger = new NestLogger(LoggingProbeController.name);

  @Get()
  handle() {
    this.logger.log('handling probe logging request');
    return { ok: true };
  }
}

function createMemoryLogStream() {
  const chunks: string[] = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString('utf8'));
      callback();
    },
  });

  return {
    stream,
    getRecords: (): Array<Record<string, unknown>> =>
      chunks
        .join('')
        .trim()
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line) as Record<string, unknown>),
  };
}

describe('Pino logging configuration', () => {
  const apps: NestFastifyApplication[] = [];

  afterEach(async () => {
    while (apps.length > 0) {
      const app = apps.pop();
      if (app) {
        await app.close();
      }
    }
  });

  it('enables pino-pretty transport only in development and JSON output otherwise', () => {
    // Arrange
    const devConfig: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'> = {
      NODE_ENV: 'development',
      LOG_LEVEL: 'debug',
    };
    const prodConfig: Pick<Env, 'NODE_ENV' | 'LOG_LEVEL'> = {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    };

    // Act
    const devOptions = createPinoHttpOptions(devConfig);
    const prodOptions = createPinoHttpOptions(prodConfig);

    // Assert
    assert.equal(devOptions.level, 'debug');
    assert.deepEqual(devOptions.transport, {
      target: 'pino-pretty',
      options: {
        singleLine: true,
        translateTime: 'SYS:standard',
      },
    });
    assert.equal(prodOptions.level, 'info');
    assert.equal(prodOptions.transport, undefined);
  });

  it('shares one Pino logger across Nest Logger and request logs and redacts authorization and cookie headers', async () => {
    // Arrange
    const { stream, getRecords } = createMemoryLogStream();
    const mockConfig = {
      get: <K extends keyof Env>(key: K): Env[K] => {
        const values: Env = {
          NODE_ENV: 'production',
          HOST: '127.0.0.1',
          PORT: 4000,
          CLIENT_URL: 'http://localhost:3000',
          PANEL_URL: 'http://localhost:3001',
          CORS_ORIGINS: ['http://localhost:3000'],
          TRUST_PROXY: false,
          BODY_LIMIT: 1024 * 1024,
          LOG_LEVEL: 'info',
        };
        return values[key];
      },
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        LoggerModule.forRoot({
          pinoHttp: createPinoHttpOptions({ NODE_ENV: 'production', LOG_LEVEL: 'info' }, stream),
        }),
      ],
      controllers: [LoggingProbeController],
    }).compile();

    const fastifyAdapter = new FastifyAdapter({
      logger: false,
      requestIdHeader: false,
      genReqId: (req: IncomingMessage) => resolveRequestId(req.headers['x-request-id']),
      trustProxy: mockConfig.get('TRUST_PROXY'),
      bodyLimit: mockConfig.get('BODY_LIMIT'),
    });
    const fastify = fastifyAdapter.getInstance();
    fastify.addHook('onRequest', (request, reply, done) => {
      reply.header('x-request-id', request.id);
      done();
    });
    fastify.addHook('onSend', (request, reply, _payload, done) => {
      if (!reply.hasHeader('x-request-id')) {
        reply.header('x-request-id', request.id);
      }
      done();
    });

    const app = moduleRef.createNestApplication<NestFastifyApplication>(fastifyAdapter, {
      bufferLogs: true,
    });
    apps.push(app);
    app.useLogger(app.get(Logger));
    app.setGlobalPrefix('api', {
      exclude: [{ path: 'health', method: RequestMethod.GET }],
    });
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });
    app.enableCors({
      origin: mockConfig.get('CORS_ORIGINS'),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    });
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    // Act
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/probe-logging',
      headers: {
        'x-request-id': 'shared-logger-req-42',
        authorization: 'Bearer secret-jwt-token',
        cookie: 'session=secret-cookie-value',
        'x-safe-header': 'visible-value',
      },
    });
    const records = getRecords();

    // Assert
    assert.equal(response.statusCode, 200);
    assert.equal(response.headers['x-request-id'], 'shared-logger-req-42');

    const controllerLog = records.find(
      (record) =>
        record.context === 'LoggingProbeController' &&
        record.msg === 'handling probe logging request',
    );
    const requestLog = records.find((record) => record.msg === 'request completed');

    assert.ok(controllerLog, 'Expected Nest Logger log record');
    assert.ok(requestLog, 'Expected HTTP request completed log record');
    assert.equal((controllerLog.req as { id?: string }).id, 'shared-logger-req-42');
    assert.equal((requestLog.req as { id?: string }).id, 'shared-logger-req-42');

    const serializedReq = requestLog.req as { headers?: Record<string, unknown> };
    assert.equal(serializedReq.headers?.authorization, '[REDACTED]');
    assert.equal(serializedReq.headers?.cookie, '[REDACTED]');
    assert.equal(serializedReq.headers?.['x-safe-header'], 'visible-value');

    const fullLogText = JSON.stringify(records);
    assert.equal(fullLogText.includes('secret-jwt-token'), false);
    assert.equal(fullLogText.includes('secret-cookie-value'), false);
  });
});
