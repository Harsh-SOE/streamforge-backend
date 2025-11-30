import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommentCreatedEvent } from './comment-created.event';

@EventsHandler(CommentCreatedEvent)
export class CommentCreatedEventHandler implements IEventHandler<CommentCreatedEvent> {
  public handle(event: CommentCreatedEvent) {
    throw new Error('Method not implemented.');
  }
}
