import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('should return health status ok with a valid timestamp', async () => {
    // Arrange
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();
    const healthController = moduleRef.get<HealthController>(HealthController);

    // Act
    const result = healthController.check();

    // Assert
    assert.equal(result.status, 'ok');
    assert.ok(result.timestamp);
    assert.ok(!isNaN(Date.parse(result.timestamp)));
  });
});
