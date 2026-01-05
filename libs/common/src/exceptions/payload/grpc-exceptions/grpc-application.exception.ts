import { RpcException } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { Status } from '@grpc/grpc-js/build/src/constants';

import { GrpcExceptionPayload } from './types';

export class GrpcApplicationException extends RpcException {
  constructor(
    public readonly code: Status,
    public readonly details: string,
    public readonly errorPayload: GrpcExceptionPayload,
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
