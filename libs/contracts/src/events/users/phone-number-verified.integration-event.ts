import { USER_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface PhoneNumberVerifiedIntegrationEventPayload {
  userId: string;
  phoneNumber: string;
}

export class PhoneNumberVerifiedIntegrationEvent implements IntegrationEvent<PhoneNumberVerifiedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: PhoneNumberVerifiedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: PhoneNumberVerifiedIntegrationEventPayload;
  }) {
    const {
      eventId,
      occurredAt,
      payload: { userId, phoneNumber },
    } = config;

    this.id = eventId;
    this.name = TOPICS.USERS;
    this.producer = 'users-service';
    this.cause = USER_EVENT_CAUSES.USER_PHONE_NUMBER_UPDATED_INTEGRATION_EVENT;
    this.publishedAt = occurredAt;
    this.payload = {
      userId,
      phoneNumber,
    };
  }
}
