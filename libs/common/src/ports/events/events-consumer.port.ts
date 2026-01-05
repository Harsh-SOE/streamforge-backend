import { IntegrationEvent } from '@app/common/events';

export interface EventsConsumerPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  consumeMessage(
    onConsumeMessageHandler: (message: IntegrationEvent<any>) => Promise<void>,
  ): Promise<void>;
}

export const EVENT_CONSUMER_PORT = Symbol('EVENT_CONSUMER_PORT');
