import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Injectable, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AppConfigModule } from './app-config.module';
import { AppConfigService } from './app-config.service';
import { Env, getEnvFilePaths, validateEnv } from './env.config';

@Injectable()
class ConsumerService {
  constructor(
    readonly appConfig: AppConfigService,
    readonly configService: ConfigService<Env, true>,
  ) {}
}

@Module({
  providers: [ConsumerService],
})
class ConsumerModule {}

describe('env configuration', () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        rmSync(dir, { recursive: true, force: true });
      }
    }
  });

  it('parses valid env with defaults', () => {
    // Arrange
    const rawEnv: Record<string, unknown> = {};

    // Act
    const parsed = validateEnv(rawEnv);

    // Assert
    assert.deepEqual(parsed, {
      NODE_ENV: 'development',
      HOST: '0.0.0.0',
      PORT: 4000,
      CLIENT_URL: 'http://localhost:3000',
      PANEL_URL: 'http://localhost:3001',
      CORS_ORIGINS: [],
      TRUST_PROXY: false,
      BODY_LIMIT: 1024 * 1024,
      LOG_LEVEL: 'debug',
    });
    assert.equal(typeof parsed.PORT, 'number');
    assert.equal(typeof parsed.TRUST_PROXY, 'boolean');
    assert.equal(typeof parsed.BODY_LIMIT, 'number');
  });

  it('coerces PORT, BODY_LIMIT, parses CORS_ORIGINS list, and parses TRUST_PROXY when valid values are provided', () => {
    // Arrange
    const rawEnv = {
      NODE_ENV: 'production',
      HOST: ' 127.0.0.1 ',
      PORT: '8080',
      CLIENT_URL: 'https://app.bluebank.local',
      PANEL_URL: 'https://panel.bluebank.local',
      CORS_ORIGINS: 'https://app.bluebank.local, https://panel.bluebank.local',
      TRUST_PROXY: 'true',
      BODY_LIMIT: '2097152',
    };

    // Act
    const parsed = validateEnv(rawEnv);

    // Assert
    assert.deepEqual(parsed, {
      NODE_ENV: 'production',
      HOST: '127.0.0.1',
      PORT: 8080,
      CLIENT_URL: 'https://app.bluebank.local',
      PANEL_URL: 'https://panel.bluebank.local',
      CORS_ORIGINS: ['https://app.bluebank.local', 'https://panel.bluebank.local'],
      TRUST_PROXY: true,
      BODY_LIMIT: 2097152,
      LOG_LEVEL: 'info',
    });
  });

  it('uses explicit LOG_LEVEL when provided and rejects invalid LOG_LEVEL values', () => {
    // Arrange
    const validDevOverride = { NODE_ENV: 'development', LOG_LEVEL: 'warn' };
    const validProdOverride = {
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://app.bluebank.local',
      LOG_LEVEL: 'debug',
    };
    const invalidLogLevel = { LOG_LEVEL: 'verbose' };
    let caughtError: unknown;

    // Act
    const devParsed = validateEnv(validDevOverride);
    const prodParsed = validateEnv(validProdOverride);
    try {
      validateEnv(invalidLogLevel);
    } catch (error) {
      caughtError = error;
    }

    // Assert
    assert.equal(devParsed.LOG_LEVEL, 'warn');
    assert.equal(prodParsed.LOG_LEVEL, 'debug');
    assert.ok(caughtError instanceof Error);
    assert.match(caughtError.message, /- LOG_LEVEL:/);
  });

  it('parses string "false" for TRUST_PROXY as boolean false', () => {
    // Arrange
    const rawEnv = { TRUST_PROXY: 'false' };

    // Act
    const parsed = validateEnv(rawEnv);

    // Assert
    assert.equal(parsed.TRUST_PROXY, false);
  });

  it('fails when CORS_ORIGINS is empty in production or contains invalid URLs', () => {
    // Arrange
    const emptyProdEnv = { NODE_ENV: 'production', CORS_ORIGINS: '' };
    const invalidOriginEnv = {
      NODE_ENV: 'development',
      CORS_ORIGINS: 'http://localhost:3000, not-a-url',
    };
    let emptyProdError: unknown;
    let invalidOriginError: unknown;

    // Act
    try {
      validateEnv(emptyProdEnv);
    } catch (error) {
      emptyProdError = error;
    }

    try {
      validateEnv(invalidOriginEnv);
    } catch (error) {
      invalidOriginError = error;
    }

    // Assert
    assert.ok(emptyProdError instanceof Error);
    assert.match(emptyProdError.message, /- CORS_ORIGINS:/);
    assert.ok(invalidOriginError instanceof Error);
    assert.match(invalidOriginError.message, /- CORS_ORIGINS:/);
  });

  it('fails with a clear message when TRUST_PROXY or BODY_LIMIT is invalid', () => {
    // Arrange
    const rawEnv = { TRUST_PROXY: 'yes', BODY_LIMIT: '0' };
    let caughtError: unknown;

    // Act
    try {
      validateEnv(rawEnv);
    } catch (error) {
      caughtError = error;
    }

    // Assert
    assert.ok(caughtError instanceof Error);
    assert.match(caughtError.message, /- TRUST_PROXY:/);
    assert.match(caughtError.message, /- BODY_LIMIT:/);
  });

  it('fails with a clear message when PORT is invalid', () => {
    // Arrange
    const rawEnv = { PORT: 'not-a-port' };
    let caughtError: unknown;

    // Act
    try {
      validateEnv(rawEnv);
    } catch (error) {
      caughtError = error;
    }

    // Assert
    assert.ok(caughtError instanceof Error);
    assert.match(caughtError.message, /Invalid environment configuration:/);
    assert.match(caughtError.message, /- PORT:/);
    assert.match(caughtError.message, /expected number/);
  });

  it('fails when PORT is empty or out of valid TCP port range', () => {
    // Arrange
    const emptyPortEnv = { PORT: '' };
    const outOfRangePortEnv = { PORT: '70000' };
    let emptyPortError: unknown;
    let outOfRangeError: unknown;

    // Act
    try {
      validateEnv(emptyPortEnv);
    } catch (error) {
      emptyPortError = error;
    }

    try {
      validateEnv(outOfRangePortEnv);
    } catch (error) {
      outOfRangeError = error;
    }

    // Assert
    assert.ok(emptyPortError instanceof Error);
    assert.match(emptyPortError.message, /- PORT:/);
    assert.ok(outOfRangeError instanceof Error);
    assert.match(outOfRangeError.message, /- PORT:/);
  });

  it('lists every invalid variable in a readable list when multiple variables fail', () => {
    // Arrange
    const rawEnv = {
      NODE_ENV: 'staging',
      HOST: '   ',
      PORT: 'abc',
      CLIENT_URL: 'invalid-url',
      TRUST_PROXY: 'invalid-bool',
    };
    let caughtError: unknown;

    // Act
    try {
      validateEnv(rawEnv);
    } catch (error) {
      caughtError = error;
    }

    // Assert
    assert.ok(caughtError instanceof Error);
    assert.match(caughtError.message, /- NODE_ENV:/);
    assert.match(caughtError.message, /- HOST:/);
    assert.match(caughtError.message, /- PORT:/);
    assert.match(caughtError.message, /- CLIENT_URL:/);
    assert.match(caughtError.message, /- TRUST_PROXY:/);
  });

  it('resolves environment file paths in priority order and deduplicates identical directories', () => {
    // Arrange
    const dir = '/workspace/apps/core-banking';

    // Act
    const devPaths = getEnvFilePaths('development', dir, dir);
    const prodPaths = getEnvFilePaths('production', '/workspace', '/workspace/apps/core-banking');

    // Assert
    assert.deepEqual(devPaths, [
      join(dir, '.env.development.local'),
      join(dir, '.env.local'),
      join(dir, '.env.development'),
      join(dir, '.env'),
    ]);
    assert.deepEqual(prodPaths, [
      '/workspace/apps/core-banking/.env.production.local',
      '/workspace/.env.production.local',
      '/workspace/apps/core-banking/.env.local',
      '/workspace/.env.local',
      '/workspace/apps/core-banking/.env.production',
      '/workspace/.env.production',
      '/workspace/apps/core-banking/.env',
      '/workspace/.env',
    ]);
  });

  it('loads environment-specific files such as .env.development over .env', async () => {
    // Arrange
    const dir = mkdtempSync(join(tmpdir(), 'core-banking-multi-env-'));
    tempDirs.push(dir);
    writeFileSync(join(dir, '.env'), 'PORT=4000\nHOST=0.0.0.0\n', 'utf8');
    writeFileSync(join(dir, '.env.development'), 'PORT=6000\n', 'utf8');

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          override: true,
          envFilePath: getEnvFilePaths('development', dir, dir),
          validate: validateEnv,
        }),
      ],
      providers: [AppConfigService],
    }).compile();
    const appConfig = moduleRef.get(AppConfigService);

    // Act
    const port: number = appConfig.get('PORT');
    const host: string = appConfig.get('HOST');

    // Assert
    assert.equal(port, 6000);
    assert.equal(typeof port, 'number');
    assert.equal(host, '0.0.0.0');

    await moduleRef.close();
  });

  it('gives .env.<mode>.local highest file precedence over .env.<mode>', async () => {
    // Arrange
    const dir = mkdtempSync(join(tmpdir(), 'core-banking-local-env-'));
    tempDirs.push(dir);
    writeFileSync(join(dir, '.env.development'), 'PORT=6000\n', 'utf8');
    writeFileSync(join(dir, '.env.development.local'), 'PORT=7000\n', 'utf8');

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          override: true,
          envFilePath: getEnvFilePaths('development', dir, dir),
          validate: validateEnv,
        }),
      ],
      providers: [AppConfigService],
    }).compile();
    const appConfig = moduleRef.get(AppConfigService);

    // Act
    const port: number = appConfig.get('PORT');

    // Assert
    assert.equal(port, 7000);

    await moduleRef.close();
  });

  it('exposes global typed config values via AppConfigModule and ConfigService', async () => {
    // Arrange
    const moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, ConsumerModule],
    }).compile();
    const consumer = moduleRef.get(ConsumerService);

    // Act
    const port: number = consumer.appConfig.get('PORT');
    const host: string = consumer.appConfig.get('HOST');
    const nodeEnv: 'development' | 'production' = consumer.appConfig.get('NODE_ENV');
    const corsOrigins: string[] = consumer.appConfig.get('CORS_ORIGINS');
    const trustProxy: boolean = consumer.appConfig.get('TRUST_PROXY');
    const inferredPort: number = consumer.configService.get('PORT', {
      infer: true,
    });

    // Assert
    assert.equal(typeof port, 'number');
    assert.ok(port >= 1 && port <= 65535);
    assert.ok(host.length > 0);
    assert.ok(nodeEnv === 'development' || nodeEnv === 'production');
    assert.ok(Array.isArray(corsOrigins));
    assert.equal(typeof trustProxy, 'boolean');
    assert.equal(inferredPort, port);

    await moduleRef.close();
  });

  it('refuses to start ConfigModule when PORT is invalid in env file', async () => {
    // Arrange
    const dir = mkdtempSync(join(tmpdir(), 'core-banking-env-'));
    tempDirs.push(dir);
    const envPath = join(dir, '.env');
    writeFileSync(envPath, 'PORT=invalid-port\nNODE_ENV=staging\n', 'utf8');
    let caughtError: unknown;

    // Act
    try {
      await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            override: true,
            envFilePath: envPath,
            validate: validateEnv,
          }),
        ],
      }).compile();
    } catch (error) {
      caughtError = error;
    }

    // Assert
    assert.ok(caughtError instanceof Error);
    assert.match(caughtError.message, /- NODE_ENV:/);
    assert.match(caughtError.message, /- PORT:/);
  });
});
