import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [env.CLIENT_URL, env.PANEL_URL],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(env.PORT);
  console.log(`🚀 BlueBank Core-Banking service running on: http://localhost:${env.PORT}`);
}

void bootstrap();
