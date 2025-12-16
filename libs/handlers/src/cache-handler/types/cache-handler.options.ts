interface BaseRedisOptions {
  logErrors?: boolean;
  host?: string;
  port?: number;
}

interface RedisConnectionOperationOptions extends BaseRedisOptions {
  operationType: 'CONNECT_OR_DISCONNECT';
  keys?: never;
  key?: never;
  values?: never;
  value?: never;
}

interface RedisReadOperationOptions extends BaseRedisOptions {
  operationType: 'READ';
  keys?: never;
  key: string;
  values?: never;
  value?: never;
}

interface RedisReadManyOperationOptions extends BaseRedisOptions {
  operationType: 'READ_MANY';
  keys: string[];
  key?: never;
  value?: never;
  values?: never;
}

interface RedisDeleteOperationOptions extends BaseRedisOptions {
  operationType: 'DELETE';
  key: string;
  keys?: never;
  value?: never;
  values?: never;
}

interface RedisWriteOperationOptions extends BaseRedisOptions {
  operationType: 'WRITE';
  keys?: never;
  key: string;
  values?: never;
  value: string;
}

interface RedisWriteManyOperationOptions extends BaseRedisOptions {
  operationType: 'WRITE_MANY';
  keys: string[];
  key?: never;
  values: string[] | string;
  value?: never;
}

interface SuppressErrorsOptions<TFallbackResult> {
  suppressErrors: true;
  fallbackValue: TFallbackResult;
}

interface ThrowErrorsOptions {
  suppressErrors?: false;
  fallbackValue?: never;
}

type ErrorHandlingOptions<TFallbackResult> =
  | SuppressErrorsOptions<TFallbackResult>
  | ThrowErrorsOptions;

export type RedisOptions<TFallbackResult = never> = (
  | RedisConnectionOperationOptions
  | RedisReadOperationOptions
  | RedisReadManyOperationOptions
  | RedisWriteOperationOptions
  | RedisWriteManyOperationOptions
  | RedisDeleteOperationOptions
) &
  ErrorHandlingOptions<TFallbackResult>;
