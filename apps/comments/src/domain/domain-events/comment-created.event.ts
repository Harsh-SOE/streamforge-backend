import { v4 as uuidv4 } from 'uuid';

import { DomainEvent } from '@app/common/events';

export class CommentCreatedDomainEvent implements DomainEvent {
  public readonly eventId: string = uuidv4();
  public readonly occurredAt: Date = new Date();

  public constructor(
    public readonly commentId: string,
    public readonly commentedBy: string,
    public readonly commentedOn: string,
    public readonly comment: string,
  ) {}
}
