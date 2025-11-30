import {
  CACHE_EXCEPTION,
  InfrastructureException,
  InfrastructureOperationFailureLevel,
} from '@app/exceptions/infrastructure-exceptions';

export type CacheConnectionExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
};

export type CacheConnectionExceptionOptions = {
  message?: string;
  meta?: CacheConnectionExceptionMetaData;
  contextError?: Error;
};

export class CacheConnectionException extends InfrastructureException {
  constructor(options: CacheConnectionExceptionOptions) {
    const {
      message = `Unable to connect to cache`,
      meta,
      contextError,
    } = options;
    super({
      message,
      code: CACHE_EXCEPTION.CACHE_CONNECTION_EXCEPTION,
      component: 'CACHE',
      operation: 'CONNECTION',
      severity: InfrastructureOperationFailureLevel.FATAL,
      meta,
      contextError: contextError,
    });
    this.name = this.constructor.name;
  }
}
