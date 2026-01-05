import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/common/events';

export class OnboardedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly userId: string,
    public readonly authId: string,
    public readonly email: string,
    public readonly handle: string,
  ) {}
}
