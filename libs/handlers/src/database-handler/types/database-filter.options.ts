interface BaseDatabaseOptions {
  logErrors?: boolean;
  host?: string;
}

interface DatabaseCreateOperationOptions extends BaseDatabaseOptions {
  operationType: 'CREATE';
  filter?: never;
  entry: Record<string, any> | Record<string, any>[];
}

interface DatabaseReadOperationOptions extends BaseDatabaseOptions {
  operationType: 'READ';
  filter: Record<string, any>;
  entry?: never;
}

interface DatabaseUpdateOperationOptions extends BaseDatabaseOptions {
  operationType: 'UPDATE';
  filter: Record<string, any>;
  entry: Record<string, any>;
}

interface DatabaseDeleteOperationOptions extends BaseDatabaseOptions {
  operationType: 'DELETE';
  filter: Record<string, any>;
  entry?: never;
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

type DatabaseOperationOptions =
  | DatabaseCreateOperationOptions
  | DatabaseReadOperationOptions
  | DatabaseUpdateOperationOptions
  | DatabaseDeleteOperationOptions;

export type DatabaseFilterOptions<TFallbackResult = never> =
  DatabaseOperationOptions extends infer T
    ? T & ErrorHandlingOptions<TFallbackResult>
    : never;
