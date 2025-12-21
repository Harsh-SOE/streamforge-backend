import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { USER_PACKAGE_NAME } from '@app/contracts/users';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

  get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  get DATABASE_URL() {
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

  get MAX_DB_CONNECTIONS() {
    return this.configService.getOrThrow<number>('MAX_DB_CONNECTIONS');
  }

  get MIN_DB_CONNECTIONS() {
    return this.configService.getOrThrow<number>('MIN_DB_CONNECTIONS');
  }

  get DB_IDLE_CONNECTION_TIMEOUT() {
    return this.configService.getOrThrow<number>('DB_IDLE_CONNECTION_TIMEOUT');
  }

  get DB_QUERY_CONNECTION_TIMEOUT() {
    return this.configService.getOrThrow<number>('DB_QUERY_CONNECTION_TIMEOUT');
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

  get GRPC_OPTIONS(): GrpcOptions {
    const options: GrpcOptions = {
      transport: Transport.GRPC,
      options: {
        protoPath: [join(__dirname, 'proto/users.proto'), HealthCheckProto],
        package: [USER_PACKAGE_NAME],
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
    return options;
  }
}
