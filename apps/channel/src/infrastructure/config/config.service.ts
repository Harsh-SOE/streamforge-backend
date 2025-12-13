/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, KafkaOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { ReflectionService } from '@grpc/reflection';

import { CHANNEL_PACKAGE_NAME } from '@app/contracts/channel';
import { GRPC_HEALTH_V1_PACKAGE_NAME } from '@app/contracts/health';

@Injectable()
export class AppConfigService {
  public constructor(private configService: ConfigService) {}

  get SERVICE_PORT() {
    return this.configService.getOrThrow<number>('SERVICE_PORT');
  }

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: [CHANNEL_PACKAGE_NAME, GRPC_HEALTH_V1_PACKAGE_NAME],
        protoPath: [join(__dirname, 'proto/channel.proto'), join(__dirname, 'proto/health.proto')],
        url: `0.0.0.0:${this.SERVICE_PORT}`,
        onLoadPackageDefinition(pkg, server) {
          new ReflectionService(pkg).addToServer(server);
        },
      },
    };
  }

  get MESSAGE_BROKER_HOST() {
    return this.configService.getOrThrow<string>('MESSAGE_BROKER_HOST');
  }

  get MESSAGE_BROKER_PORT() {
    return this.configService.getOrThrow<number>('MESSAGE_BROKER_PORT');
  }

  get EMAIL_CLIENT_ID() {
    return this.configService.getOrThrow<string>('EMAIL_CLIENT_ID');
  }

  get EMAIL_CONSUMER_GROUP_ID() {
    return this.configService.getOrThrow<string>('EMAIL_CONSUMER_GROUP_ID');
  }

  get CHANNEL_CLIENT_ID() {
    return this.configService.getOrThrow<string>('CHANNEL_CLIENT_ID');
  }

  get CHANNEL_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('CHANNEL_CONSUMER_ID');
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

  get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  get KAFKA_OPTIONS(): KafkaOptions {
    return {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: this.EMAIL_CLIENT_ID,
          brokers: [`${this.MESSAGE_BROKER_HOST}:${this.MESSAGE_BROKER_PORT}`],
        },
        consumer: {
          groupId: this.EMAIL_CONSUMER_GROUP_ID,
        },
      },
    };
  }
}
