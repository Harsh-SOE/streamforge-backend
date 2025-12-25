export type DatabaseOperations = {
  CONNECT_OR_DISCONNECT: {
    filter?: never;
    entity?: never;
  };

  CREATE: {
    filter?: never;
    entity: Record<string, any> | Record<string, any>[];
  };

  READ: {
    filter: Record<string, any>;
    entity?: never;
  };

  UPDATE: {
    filter: Record<string, any>;
    entity: Record<string, any>;
  };

  DELETE: {
    filter: Record<string, any>;
    entity?: never;
  };
};

type SuppressErrors<TSupressedResult> = {
  suppressErrors: true;
  fallbackValue: TSupressedResult;
};

type ThrowErrors = {
  suppressErrors?: false;
  fallbackValue?: never;
};

type ErrorHandling<TSupressedResult> = SuppressErrors<TSupressedResult> | ThrowErrors;

export type DatabaseOperationsConfig = {
  [K in keyof DatabaseOperations]: {
    operationType: K;
  } & DatabaseOperations[K];
}[keyof DatabaseOperations];

export type DatabaseOperationsOptions<TSupressedResult> = DatabaseOperationsConfig &
  ErrorHandling<TSupressedResult>;
