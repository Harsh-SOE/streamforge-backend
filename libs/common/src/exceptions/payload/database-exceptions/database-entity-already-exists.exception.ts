import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  DATABASE_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type DatabaseEntityAlreadyExistsExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  entityToCreate?: any;
};

export type DatabaseEntityAlreadyExistsExceptionOptions = {
  message?: string;
  meta?: DatabaseEntityAlreadyExistsExceptionMetaData;
  contextError?: Error;
};

export class DatabaseEntityAlreadyExistsException extends InfrastructureException {
  constructor(options: DatabaseEntityAlreadyExistsExceptionOptions) {
    const { message = `Entity already exists`, contextError, meta } = options;

    super({
      code: DATABASE_EXCEPTION.DATABASE_ENTRY_ALREADY_EXISTS_EXCEPTION,
      message,
      component: Components.DATABASE,
      operation: 'save',
      severity: InfrastructureOperationFailureLevel.ERROR,
      contextError,
      meta,
    });
  }
}
