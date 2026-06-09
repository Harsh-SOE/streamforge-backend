import { join } from 'path';
import * as grpc from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as protoLoader from '@grpc/proto-loader';
import { GrpcOptions, Transport } from '@nestjs/microservices';
import { HealthImplementation, protoPath as HealthCheckProto } from 'grpc-health-check';

import { AUTH_Z_PACKAGE_NAME } from '@app/contracts/protocols/authz';

@Injectable()
export class AuthzConfigService {
  public constructor(private configService: ConfigService) {}

  public get HTTP_PORT() {
    return this.configService.getOrThrow<number>('HTTP_PORT');
  }

  public get SERVICE_PORT() {
    return this.configService.getOrThrow<number>('SERVICE_PORT');
  }

  public get FGA_API_URL() {
    return this.configService.getOrThrow<string>('FGA_API_URL');
  }

  public get FGA_MODEL_ID() {
    return this.configService.getOrThrow<string>('FGA_MODEL_ID');
  }
  public get FGA_STORE_ID() {
    return this.configService.getOrThrow<string>('FGA_STORE_ID');
  }

  public get GRAFANA_LOKI_URL() {
    return this.configService.getOrThrow<string>('GRAFANA_LOKI_URL');
  }

  public get SERVICE_OPTIONS(): GrpcOptions {
    return {
      transport: Transport.GRPC,
      options: {
        package: [AUTH_Z_PACKAGE_NAME],
        protoPath: [join(__dirname, 'proto/authz.proto'), HealthCheckProto],
        url: `0.0.0.0:${this.SERVICE_PORT}`,
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
