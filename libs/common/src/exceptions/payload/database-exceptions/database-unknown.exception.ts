import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  DATABASE_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type DatabaseUnknownExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
};

export type DatabaseUnknownExceptionOptions = {
  message?: string;
  meta?: DatabaseUnknownExceptionMetaData;
  contextError?: Error;
  operation?: string;
};

export class DatabaseUnknownException extends InfrastructureException {
  constructor(options: DatabaseUnknownExceptionOptions) {
    const {
      message = `An unknown database error has occured`,
      contextError,
      meta,
      operation,
    } = options;

    super({
      code: DATABASE_EXCEPTION.DATABASE_UNKNOWN_EXCEPTION,
      message,
      component: Components.DATABASE,
      operation: operation || 'unknown',
      severity: InfrastructureOperationFailureLevel.ERROR,
      contextError,
      meta,
    });
  }
}
