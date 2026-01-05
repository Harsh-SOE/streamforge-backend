import {
  InfrastructureOperationFailureLevel,
  EVENT_BUS_EXCEPTION,
} from '../../shared/exception-codes';
import { InfrastructureException } from '../base';

export type EventBusTimeoutExceptionMetadata = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  topic?: string;
  message?: string;
};

export type EventBusTimeoutExceptionOptions = {
  message: string;
  contextError?: Error;
  operation?: string;
  meta?: EventBusTimeoutExceptionMetadata;
};

export class EventBusTimeoutException extends InfrastructureException {
  constructor(options: EventBusTimeoutExceptionOptions) {
    const { message, contextError, operation, meta } = options;
    super({
      message,
      code: EVENT_BUS_EXCEPTION.EVENT_BUS_TIMEOUT_EXCEPTION,
      component: 'EVENT_BUS',
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
      contextError,
      meta,
    });
  }
}
