type RedisCacheOperations = {
  CONNECT_OR_DISCONNECT: {
    keys?: never;
    key?: never;
    values?: never;
    value?: never;
  };
  READ: {
    keys?: never;
    key: string;
    values?: never;
    value?: never;
  };
  READ_MANY: {
    keys: string[];
    key?: never;
    value?: never;
    values?: never;
  };
  DELETE: {
    key: string;
    keys?: never;
    value?: never;
    values?: never;
  };
  WRITE: {
    keys?: never;
    key: string;
    values?: never;
    value: string;
  };
  WRITE_MANY: {
    keys: string[];
    key?: never;
    values: string[] | string;
    value?: never;
  };
};

export type RedisCacheOperationsOptions = {
  [K in keyof RedisCacheOperations]: {
    operationType: K;
  } & RedisCacheOperations[K];
}[keyof RedisCacheOperations];
