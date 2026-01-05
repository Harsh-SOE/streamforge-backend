import { IntegrationEvent, USERS_EVENTS } from '@app/common/events';

export interface ProfileUpdatedIntegrationEventPayload {
  userId: string;
  avatar?: string;
  dob?: string;
  phoneNumber?: string;
}

export class ProfileUpdatedIntegrationEvent implements IntegrationEvent<ProfileUpdatedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = USERS_EVENTS.USER_PROFILE_UPDATED_EVENT;
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
