import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Controller, Get, Req, RequestMethod, VersioningType } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import type { FastifyRequest } from 'fastify';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import type { Env } from './config/env.config';

@Controller('probe-versioned')
class VersionedTestController {
  @Get()
  getClientIp(@Req() request: FastifyRequest) {
    return { ip: request.ip };
  }
}

function createMockConfigService(overrides: Partial<Env> = {}): {
  get: <K extends keyof Env>(key: K) => Env[K];
} {
  const values: Env = {
    NODE_ENV: 'development',
    HOST: '127.0.0.1',
    PORT: 4000,
    CLIENT_URL: 'http://localhost:3000',
    PANEL_URL: 'http://localhost:3001',
    CORS_ORIGINS: ['https://allowed.example'],
    TRUST_PROXY: false,
    BODY_LIMIT: 1024 * 1024,
    ...overrides,
  };

  return {
    get: <K extends keyof Env>(key: K): Env[K] => values[key],
  };
}

async function createE2eApp(
  overrides: Partial<Env> = {},
  extraControllers: Array<new () => unknown> = [],
): Promise<NestFastifyApplication> {
  const mockConfig = createMockConfigService(overrides);
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: extraControllers,
  })
    .overrideProvider(AppConfigService)
    .useValue(mockConfig)
    .compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({
      logger: false,
      trustProxy: mockConfig.get('TRUST_PROXY'),
      bodyLimit: mockConfig.get('BODY_LIMIT'),
    }),
  );

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

  return app;
}

describe('HTTP conventions (e2e)', () => {
  const apps: NestFastifyApplication[] = [];

  afterEach(async () => {
    while (apps.length > 0) {
      const app = apps.pop();
      if (app) {
        await app.close();
      }
    }
  });

  it('serves GET /health outside the global api prefix and versioning', async () => {
    // Arrange
    const app = await createE2eApp();
    apps.push(app);

    // Act
    const healthRes = await app.inject({ method: 'GET', url: '/health' });
    const prefixedHealthRes = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    // Assert
    assert.equal(healthRes.statusCode, 200);
    const body = healthRes.json<{ status: string; timestamp: string }>();
    assert.equal(body.status, 'ok');
    assert.ok(!Number.isNaN(Date.parse(body.timestamp)));
    assert.equal(prefixedHealthRes.statusCode, 404);
  });

  it('maps versioned routes under /api/v1 and returns 404 for unknown /api/v1 routes', async () => {
    // Arrange
    const app = await createE2eApp({}, [VersionedTestController]);
    apps.push(app);

    // Act
    const versionedRes = await app.inject({
      method: 'GET',
      url: '/api/v1/probe-versioned',
    });
    const unprefixedRes = await app.inject({
      method: 'GET',
      url: '/probe-versioned',
    });
    const unknownRes = await app.inject({
      method: 'GET',
      url: '/api/v1/does-not-exist',
    });

    // Assert
    assert.equal(versionedRes.statusCode, 200);
    assert.equal(unprefixedRes.statusCode, 404);
    assert.equal(unknownRes.statusCode, 404);
  });

  it('sets Access-Control-Allow-Origin for an allowed origin and omits it for another', async () => {
    // Arrange
    const app = await createE2eApp({
      CORS_ORIGINS: ['https://allowed.example'],
    });
    apps.push(app);

    // Act
    const allowedRes = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://allowed.example' },
    });
    const blockedRes = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://blocked.example' },
    });

    // Assert
    assert.equal(allowedRes.statusCode, 200);
    assert.equal(allowedRes.headers['access-control-allow-origin'], 'https://allowed.example');
    assert.equal(blockedRes.statusCode, 200);
    assert.equal(blockedRes.headers['access-control-allow-origin'], undefined);
  });

  it('configures Fastify bodyLimit from BODY_LIMIT and applies TRUST_PROXY to request.ip', async () => {
    // Arrange
    const untrustedApp = await createE2eApp({ TRUST_PROXY: false, BODY_LIMIT: 512 * 1024 }, [
      VersionedTestController,
    ]);
    const trustedApp = await createE2eApp({ TRUST_PROXY: true }, [VersionedTestController]);
    apps.push(untrustedApp, trustedApp);

    // Act
    const untrustedIpRes = await untrustedApp.inject({
      method: 'GET',
      url: '/api/v1/probe-versioned',
      headers: { 'x-forwarded-for': '203.0.113.42' },
    });
    const trustedIpRes = await trustedApp.inject({
      method: 'GET',
      url: '/api/v1/probe-versioned',
      headers: { 'x-forwarded-for': '203.0.113.42' },
    });
    const customConfig = untrustedApp.getHttpAdapter().getInstance().initialConfig as {
      bodyLimit?: number;
    };
    const defaultConfig = trustedApp.getHttpAdapter().getInstance().initialConfig as {
      bodyLimit?: number;
    };

    // Assert
    assert.equal(customConfig.bodyLimit, 512 * 1024);
    assert.equal(defaultConfig.bodyLimit, 1024 * 1024);
    assert.notEqual(untrustedIpRes.json<{ ip: string }>().ip, '203.0.113.42');
    assert.equal(trustedIpRes.json<{ ip: string }>().ip, '203.0.113.42');
  });
});
