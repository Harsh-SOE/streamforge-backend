import { join } from 'path';
import fs from 'fs';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { VIEWS_PACKAGE_NAME } from '@app/contracts/views';

@Injectable()
export class AppConfigService {
  public constructor(private readonly configService: ConfigService) {}

  public get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

  public get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  public get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
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

  public get GRPC_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: [VIEWS_PACKAGE_NAME],
        protoPath: [join(__dirname, 'proto/views.proto'), HealthCheckProto],
        url: `0.0.0.0:${this.GRPC_PORT}`,
        onLoadPackageDefinition(
          pkg: protoLoader.PackageDefinition,
          server: Pick<grpc.Server, 'addService'>,
        ) {
          const healthImpl = new HealthImplementation({
            '': 'UNKNOWN',
          });

          healthImpl.addToServer(server);
          healthImpl.setStatus('', 'SERVING');
        },
      },
    };
  }
}
