export type DatabaseOperations = {
  CONNECT_OR_DISCONNECT: {
    entity?: never;
    filter?: never;
  };

  CREATE: {
    entity: Record<string, any> | Record<string, any>[];
    filter?: never;
  };

  READ: {
    entity?: never;
    filter: Record<string, any>;
  };

  UPDATE: {
    entity: Record<string, any>;
    filter: Record<string, any>;
  };

  DELETE: {
    entity?: never;
    filter: Record<string, any>;
  };
};

export type Options = {
  [K in keyof DatabaseOperations]: {
    operationType: K;
  } & DatabaseOperations[K];
}[keyof DatabaseOperations];
