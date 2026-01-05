import { InfrastructureException } from '../base';
import { CACHE_EXCEPTION, InfrastructureOperationFailureLevel } from '../../shared/exception-codes';

export type CacheWriteExceptionMetadata = {
  key?: string | string[];
  value?: string | string[];
  errorType?: string;
  host?: string;
  port?: number;
};

export type CacheWriteExceptionOptions = {
  message?: string;
  meta?: CacheWriteExceptionMetadata;
  contextError?: Error;
};

export class CacheWriteException extends InfrastructureException {
  constructor(options: CacheWriteExceptionOptions) {
    const { message = 'Unable to write into cache', contextError, meta } = options;

    super({
      message,
      code: CACHE_EXCEPTION.CACHE_WRITE_EXCEPTION,
      component: 'CACHE',
      operation: 'WRITE',
      severity: InfrastructureOperationFailureLevel.ERROR,
      meta,
      contextError,
    });
  }
}
