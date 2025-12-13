import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import { join } from 'path';

import { GRPC_HEALTH_V1_PACKAGE_NAME } from '@app/contracts/health';
import { VIEWS_PACKAGE_NAME } from '@app/contracts/views';

@Injectable()
export class AppConfigService {
  public constructor(private readonly configService: ConfigService) {}

  public get SERVICE_HOST() {
    return this.configService.getOrThrow<string>('SERVICE_HOST');
  }

  public get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

  public get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  public get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  public get CACHE_HOST() {
    return this.configService.getOrThrow<string>('CACHE_HOST');
  }

  public get CACHE_PORT() {
    return this.configService.getOrThrow<number>('CACHE_PORT');
  }

  public get MESSAGE_BROKER_HOST() {
    return this.configService.getOrThrow<string>('MESSAGE_BROKER_HOST');
  }

  public get MESSAGE_BROKER_PORT() {
    return this.configService.getOrThrow<number>('MESSAGE_BROKER_PORT');
  }

  public get BUFFER_CLIENT_ID() {
    return this.configService.getOrThrow<string>('BUFFER_CLIENT_ID');
  }

  public get BUFFER_KAFKA_CONSUMER_ID() {
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

  public get GRPC_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: [VIEWS_PACKAGE_NAME, GRPC_HEALTH_V1_PACKAGE_NAME],
        protoPath: [join(__dirname, 'proto/views.proto'), join(__dirname, 'proto/health.proto')],
        url: `0.0.0.0:${this.GRPC_PORT}`,
        onLoadPackageDefinition(
          pkg: protoLoader.PackageDefinition,
          server: Pick<grpc.Server, 'addService'>,
        ) {
          new ReflectionService(pkg).addToServer(server);
        },
      },
    };
  }
}
