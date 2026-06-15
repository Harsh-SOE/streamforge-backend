import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { CommentCreatedIntegrationEvent } from '@app/contracts/events/comments';
import {
  INTEGRATION_EVENT_PUBLISHER_PORT,
  IntegrationEventsPublisherPort,
} from '@app/common/ports/events';

import { CommentCreatedDomainEvent } from '@comments/domain/domain-events';

@EventsHandler(CommentCreatedDomainEvent)
export class CommentCreatedEventHandler implements IEventHandler<CommentCreatedDomainEvent> {
  public constructor(
    @Inject(INTEGRATION_EVENT_PUBLISHER_PORT)
    private readonly eventPublisher: IntegrationEventsPublisherPort,
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
