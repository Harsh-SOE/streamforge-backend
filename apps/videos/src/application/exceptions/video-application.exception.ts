import { HttpStatus } from '@nestjs/common';

export type ApplicationExceptionOptions = {
  message: string;
  code: string;
  httpExceptionCode?: HttpStatus;
  traceId?: string;
  meta?: Record<string, any>;
};

export class ApplicationException extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly traceId?: string;
  public readonly meta?: Record<string, any>;
  public readonly httpStatus?: HttpStatus;

  public constructor(options: ApplicationExceptionOptions) {
    const {
      message = `Something went wrong`,
      code = 'ERROR',
      httpExceptionCode,
      traceId,
      meta,
    } = options || {};
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.timestamp = new Date();
    this.httpStatus = httpExceptionCode;
    this.traceId = traceId;
    this.meta = meta;

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      timestamp: this.timestamp,
      name: this.name,
      code: this.code,
      httpExceptionCode: this.httpStatus,
      message: this.message,
      traceId: this.traceId,
      meta: this.meta,
    };
  }
}
