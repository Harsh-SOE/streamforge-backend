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

  get PROJECTION_CLIENT_ID() {
    return this.configService.getOrThrow<string>('PROJECTION_CLIENT_ID');
  }

  get PROJECTION_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('PROJECTION_CONSUMER_ID');
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
