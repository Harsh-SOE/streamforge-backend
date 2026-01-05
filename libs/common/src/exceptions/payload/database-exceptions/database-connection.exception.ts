import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  DATABASE_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type DatabaseConnectionExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
};

export type DatabaseConnectionExceptionOptions = {
  message?: string;
  meta?: DatabaseConnectionExceptionMetaData;
  contextError?: Error;
};

export class DatabaseConnectionException extends InfrastructureException {
  constructor(options: DatabaseConnectionExceptionOptions) {
    const { message = `Unable to connect to database`, contextError, meta } = options;

    super({
      code: DATABASE_EXCEPTION.DATABASE_CONNECTION_EXCEPTION,
      message,
      component: Components.DATABASE,
      operation: 'connection',
      severity: InfrastructureOperationFailureLevel.FATAL,
      contextError,
      meta,
    });
  }
}
