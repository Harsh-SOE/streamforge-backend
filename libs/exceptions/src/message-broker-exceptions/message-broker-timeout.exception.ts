import {
  InfrastructureOperationFailureLevel,
  MESSAGE_BROKER_EXCEPTION,
  InfrastructureException,
} from '../infrastructure-exceptions';

export type MessageBrokerTimeoutExceptionMetadata = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  topic?: string;
  message?: string;
};

export type MessageBrokerTimeoutExceptionOptions = {
  message: string;
  contextError?: Error;
  operation?: string;
  meta?: MessageBrokerTimeoutExceptionMetadata;
};

export class MessageBrokerTimeoutException extends InfrastructureException {
  constructor(options: MessageBrokerTimeoutExceptionOptions) {
    const { message, contextError, operation, meta } = options;
    super({
      message,
      code: MESSAGE_BROKER_EXCEPTION.CACHE_TIMEOUT_EXCEPTION,
      component: 'MESSAGE_BROKER',
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
      contextError,
      meta,
    });
  }
}
