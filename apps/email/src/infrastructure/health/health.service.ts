import fs from 'fs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';
import { Admin, Kafka, logLevel } from 'kafkajs';

import { AppConfigService } from '../config';

@Injectable()
export class AppHealthService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private admin: Admin;

  constructor(
    private readonly healthIndicator: HealthIndicatorService,
    private readonly configService: AppConfigService,
  ) {
    this.kafka = new Kafka({
      brokers: [`${configService.KAFKA_HOST}:${configService.KAFKA_PORT}`],
      ssl: {
        rejectUnauthorized: true,
        ca: [fs.readFileSync('secrets/ca.pem')],
        key: fs.readFileSync('secrets/access.key'),
        cert: fs.readFileSync('secrets/access.cert'),
      },
      clientId: this.configService.KAFKA_CLIENT_ID,
      logLevel: logLevel.WARN,
    });
    this.admin = this.kafka.admin();
  }

  async onModuleInit() {
    await this.admin.connect();
  }

  async onModuleDestroy() {
    await this.admin.disconnect();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
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
