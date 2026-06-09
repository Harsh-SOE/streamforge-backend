import { IntegrationEvent, TOPICS } from '../base';
import { USER_EVENT_CAUSES } from './causes';

export interface UserOnboardedIntegrationEventPayload {
  userId: string;
  authId: string;
  email: string;
  handle: string;
  avatar: string;
}

export class UserOnboardedIntegrationEvent implements IntegrationEvent<UserOnboardedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: UserOnboardedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: UserOnboardedIntegrationEventPayload;
  }) {
    const { eventId, occurredAt, payload } = config;

    this.id = eventId;
    this.name = TOPICS.USERS;
    this.producer = 'users-service';
    this.cause = USER_EVENT_CAUSES.USER_ONBOARDED_INTEGRATION_EVENT;
    this.publishedAt = occurredAt;
    this.payload = payload;
  }
}
