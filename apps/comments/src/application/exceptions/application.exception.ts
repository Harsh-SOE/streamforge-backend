import { ApplicationOperationFailureLevel } from './enums/application-log-level.enum';

export type ApplicationExceptionOptions = {
  message: string;
  code: string;
  severity?: ApplicationOperationFailureLevel;
  component?: string;
  operation?: string;
  traceId?: string;
  contextError?: Error;
  meta?: Record<string, any>;
};

export class ApplicationException extends Error {
  public readonly timestamp: Date;
  public readonly code: string;
  public readonly severity: ApplicationOperationFailureLevel;
  public readonly component?: string;
  public readonly operation?: string;
  public readonly traceId?: string;
  public readonly meta?: Record<string, any>;
  public readonly contextError?: Error;

  public constructor(options: ApplicationExceptionOptions) {
    const {
      message = `Something went wrong`,
      code = 'ERROR',
      severity = ApplicationOperationFailureLevel.ERROR,
      component,
      operation,
      traceId,
      contextError,
      meta,
    } = options || {};
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.timestamp = new Date();
    this.severity = severity;
    this.component = component;
    this.operation = operation;
    this.traceId = traceId;
    this.meta = meta;

    if (process.env.NODE_ENV === 'DEVELOPMENT') this.contextError = contextError;
    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON() {
    return {
      timestamp: this.timestamp,
      name: this.name,
      code: this.code,
      message: this.message,
      severity: this.severity,
      component: this.component,
      operation: this.operation,
      traceId: this.traceId,
      meta: this.meta,
      cause: this.contextError,
    };
  }
}
