import { IntegrationEvent, USERS_EVENTS } from '@app/common/events';

export interface NotificationStatusChangedIntegrationEventPayload {
  userId: string;
  status: boolean;
}

export class NotificationStatusChangedIntegrationEvent implements IntegrationEvent<NotificationStatusChangedIntegrationEventPayload> {
  public readonly eventId: string;
  public readonly occurredAt: string;
  public readonly eventVersion: number = 1;
  public readonly eventName: string = USERS_EVENTS.USER_NOTIFICATION_CHANGED_EVENT;
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

    this.eventId = eventId;
    this.occurredAt = occurredAt;
    this.payload = {
      userId,
      status,
    };
  }
}
