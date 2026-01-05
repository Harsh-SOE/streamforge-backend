import { IntegrationEvent } from '@app/common/events';

export interface EventsPublisherPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publishMessage(message: IntegrationEvent<any>): Promise<void>;
}

export const EVENT_PUBLISHER_PORT = Symbol('EVENT_PUBLISHER_PORT');
