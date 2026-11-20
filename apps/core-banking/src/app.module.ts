import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { BankingModule } from './banking/banking.module';

@Module({
  imports: [HealthModule, BankingModule],
})
export class AppModule {}
