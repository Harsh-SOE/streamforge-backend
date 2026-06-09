import { IntegrationEvent, TOPICS } from '../base';
import { USER_EVENT_CAUSES } from './causes';

export interface ProfileUpdatedIntegrationEventPayload {
  userId: string;
  avatar?: string;
  dob?: string;
  phoneNumber?: string;
}

export class ProfileUpdatedIntegrationEvent implements IntegrationEvent<ProfileUpdatedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
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

    this.id = eventId;
    this.name = TOPICS.USERS;
    this.producer = 'users-service';
    this.cause = USER_EVENT_CAUSES.USER_PROFILE_UPDATED_INTEGRATION_EVENT;
    this.publishedAt = occurredAt.toISOString();
    this.payload = {
      userId,
      avatar,
      dob,
      phoneNumber,
    };
  }
}
