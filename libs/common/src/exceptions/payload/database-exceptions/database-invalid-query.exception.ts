import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  DATABASE_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type DatabaseInvalidExceptionExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  query?: Record<string, any> | string;
  operationType?: string;
  entity?: Record<string, any>;
  filter?: Record<string, any>;
};

export type DatabaseInvalidExceptionOptions = {
  message?: string;
  meta?: DatabaseInvalidExceptionExceptionMetaData;
  contextError?: Error;
  operation?: string;
};

export class DatabaseInvalidQueryException extends InfrastructureException {
  constructor(options: DatabaseInvalidExceptionOptions) {
    const {
      message = `Invalid Query for an operation recieved`,
      contextError,
      meta,
      operation,
    } = options;

    super({
      code: DATABASE_EXCEPTION.DATABASE_INVALID_QUERY_EXCEPTION,
      message,
      component: Components.DATABASE,
      operation: operation || 'unknown',
      severity: InfrastructureOperationFailureLevel.ERROR,
      contextError,
      meta,
    });
  }
}
