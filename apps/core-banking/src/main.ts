import 'reflect-metadata';
import { RequestMethod, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const configContext = await NestFactory.createApplicationContext(AppConfigModule, {
    logger: ['error', 'warn'],
  });
  const bootstrapConfig = configContext.get(AppConfigService);
  const trustProxy = bootstrapConfig.get('TRUST_PROXY');
  const bodyLimit = bootstrapConfig.get('BODY_LIMIT');
  await configContext.close();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      // Decides what `request.ip` is by controlling whether Fastify trusts X-Forwarded-* proxy headers.
      trustProxy,
      bodyLimit,
    }),
  );

  app.enableShutdownHooks();

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const config = app.get(AppConfigService);

  app.enableCors({
    origin: config.get('CORS_ORIGINS'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  const host = config.get('HOST');
  const port = config.get('PORT');

  await app.listen({ port, host });
  console.log(`🚀 BlueBank Core-Banking service (Fastify) running on: http://${host}:${port}`);
}

void bootstrap();
