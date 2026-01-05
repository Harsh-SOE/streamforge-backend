import { IntegrationEvent } from '@app/common/events';

type KafkaPublisherOperations = {
  CONNECT: {
    topic?: never;
    message?: IntegrationEvent<any>;
  };
  DISCONNECT: {
    topic?: never;
    message?: IntegrationEvent<any>;
  };
  PUBLISH: {
    topic: string;
    message?: IntegrationEvent<any>;
  };
};

export type KafkaPublisherOperationOptions = {
  [K in keyof KafkaPublisherOperations]: {
    operationType: K;
  } & KafkaPublisherOperations[K];
}[keyof KafkaPublisherOperations];
