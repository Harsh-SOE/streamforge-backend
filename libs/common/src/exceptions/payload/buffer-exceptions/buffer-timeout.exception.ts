import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  BUFFER_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type BufferTimeOutExceptionMetadata = {
  host?: string;
  port?: number;
};

export type BufferTimeOutExceptionOptions = {
  message?: string;
  meta?: BufferTimeOutExceptionMetadata;
  contextError?: Error;
  operation?: string;
};

export class BufferTimeoutException extends InfrastructureException {
  constructor(options: BufferTimeOutExceptionOptions) {
    const { message = 'Buffer operation timed out', meta, contextError, operation } = options;
    super({
      message,
      code: BUFFER_EXCEPTION.BUFFER_TIMEOUT_EXCEPTION,
      component: Components.BUFFER,
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
      meta,
      contextError,
    });
  }
}
