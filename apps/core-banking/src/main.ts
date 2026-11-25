import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  app.enableShutdownHooks();

  const config = app.get(AppConfigService);
  const host = config.get('HOST');
  const port = config.get('PORT');
  const clientUrl = config.get('CLIENT_URL');
  const panelUrl = config.get('PANEL_URL');

  await app.register(import('@fastify/cors'), {
    origin: [clientUrl, panelUrl],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen({ port, host });
  console.log(`🚀 BlueBank Core-Banking service (Fastify) running on: http://${host}:${port}`);
}

void bootstrap();
