import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/common/events';

export class ProfileUpdatedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly userId: string,
    public readonly avatar?: string,
    public readonly dob?: string,
    public readonly phoneNumber?: string,
  ) {
    this.eventId = userId;
  }
}
