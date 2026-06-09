import { IntegrationEvent } from '@app/contracts/events/base';

export interface EventsPublisherPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publishMessage(message: IntegrationEvent<any>): Promise<void>;
}

export const EVENT_PUBLISHER_PORT = Symbol('EVENT_PUBLISHER_PORT');
