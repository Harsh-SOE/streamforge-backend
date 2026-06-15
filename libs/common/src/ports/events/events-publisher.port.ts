import { IntegrationEvent } from '@app/contracts/events/base';

export interface IntegrationEventsPublisherPort {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  publishMessage(message: IntegrationEvent<any>): Promise<void>;
}

export const INTEGRATION_EVENT_PUBLISHER_PORT = Symbol('INTEGRATION_EVENT_PUBLISHER_PORT');
