import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  BUFFER_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type BufferConnectionExceptionMetaData = {
  host?: string;
  port?: number;
};

export type BufferConnectionExceptionOptions = {
  message?: string;
  meta?: BufferConnectionExceptionMetaData;
  contextError?: Error;
};

export class BufferConnectionException extends InfrastructureException {
  constructor(options: BufferConnectionExceptionOptions) {
    const { message = `Unable to connect to buffer`, meta, contextError } = options;
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
