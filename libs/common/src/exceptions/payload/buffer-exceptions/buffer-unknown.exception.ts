import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  BUFFER_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type BufferUnknownExceptionMetadata = {
  host?: string;
  port?: number;
  valueToBuffer?: string;
  errorType?: string;
};

export type BufferUnknownExceptionOptions = {
  message?: string;
  operation?: string;
  meta?: BufferUnknownExceptionMetadata;
  contextError?: Error;
};

export class BufferUnknownException extends InfrastructureException {
  constructor(options: BufferUnknownExceptionOptions) {
    const {
      message = 'Something went wrong while performing buffer operation',
      operation,
      contextError,
      meta,
    } = options;
    super({
      message,
      code: BUFFER_EXCEPTION.BUFFER_UNKNOWN_EXCEPTION,
      component: Components.BUFFER,
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
      meta,
      contextError,
    });
  }
}
