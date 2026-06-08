import { AGGREGATE_EVENT, IntegrationEvent } from '@app/common/events';

import { USER_INTEGRATION_EVENTS } from './events';

export interface NotificationStatusChangedIntegrationEventPayload {
  userId: string;
  status: boolean;
}

export class NotificationStatusChangedIntegrationEvent implements IntegrationEvent<NotificationStatusChangedIntegrationEventPayload> {
  public readonly eventName: string;
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventType: string =
    USER_INTEGRATION_EVENTS.USER_NOTIFICATION_CHANGED_INTEGRATION_EVENT;
  public readonly payload: NotificationStatusChangedIntegrationEventPayload;

  public constructor(config: {
    eventId: string;
    occurredAt: string;
    payload: NotificationStatusChangedIntegrationEventPayload;
  }) {
    const {
      eventId,
      occurredAt,
      payload: { userId, status },
    } = config;

    this.eventName = AGGREGATE_EVENT;
    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      status,
    };
  }
}
