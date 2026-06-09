import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/contracts/events/base';

export class OnboardedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly payload: {
      readonly userId: string;
      readonly authId: string;
      readonly email: string;
      readonly handle: string;
      readonly avatar: string;
    },
  ) {}
}
