import { IntegrationEvent, TOPICS } from '../base';
import { USER_EVENT_CAUSES } from './causes';

export interface LanguageChangedIntegrationEventPayload {
  userId: string;
  language: string;
}

export class LanguageChangedIntergrationEvent implements IntegrationEvent<LanguageChangedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
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

    this.id = eventId;
    this.name = TOPICS.USERS;
    this.producer = 'users-service';
    this.cause = USER_EVENT_CAUSES.USER_LANGUAGE_CHANGED_INTEGRATION_EVENT;
    this.publishedAt = occurredAt;
    this.payload = {
      userId,
      language,
    };
  }
}
