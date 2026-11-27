import 'reflect-metadata';
import type { IncomingMessage } from 'node:http';
import { Logger, RequestMethod, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger as PinoNestLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { AppConfigModule } from './config/app-config.module';
import { AppConfigService } from './config/app-config.service';
import { resolveRequestId } from './logging/request-id';

async function bootstrap() {
  const configContext = await NestFactory.createApplicationContext(AppConfigModule, {
    logger: ['error', 'warn'],
  });
  const bootstrapConfig = configContext.get(AppConfigService);
  const trustProxy = bootstrapConfig.get('TRUST_PROXY');
  const bodyLimit = bootstrapConfig.get('BODY_LIMIT');
  await configContext.close();

  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    requestIdHeader: false,
    genReqId: (req: IncomingMessage) => resolveRequestId(req.headers['x-request-id']),
    trustProxy,
    bodyLimit,
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

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    bufferLogs: true,
  });

  app.enableShutdownHooks();
  app.useLogger(app.get(PinoNestLogger));

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
  new Logger('Bootstrap').log(
    `BlueBank Core-Banking service (Fastify) running on: http://${host}:${port}`,
  );
}

void bootstrap();
