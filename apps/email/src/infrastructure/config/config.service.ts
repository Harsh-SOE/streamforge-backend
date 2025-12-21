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

  get EMAIL_API_KEY() {
    return this.configService.getOrThrow<string>('EMAIL_API_KEY');
  }

  get FROM_EMAIL() {
    return this.configService.getOrThrow<string>('FROM_EMAIL');
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
