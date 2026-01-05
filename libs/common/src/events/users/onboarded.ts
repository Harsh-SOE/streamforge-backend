import { IntegrationEvent, USERS_EVENTS } from '@app/common/events';

export interface OnboardedIntegrationEventPayload {
  userId: string;
  authId: string;
  email: string;
  handle: string;
}

export class OnboardedIntegrationEvent implements IntegrationEvent<OnboardedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = USERS_EVENTS.USER_ONBOARDED_EVENT;
  public readonly occurredAt: string;
  public readonly payload: OnboardedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occuredAt: string;
    payload: OnboardedIntegrationEventPayload;
  }) {
    const {
      eventId,
      occuredAt,
      payload: { authId, userId, email, handle },
    } = config;

    this.eventId = eventId;
    this.occurredAt = occuredAt;
    this.payload = {
      userId,
      authId,
      email,
      handle,
    };
  }
}
