import { KafkaOptions, Transport } from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get KAFKA_PORT() {
    return this.configService.getOrThrow<number>('KAFKA_PORT');
  }

  get KAFKA_HOST() {
    return this.configService.getOrThrow<string>('KAFKA_HOST');
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get PROJECTION_CLIENT_ID() {
    return this.configService.getOrThrow<string>('PROJECTION_CLIENT_ID');
  }

  get PROJECTION_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('PROJECTION_CONSUMER_ID');
  }

  get MESSAGE_BROKER_HOST() {
    return this.configService.getOrThrow<string>('MESSAGE_BROKER_HOST');
  }

  get MESSAGE_BROKER_PORT() {
    return this.configService.getOrThrow<number>('MESSAGE_BROKER_PORT');
  }

  get BUFFER_CLIENT_ID() {
    return this.configService.getOrThrow<string>('BUFFER_CLIENT_ID');
  }

  get BUFFER_KAFKA_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('BUFFER_KAFKA_CONSUMER_ID');
  }

  get BUFFER_FLUSH_MAX_WAIT_TIME_MS() {
    return this.configService.getOrThrow<number>('BUFFER_FLUSH_MAX_WAIT_TIME_MS');
  }

  get BUFFER_KEY() {
    return this.configService.getOrThrow<string>('BUFFER_KEY');
  }

  get BUFFER_GROUPNAME() {
    return this.configService.getOrThrow<string>('BUFFER_GROUPNAME');
  }

  get BUFFER_REDIS_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('BUFFER_REDIS_CONSUMER_ID');
  }

  get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  get KAFKA_OPTIONS(): KafkaOptions {
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: this.PROJECTION_CLIENT_ID,
          brokers: [`${this.KAFKA_HOST}:${this.KAFKA_PORT}`],
        },
        consumer: {
          groupId: this.PROJECTION_CONSUMER_ID,
        },
      },
    };
  }
}
