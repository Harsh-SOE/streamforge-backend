import { v4 as uuidv4 } from 'uuid';

import { IntegrationEvent, PROJECTION_EVENT } from '@app/common/events';

import { PROJECTION_EVENTS } from './event-types';

export interface UserProjectionEventPayload {
  userId: string;
  authId: string;
  email: string;
  handle: string;
  avatar: string;
}

export class UserProjectionEvent implements IntegrationEvent<UserProjectionEventPayload> {
  public readonly eventVersion: number = 1;
  public readonly eventId: string = uuidv4();
  public readonly eventName: string = PROJECTION_EVENT;
  public readonly occurredAt: string = new Date().toISOString();
  public readonly eventType: string = PROJECTION_EVENTS.USER_ONBOARDED_PROJECTION_EVENT;
  public readonly payload: UserProjectionEventPayload;

  public constructor(payload: UserProjectionEventPayload) {
    this.payload = payload;
  }
}
