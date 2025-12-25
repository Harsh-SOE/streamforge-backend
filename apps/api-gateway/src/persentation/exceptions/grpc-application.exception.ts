import { Metadata } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { Status } from '@grpc/grpc-js/build/src/constants';

import { ErrorPayload } from '../types';

export abstract class GrpcMicroservicesError extends RpcException {
  constructor(
    public readonly code: Status,
    public readonly details: string,
    public readonly errorPayload: ErrorPayload,
  ) {
    const metadata = new Metadata();
    metadata.add('error-payload', JSON.stringify(errorPayload));
    super({
      code,
      details,
      metadata,
    });
  }
}
