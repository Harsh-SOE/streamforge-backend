import { IntegrationEvent, USERS_EVENTS } from '@app/common/events';

export interface LanguageChangedIntegrationEventPayload {
  userId: string;
  language: string;
}

export class LanguageChangedIntergrationEvent implements IntegrationEvent<LanguageChangedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = USERS_EVENTS.USER_LANGUAGE_CHANGED_EVENT;
  public readonly payload: LanguageChangedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: LanguageChangedIntegrationEventPayload;
  }) {
    const {
      eventId,
      occurredAt,
      payload: { userId, language },
    } = config;

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      language,
    };
  }
}
