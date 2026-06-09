import { USER_EVENT_CAUSES } from './causes';
import { IntegrationEvent, TOPICS } from '../base';

export interface ThemeChangedIntegrationEventPayload {
  userId: string;
  theme: string;
}

export class ThemeChangedIntegrationEvent implements IntegrationEvent<ThemeChangedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: ThemeChangedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: ThemeChangedIntegrationEventPayload;
  }) {
    const {
      eventId,
      occurredAt,
      payload: { userId, theme },
    } = config;

    this.id = eventId;
    this.name = TOPICS.USERS;
    this.producer = 'users-service';
    this.cause = USER_EVENT_CAUSES.USER_THEME_CHANGED_INTEGRATION_EVENT;
    this.publishedAt = occurredAt;
    this.payload = {
      userId,
      theme,
    };
  }
}
