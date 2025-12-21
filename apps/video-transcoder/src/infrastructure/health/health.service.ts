import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { Admin, Kafka, logLevel } from 'kafkajs';

import { AppConfigService } from '../config';

@Injectable()
export class AppHealthService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private admin: Admin;

  public constructor(
    private readonly healthIndicator: HealthIndicatorService,
    private readonly configService: AppConfigService,
  ) {
    this.kafka = new Kafka({
      brokers: [`${configService.KAFKA_HOST}:${configService.KAFKA_PORT}`],
      ssl: {
        rejectUnauthorized: true,
        ca: [this.configService.KAFKA_CA_CERT],
        key: this.configService.ACCESS_KEY,
        cert: this.configService.ACCESS_CERT,
      },
      clientId: this.configService.KAFKA_CLIENT_ID,
      logLevel: logLevel.WARN,
    });
    this.admin = this.kafka.admin();
  }

  public async onModuleInit() {
    await this.admin.connect();
  }

  public async onModuleDestroy() {
    await this.admin.disconnect();
  }

  public async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicator.check(key);
    try {
      const topics = await this.admin.listTopics();
      return indicator.up({ health: 'OK', topics: topics });
    } catch (error) {
      console.error(error);
      return indicator.down({ health: 'UNHEALTHY', topics: [] });
    }
  }
}
