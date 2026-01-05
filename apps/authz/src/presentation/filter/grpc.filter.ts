import { status as GrpcStatus } from '@grpc/grpc-js';
import { Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';

import {
  GrpcApplicationException,
  GrpcExceptionPayload,
} from '@app/common/exceptions/payload/grpc-exceptions';
import { InfrastructureException } from '@app/common/exceptions/payload/base';

@Catch()
export class GrpcFilter implements ExceptionFilter {
  catch(exception: any) {
    let code = GrpcStatus.UNKNOWN;
    const message = 'Internal server error';
    let payload: GrpcExceptionPayload = {
      statusCode: 'UNKNOWN',
      serviceExceptionCode: GrpcStatus.UNKNOWN,
      httpExceptionCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: `something went wrong`,
      timestamp: new Date().toISOString(),
      severity: 'ERROR',
    };

    if (exception instanceof InfrastructureException) {
      code = GrpcStatus.INTERNAL;
      payload = {
        severity: 'INTERNAL_ERROR',
        statusCode: exception.code,
        timestamp: exception.timestamp.toISOString(),
        serviceExceptionCode: GrpcStatus.INTERNAL,
        httpExceptionCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message ?? `something went wrong on server side`,
      };
    }
    throw new GrpcApplicationException(code, message, payload);
  }
}
