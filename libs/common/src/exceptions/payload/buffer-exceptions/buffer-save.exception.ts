import { Components } from '@app/common';

import { InfrastructureException } from '../base';
import {
  BUFFER_EXCEPTION,
  InfrastructureOperationFailureLevel,
} from '../../shared/exception-codes';

export type BufferWriteExceptionMetadata = {
  host?: string;
  port?: number;
  valueToBuffer?: string;
  errorType?: string;
};

export type BufferSaveExceptionOptions = {
  message?: string;
  meta?: BufferWriteExceptionMetadata;
  contextError?: Error;
};

export class BufferSaveException extends InfrastructureException {
  constructor(options: BufferSaveExceptionOptions) {
    const { message = 'Unable to write into buffer', contextError, meta } = options;

    super({
      message,
      code: BUFFER_EXCEPTION.BUFFER_SAVE_EXCEPTION,
      component: Components.BUFFER,
      operation: 'SAVE',
      severity: InfrastructureOperationFailureLevel.ERROR,
      meta,
      contextError,
    });
  }
}
