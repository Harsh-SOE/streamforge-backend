import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { COMMENT_PACKAGE_NAME } from '@app/contracts/comments';

@Injectable()
export class AppConfigService {
  public constructor(private configService: ConfigService) {}

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

  public get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  public get SERVICE_OPTION(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        protoPath: [join(__dirname, 'proto/comments.proto'), HealthCheckProto],
        package: [COMMENT_PACKAGE_NAME],
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
