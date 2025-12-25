import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

import { KafkaClient } from '@app/clients/kafka';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';

@Injectable()
export class AppHealthService {
  public constructor(
    private readonly healthIndicator: HealthIndicatorService,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
    private readonly kafka: KafkaClient,
  ) {}

  public async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicator.check(key);
    try {
      const topics = await this.kafka.admin.listTopics();
      return indicator.up({ health: 'OK', topics: topics });
    } catch (error) {
      this.logger.error(`An error occured while connecting to kafka`, error as Error);
      return indicator.down({ health: 'UNHEALTHY', topics: [] });
    }
  }
}
