import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, KafkaOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { ENVIRONMENT } from '@app/utils/enums';
import { READ_PACKAGE_NAME } from '@app/contracts/protocols/read';

@Injectable()
export class ReadConfigService {
  constructor(private readonly configService: ConfigService) {}

  get NODE_ENVIRONMENT() {
    return this.configService.getOrThrow<ENVIRONMENT>('NODE_ENVIRONMENT');
  }

  get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

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

  get GRPC_OPTIONS(): GrpcOptions {
    const options: GrpcOptions = {
      transport: Transport.GRPC,
      options: {
        protoPath: [join(__dirname, 'proto/read.proto'), HealthCheckProto],
        package: [READ_PACKAGE_NAME],
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
