import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { env } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  await app.register(import('@fastify/cors'), {
    origin: [env.CLIENT_URL, env.PANEL_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(
    `🚀 BlueBank Core-Banking service (Fastify) running on: http://localhost:${env.PORT}`,
  );
}

void bootstrap();
