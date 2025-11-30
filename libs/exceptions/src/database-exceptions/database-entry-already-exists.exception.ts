import { Components } from '@app/common/components';

import {
  DATABASE_EXCEPTION,
  InfrastructureException,
  InfrastructureOperationFailureLevel,
} from '../infrastructure-exceptions';

export type DatabaseEntryAlreadyExistsExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  entityToCreate?: any;
};

export type DatabaseEntryAlreadyExistsExceptionOptions = {
  message?: string;
  meta?: DatabaseEntryAlreadyExistsExceptionMetaData;
  contextError?: Error;
};

export class DatabaseEntryAlreadyExistsException extends InfrastructureException {
  constructor(options: DatabaseEntryAlreadyExistsExceptionOptions) {
    const { message = `Entry already exists`, contextError, meta } = options;

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
