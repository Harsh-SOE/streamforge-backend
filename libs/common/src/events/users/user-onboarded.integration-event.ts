import { AGGREGATE_EVENT, IntegrationEvent } from '@app/common/events';

import { USER_INTEGRATION_EVENTS } from './events';

export interface UserOnboardedIntegrationEventPayload {
  userId: string;
  authId: string;
  email: string;
  handle: string;
  avatar: string;
}

export class UserOnboardedIntegrationEvent implements IntegrationEvent<UserOnboardedIntegrationEventPayload> {
  public readonly eventName: string;
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventType: string = USER_INTEGRATION_EVENTS.USER_ONBOARDED_INTEGRATION_EVENT;
  public readonly occurredAt: string;
  public readonly payload: UserOnboardedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occuredAt: string;
    payload: UserOnboardedIntegrationEventPayload;
  }) {
    const { eventId, occuredAt, payload } = config;

    this.eventName = AGGREGATE_EVENT;
    this.eventId = eventId;
    this.occurredAt = occuredAt;
    this.payload = payload;
  }
}
