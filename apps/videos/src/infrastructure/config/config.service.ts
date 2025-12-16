import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, KafkaOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { VIDEO_PACKAGE_NAME } from '@app/contracts/videos';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

  get CACHE_HOST() {
    return this.configService.getOrThrow<string>('CACHE_HOST');
  }

  get CACHE_PORT() {
    return this.configService.getOrThrow<number>('CACHE_PORT');
  }

  get DATABASE_URL() {
    return this.configService.getOrThrow<string>('DATABASE_URL');
  }

  get VIDEO_CLIENT_ID() {
    return this.configService.getOrThrow<string>('VIDEO_CLIENT_ID');
  }

  get VIDEO_CONSUMER_ID() {
    return this.configService.getOrThrow<string>('VIDEO_CONSUMER_ID');
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

  get VIDEO_TRANSCODER_SERVICE_OPTIONS() {
    const options: KafkaOptions = {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: this.VIDEO_CLIENT_ID,
          brokers: [`${this.MESSAGE_BROKER_HOST}:${this.MESSAGE_BROKER_PORT}`],
        },
        consumer: {
          groupId: this.VIDEO_CONSUMER_ID,
        },
      },
    };
    return options;
  }

  get GRPC_OPTIONS(): GrpcOptions {
    const options: GrpcOptions = {
      transport: Transport.GRPC,
      options: {
        protoPath: [join(__dirname, 'proto/videos.proto'), HealthCheckProto],
        package: [VIDEO_PACKAGE_NAME],
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
