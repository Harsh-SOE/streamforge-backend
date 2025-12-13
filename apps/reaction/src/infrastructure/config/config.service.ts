/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { ReflectionService } from '@grpc/reflection';

import { REACTION_PACKAGE_NAME } from '@app/contracts/reaction';
import { GRPC_HEALTH_V1_PACKAGE_NAME } from '@app/contracts/health';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

  public get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get CACHE_HOST() {
    return this.configService.getOrThrow<string>('CACHE_HOST');
  }

  get CACHE_PORT() {
    return this.configService.getOrThrow<number>('CACHE_PORT');
  }

  get REACTION_CLIENT_ID() {
    return this.configService.getOrThrow<string>('REACTION_CLIENT_ID');
  }

  get REACTION_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('REACTION_CONSUMER_ID');
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

  get GRPC_OPTIONS(): GrpcOptions {
    const options: GrpcOptions = {
      transport: Transport.GRPC,
      options: {
        protoPath: [join(__dirname, 'proto/reaction.proto'), join(__dirname, 'proto/health.proto')],
        package: [REACTION_PACKAGE_NAME, GRPC_HEALTH_V1_PACKAGE_NAME],
        url: `0.0.0.0:${this.GRPC_PORT}`,
        onLoadPackageDefinition(pkg, server) {
          new ReflectionService(pkg).addToServer(server);
        },
      },
    };
    return options;
  }
}
