import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/common/events';

export class PhoneNumberVerifiedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly userId: string,
    public readonly phoneNumber: string,
  ) {
    this.eventId = userId;
  }
}
