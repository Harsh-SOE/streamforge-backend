import {
  InfrastructureOperationFailureLevel,
  MESSAGE_BROKER_EXCEPTION,
  InfrastructureException,
} from '../infrastructure-exceptions';

export type MessageBrokerUnknownExceptionMetadata = {
  host?: string;
  port?: number;
  retryAttempt?: number;
  topic?: string;
  message?: string;
};

export type MessageBrokerUnknownExceptionOptions = {
  message?: string;
  contextError?: Error;
  operation?: string;
  meta?: MessageBrokerUnknownExceptionMetadata;
};

export class MessageBrokerUnknownException extends InfrastructureException {
  constructor(options: MessageBrokerUnknownExceptionOptions) {
    const {
      message = 'An error occured in message broker',
      meta,
      contextError,
      operation,
    } = options;
    super({
      message,
      code: MESSAGE_BROKER_EXCEPTION.MESSAGE_BROKER_UNKNOWN_EXCEPTION,
      contextError,
      meta,
      component: 'MESSAGE_BROKER',
      operation,
      severity: InfrastructureOperationFailureLevel.ERROR,
    });
  }
}
