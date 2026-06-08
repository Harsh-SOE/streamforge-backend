import { AGGREGATE_EVENT, IntegrationEvent } from '@app/common/events';

import { USER_INTEGRATION_EVENTS } from './events';

export interface ThemeChangedIntegrationEventPayload {
  userId: string;
  theme: string;
}

export class ThemeChangedIntegrationEvent implements IntegrationEvent<ThemeChangedIntegrationEventPayload> {
  public readonly eventName: string;
  public readonly eventId: string;
  public readonly eventVersion: number = 1;
  public readonly eventType: string = USER_INTEGRATION_EVENTS.USER_THEME_CHANGED_INTEGRATION_EVENT;
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

    this.eventName = AGGREGATE_EVENT;
    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      theme,
    };
  }
}
