import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaOptions, Transport } from '@nestjs/microservices';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
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

  get AWS_REGION() {
    return this.configService.getOrThrow<string>('AWS_REGION');
  }

  get AWS_ACCESS_KEY() {
    return this.configService.getOrThrow<string>('AWS_ACCESS_KEY');
  }

  get AWS_ACCESS_SECRET() {
    return this.configService.getOrThrow<string>('AWS_ACCESS_SECRET');
  }

  get AWS_BUCKET() {
    return this.configService.getOrThrow<string>('AWS_BUCKET');
  }

  get KAFKA_HOST() {
    return this.configService.getOrThrow<string>('KAFKA_HOST');
  }

  get KAFKA_PORT() {
    return this.configService.getOrThrow<number>('KAFKA_PORT');
  }

  get KAFKA_CA_CERT() {
    const encoded = this.configService.getOrThrow<string>('KAFKA_CA_CERT');
    return Buffer.from(encoded, 'base64').toString('utf-8');
  }

  get ACCESS_KEY() {
    const encoded = this.configService.getOrThrow<string>('ACCESS_KEY');
    return Buffer.from(encoded, 'base64').toString('utf-8');
  }

  get ACCESS_CERT() {
    const encoded = this.configService.getOrThrow<string>('ACCESS_CERT');
    return Buffer.from(encoded, 'base64').toString('utf-8');
  }

  get KAFKA_CLIENT_ID() {
    return this.configService.getOrThrow<string>('KAFKA_CLIENT_ID');
  }

  get KAFKA_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('KAFKA_CONSUMER_ID');
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
