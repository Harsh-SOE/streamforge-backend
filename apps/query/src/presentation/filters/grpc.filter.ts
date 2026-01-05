import { throwError } from 'rxjs';
import { Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';

import {
  GrpcApplicationException,
  GrpcExceptionPayload,
} from '@app/common/exceptions/payload/grpc-exceptions';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';
import { InfrastructureException } from '@app/common/exceptions/payload/base';

@Catch()
export class GrpcFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER_PORT) private readonly logger: LoggerPort) {}

  catch(exception: any) {
    let code = GrpcStatus.UNKNOWN;
    // eslint-disable-next-line prefer-const
    let message = 'Internal server error';
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

    const error = new GrpcApplicationException(code, message, payload);
    this.logger.info(`The grpc error is`, error);

    return throwError(() => error.getError());
  }
}
