import { AGGREGATE_EVENT, IntegrationEvent } from '@app/common/events';

import { USER_INTEGRATION_EVENTS } from './events';

export interface LanguageChangedIntegrationEventPayload {
  userId: string;
  language: string;
}

export class LanguageChangedIntergrationEvent implements IntegrationEvent<LanguageChangedIntegrationEventPayload> {
  public readonly eventName: string;
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventType: string =
    USER_INTEGRATION_EVENTS.USER_LANGUAGE_CHANGED_INTEGRATION_EVENT;
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
    this.eventName = AGGREGATE_EVENT;
    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      language,
    };
  }
}
