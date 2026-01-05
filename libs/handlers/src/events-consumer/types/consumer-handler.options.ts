import { IntegrationEvent } from '@app/common/events';

type KafkaConsumerOperations = {
  CONNECT: {
    topic?: never;
    message?: IntegrationEvent<any>;
  };
  DISCONNECT: {
    topic?: never;
    message?: IntegrationEvent<any>;
  };
  SUBSCRIBE: {
    topic: string;
    message?: IntegrationEvent<any>;
  };
  PUBLISH: {
    topic?: string;
    message?: IntegrationEvent<any>;
  };
  CONSUME: {
    topic?: string;
    message?: IntegrationEvent<any>;
  };
};

export type KafkaConsumerOperationOptions = {
  [K in keyof KafkaConsumerOperations]: {
    operationType: K;
  } & KafkaConsumerOperations[K];
}[keyof KafkaConsumerOperations];
