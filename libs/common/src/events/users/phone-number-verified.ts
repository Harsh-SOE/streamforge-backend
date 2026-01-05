import { IntegrationEvent, USERS_EVENTS } from '@app/common/events';

export interface PhoneNumberVerifiedIntegrationEventPayload {
  userId: string;
  phoneNumber: string;
}

export class PhoneNumberVerifiedIntegrationEvent implements IntegrationEvent<PhoneNumberVerifiedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = USERS_EVENTS.USER_PHONE_NUMBER_UPDATED_EVENT;
  public readonly occurredAt: string;
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

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      phoneNumber,
    };
  }
}
