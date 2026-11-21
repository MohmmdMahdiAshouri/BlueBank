import { Controller, Get } from '@nestjs/common';
import { ApiResponse, createSuccessResponse, HealthCheckData } from '../contracts';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  getHealth(): ApiResponse<HealthCheckData> {
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);

    const healthData: HealthCheckData = {
      service: 'core-banking',
      status: 'ok',
      uptime,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'ok',
          latencyMs: 3,
        },
        paymentGateway: {
          status: 'ok',
          latencyMs: 12,
        },
      },
    };

    return createSuccessResponse(healthData);
  }
}
