import fs from 'fs';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get KAFKA_HOST() {
    return this.configService.getOrThrow<string>('KAFKA_HOST');
  }

  get KAFKA_PORT() {
    return this.configService.getOrThrow<number>('KAFKA_PORT');
  }

  get KAFKA_CA_CERT() {
    return fs.readFileSync('secrets/ca.pem', 'utf-8');
  }

  get ACCESS_KEY() {
    return fs.readFileSync('secrets/access.key', 'utf-8');
  }

  get ACCESS_CERT() {
    return fs.readFileSync('secrets/access.cert', 'utf-8');
  }

  get KAFKA_CLIENT_ID() {
    return this.configService.getOrThrow<string>('KAFKA_CLIENT_ID');
  }

  get KAFKA_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('KAFKA_CONSUMER_ID');
  }

  get KAFKA_FLUSH_MAX_WAIT_TIME_MS() {
    return this.configService.getOrThrow<number>('KAFKA_FLUSH_MAX_WAIT_TIME_MS');
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get REDIS_HOST() {
    return this.configService.getOrThrow<string>('REDIS_HOST');
  }

  get REDIS_PORT() {
    return this.configService.getOrThrow<number>('REDIS_PORT');
  }

  get REDIS_STREAM_KEY() {
    return this.configService.getOrThrow<string>('REDIS_STREAM_KEY');
  }

  get REDIS_STREAM_GROUPNAME() {
    return this.configService.getOrThrow<string>('REDIS_STREAM_GROUPNAME');
  }

  get REDIS_STREAM_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('REDIS_STREAM_CONSUMER_ID');
  }

  get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  get KAFKA_OPTIONS(): KafkaOptions {
    const options: KafkaOptions = {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: this.KAFKA_CLIENT_ID,
          brokers: [`${this.KAFKA_HOST}:${this.KAFKA_PORT}`],
          ssl: {
            rejectUnauthorized: true,
            ca: [this.KAFKA_CA_CERT],
            key: this.ACCESS_KEY,
            cert: this.ACCESS_CERT,
          },
          retry: {
            initialRetryTime: 300,
            retries: 10,
          },
        },
        consumer: {
          groupId: this.KAFKA_CONSUMER_ID,
        },
      },
    };
    return options;
  }
}
