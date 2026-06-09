import { IntegrationEvent, TOPICS } from '../base';
import { USER_EVENT_CAUSES } from './causes';

export interface NotificationStatusChangedIntegrationEventPayload {
  userId: string;
  status: boolean;
}

export class NotificationStatusChangedIntegrationEvent implements IntegrationEvent<NotificationStatusChangedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
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

    this.id = eventId;
    this.name = TOPICS.USERS;
    this.producer = 'users-service';
    this.cause = USER_EVENT_CAUSES.USER_NOTIFICATION_CHANGED_INTEGRATION_EVENT;
    this.publishedAt = occurredAt;
    this.payload = {
      userId,
      status,
    };
  }
}
