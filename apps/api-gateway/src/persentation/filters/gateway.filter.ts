import { Response } from 'express';
import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';

import { getErrorPayload } from '../types';
import { isGrpcApplicationError } from '../gaurds';

@Catch()
export class GatewayExceptionFilter implements ExceptionFilter {
  constructor() {}

  catch(exception: any, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();

    let statusCode = 'Error';
    let timestamp = new Date().toISOString();
    let errorCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = `Something went wrong`;

    switch (true) {
      case isGrpcApplicationError(exception): {
        const errorPayload = getErrorPayload(exception);
        statusCode = errorPayload.statusCode ?? 'UNKNOWN';
        timestamp = errorPayload.timestamp;
        errorCode = errorPayload.httpExceptionCode;
        errorMessage = errorPayload.message;
        break;
      }

      case exception instanceof HttpException: {
        errorCode = exception.getStatus();
        errorMessage = exception.message;
        statusCode = exception.name;
        break;
      }
    }

    return response.status(errorCode).json({
      status: `Failure`,
      timestamp,
      statusCode: statusCode,
      errorCode: errorCode,
      success: false,
      message: errorMessage,
    });
  }
}
