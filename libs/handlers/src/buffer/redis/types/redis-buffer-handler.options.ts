type RedisBufferOperationsMap = {
  CONNECT: {
    valueToBuffer?: never;
  };
  DISCONNECT: {
    valueToBuffer?: never;
  };
  FLUSH: {
    valueToBuffer?: never;
  };
  SAVE: {
    valueToBuffer: string;
  };
};

export type RedisBufferOperationsOptions = {
  [K in keyof RedisBufferOperationsMap]: {
    operationType: K;
  } & RedisBufferOperationsMap[K];
}[keyof RedisBufferOperationsMap];
