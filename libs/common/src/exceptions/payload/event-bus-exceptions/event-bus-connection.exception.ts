import {
  InfrastructureOperationFailureLevel,
  EVENT_BUS_EXCEPTION,
} from '../../shared/exception-codes';
import { InfrastructureException } from '../base';

export type EventBusConnectionExceptionMetadata = {
  host?: string;
  port?: number;
  retryAttempt?: number;
};

export type EventBusConnectionExceptionOptions = {
  message?: string;
  meta?: EventBusConnectionExceptionMetadata;
  contextError?: Error;
};

export class EventBusConnectionException extends InfrastructureException {
  constructor(options: EventBusConnectionExceptionOptions) {
    const { message = 'Unable to connect to message bus', contextError, meta } = options;
    super({
      message,
      code: EVENT_BUS_EXCEPTION.EVENT_BUS_CONNECTION_EXCEPTION,
      component: 'EVENT_BUS',
      operation: 'Connection',
      severity: InfrastructureOperationFailureLevel.FATAL,
      meta,
      contextError,
    });
  }
}
