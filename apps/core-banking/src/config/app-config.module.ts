import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './app-config.service';
import { getEnvFilePaths, validateEnv } from './env.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      skipProcessEnv: true,
      envFilePath: getEnvFilePaths(),
      validate: validateEnv,
    }),
  ],
  providers: [AppConfigService],
  exports: [ConfigModule, AppConfigService],
})
export class AppConfigModule {}
