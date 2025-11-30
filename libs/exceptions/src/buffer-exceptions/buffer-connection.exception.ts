import { Components } from '@app/common/components';

import {
  BUFFER_EXCEPTION,
  InfrastructureException,
  InfrastructureOperationFailureLevel,
} from '../infrastructure-exceptions';

export type BufferConnectionExceptionMetaData = {
  host?: string;
  port?: number;
  retryAttempt?: number;
};

export type BufferConnectionExceptionOptions = {
  message?: string;
  meta?: BufferConnectionExceptionMetaData;
  contextError?: Error;
};

export class BufferConnectionException extends InfrastructureException {
  constructor(options: BufferConnectionExceptionOptions) {
    const {
      message = `Unable to connect to buffer`,
      meta,
      contextError,
    } = options;
    super({
      message,
      code: BUFFER_EXCEPTION.BUFFER_CONNECTION_EXCEPTION,
      component: Components.BUFFER,
      operation: 'CONNECTION',
      severity: InfrastructureOperationFailureLevel.FATAL,
      meta,
      contextError: contextError,
    });
    this.name = this.constructor.name;
  }
}
