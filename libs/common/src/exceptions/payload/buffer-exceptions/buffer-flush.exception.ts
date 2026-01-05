import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  BUFFER_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type BufferFlushOperationMetadata = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  errorType?: string;
};

export type BufferFlushExceptionOptions = {
  message?: string;
  meta?: BufferFlushOperationMetadata;
  contextError?: Error;
};

export class BufferFlushException extends InfrastructureException {
  constructor(options: BufferFlushExceptionOptions) {
    const { message = `Unable to flush values from buffer`, meta, contextError } = options;
    super({
      message,
      code: BUFFER_EXCEPTION.BUFFER_FLUSH_EXCEPTION,
      component: Components.BUFFER,
      operation: 'FLUSH',
      severity: InfrastructureOperationFailureLevel.ERROR,
      meta,
      contextError,
    });
  }
}
