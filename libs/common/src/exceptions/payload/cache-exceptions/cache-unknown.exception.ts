import { InfrastructureException } from '../base';
import { CACHE_EXCEPTION, InfrastructureOperationFailureLevel } from '../../shared/exception-codes';

export type CacheUnknownExceptionMetadata = {
  key?: string | string[];
  value?: string | string[];
  errorType?: string;
  host?: string;
  port?: number;
};

export type CacheUnknownExceptionOptions = {
  message?: string;
  operation: string;
  meta?: CacheUnknownExceptionMetadata;
  contextError?: Error;
};

export class CacheUnknownException extends InfrastructureException {
  constructor(options: CacheUnknownExceptionOptions) {
    const {
      message = 'Something went wrong while performing cache operation',
      operation,
      contextError,
      meta,
    } = options;
    super({
      message,
      code: CACHE_EXCEPTION.CACHE_UNKNOWN_EXCEPTION,
      component: 'CACHE',
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
      meta,
      contextError,
    });
  }
}
