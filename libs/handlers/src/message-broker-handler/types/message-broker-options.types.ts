interface BaseMessageBrokerOptions {
  logErrors?: boolean;
  host?: string;
  port?: number;
}

interface MessageBrokerConnectionOperationOptions extends BaseMessageBrokerOptions {
  operationType: 'CONNECT_OR_DISCONNECT';
  topic?: never;
  message?: never;
}
interface MessageBrokerPublishOrSendOperationOptions extends BaseMessageBrokerOptions {
  operationType: 'PUBLISH_OR_SEND';
  topic: string;
  message?: string;
}

interface MessageBrokerSubscribeOperationOptions extends BaseMessageBrokerOptions {
  operationType: 'SUBSCRIBE';
  topic: string;
  message?: never;
}

interface SuppressErrorsOptions<TFallbackResult> {
  suppressErrors: true;
  fallbackValue?: TFallbackResult;
}

interface ThrowErrorsOptions {
  suppressErrors?: false;
  fallbackValue?: never;
}

type ErrorHandlingOptions<TFallbackResult> =
  | SuppressErrorsOptions<TFallbackResult>
  | ThrowErrorsOptions;

export type MessageBrokerFilterOptions<TFallbackResult = never> = (
  | MessageBrokerConnectionOperationOptions
  | MessageBrokerPublishOrSendOperationOptions
  | MessageBrokerSubscribeOperationOptions
) &
  ErrorHandlingOptions<TFallbackResult>;
