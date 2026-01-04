import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { CommentCreatedIntegrationEvent } from '@app/common/events/comments';
import { EVENT_PUBLISHER_PORT, EventsPublisherPort } from '@app/common/ports/events';

import { CommentCreatedDomainEvent } from '@comments/domain/domain-events';

@EventsHandler(CommentCreatedDomainEvent)
export class CommentCreatedEventHandler implements IEventHandler<CommentCreatedDomainEvent> {
  public constructor(
    @Inject(EVENT_PUBLISHER_PORT) private readonly eventPublisher: EventsPublisherPort,
  ) {}

  public async handle(commentCreatedDomainEvent: CommentCreatedDomainEvent) {
    const commentCreatedIntegrationEvent = new CommentCreatedIntegrationEvent({
      eventId: commentCreatedDomainEvent.eventId,
      occurredAt: commentCreatedDomainEvent.occurredAt.toISOString(),
      payload: {
        commentId: commentCreatedDomainEvent.commentId,
        commentedBy: commentCreatedDomainEvent.commentedBy,
        commentedOn: commentCreatedDomainEvent.commentedOn,
        comment: commentCreatedDomainEvent.comment,
      },
    });

    await this.eventPublisher.publishMessage(commentCreatedIntegrationEvent);
  }
}
