import { AGGREGATE_EVENT, IntegrationEvent } from '@app/common/events';

import { USER_INTEGRATION_EVENTS } from './events';

export interface ProfileUpdatedIntegrationEventPayload {
  userId: string;
  avatar?: string;
  dob?: string;
  phoneNumber?: string;
}

export class ProfileUpdatedIntegrationEvent implements IntegrationEvent<ProfileUpdatedIntegrationEventPayload> {
  public readonly eventName: string;
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventType: string =
    USER_INTEGRATION_EVENTS.USER_PROFILE_UPDATED_INTEGRATION_EVENT;
  public readonly occurredAt: string;
  public readonly payload: ProfileUpdatedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: Date;
    payload: ProfileUpdatedIntegrationEventPayload;
  }) {
    const {
      eventId,
      occurredAt,
      payload: { userId, avatar, dob, phoneNumber },
    } = config;

    this.eventName = AGGREGATE_EVENT;
    this.eventId = eventId;
    this.occurredAt = occurredAt.toISOString();
    this.payload = {
      userId,
      avatar,
      dob,
      phoneNumber,
    };
  }
}
