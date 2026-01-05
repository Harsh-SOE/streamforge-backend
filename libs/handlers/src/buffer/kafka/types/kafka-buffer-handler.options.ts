type KafkaBufferOperationsMap = {
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

export type KafkaBufferOperationsOptions = {
  [K in keyof KafkaBufferOperationsMap]: {
    operationType: K;
  } & KafkaBufferOperationsMap[K];
}[keyof KafkaBufferOperationsMap];
