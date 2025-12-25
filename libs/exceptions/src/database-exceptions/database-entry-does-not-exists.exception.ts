import { Components } from '@app/common/components';

import {
  DATABASE_EXCEPTION,
  InfrastructureException,
  InfrastructureOperationFailureLevel,
} from '../infrastructure-exceptions';

export type DatabaseEntityDoesNotExistsExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  entityToCreate?: any;
};

export type DatabaseEntryDoesNotExistsExceptionOptions = {
  message?: string;
  meta?: DatabaseEntityDoesNotExistsExceptionMetaData;
  contextError?: Error;
};

export class DatabaseEntityDoesNotExistsException extends InfrastructureException {
  constructor(options: DatabaseEntryDoesNotExistsExceptionOptions) {
    const { message = `Entry does not exists`, contextError, meta } = options;

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
