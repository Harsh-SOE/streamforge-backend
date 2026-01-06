import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { HISTORY_PACKAGE_NAME } from '@app/contracts/history';

@Injectable()
export class HistoryConfigService {
  constructor(public readonly configService: ConfigService) {}

  get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  get GRPC_PORT() {
    return this.configService.getOrThrow<number>('GRPC_PORT');
  }

  get GRPC_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: [HISTORY_PACKAGE_NAME],
        protoPath: [join(__dirname, 'proto/history.proto'), HealthCheckProto],
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
