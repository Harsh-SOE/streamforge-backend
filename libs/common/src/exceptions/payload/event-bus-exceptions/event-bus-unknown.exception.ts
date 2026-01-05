import {
  InfrastructureOperationFailureLevel,
  EVENT_BUS_EXCEPTION,
} from '../../shared/exception-codes';
import { InfrastructureException } from '../base';

export type EventBusUnknownExceptionMetadata = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  topic?: string;
  message?: string;
  [key: string]: any;
};

export type EventBusUnknownExceptionOptions = {
  message?: string;
  contextError?: Error;
  operation?: string;
  meta?: EventBusUnknownExceptionMetadata;
};

export class EventBusUnknownException extends InfrastructureException {
  constructor(options: EventBusUnknownExceptionOptions) {
    const { message = 'An error occured in message bus', meta, contextError, operation } = options;
    super({
      message,
      code: EVENT_BUS_EXCEPTION.EVENT_BUS_UNKNOWN_EXCEPTION,
      contextError,
      meta,
      component: 'EVENT_BUS',
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
    });
  }
}
