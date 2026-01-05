import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  DATABASE_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type DatabaseEntityDoesNotExistsExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  entityToCreate?: any;
};

export type DatabaseEntityDoesNotExistsExceptionOptions = {
  message?: string;
  meta?: DatabaseEntityDoesNotExistsExceptionMetaData;
  contextError?: Error;
};

export class DatabaseEntityDoesNotExistsException extends InfrastructureException {
  constructor(options: DatabaseEntityDoesNotExistsExceptionOptions) {
    const { message = `Entity does not exists`, contextError, meta } = options;

    super({
      code: DATABASE_EXCEPTION.DATABASE_ENTRY_DOES_NOT_EXISTS_EXCEPTION,
      message,
      component: Components.DATABASE,
      operation: 'find_or_update_or_delete',
      severity: InfrastructureOperationFailureLevel.ERROR,
      contextError,
      meta,
    });
  }
}
