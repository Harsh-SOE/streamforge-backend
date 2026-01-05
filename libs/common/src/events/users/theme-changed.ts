import { IntegrationEvent, USERS_EVENTS } from '@app/common/events';

export interface ThemeChangedIntegrationEventPayload {
  userId: string;
  theme: string;
}

export class ThemeChangedIntegrationEvent implements IntegrationEvent<ThemeChangedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = USERS_EVENTS.USER_THEME_CHANGED_EVENT;
  public readonly occurredAt: string;
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

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      theme,
    };
  }
}
