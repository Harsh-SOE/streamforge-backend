import { IntegrationEvent, TOPICS } from '../base';

export interface CommentCreatedIntegrationEventPayload {
  commentId: string;
  commentedBy: string;
  commentedOn: string;
  comment: string;
}

export class CommentCreatedIntegrationEvent implements IntegrationEvent<CommentCreatedIntegrationEventPayload> {
  public readonly id: string;
  public readonly name: string;
  public readonly cause: string;
  public readonly producer: string;
  public readonly publishedAt: string;
  public readonly version: number = 1;
  public readonly payload: CommentCreatedIntegrationEventPayload;

  public constructor(
    public readonly config: {
      eventId: string;
      occurredAt: string;
      payload: CommentCreatedIntegrationEventPayload;
    },
  ) {
    const {
      eventId,
      occurredAt,
      payload: { comment, commentId, commentedBy, commentedOn },
    } = config;

    this.id = eventId;
    this.name = TOPICS.INTERACTION;
    this.producer = 'comments-service';
    this.cause = 'COMMENT_CREATED';
    this.publishedAt = occurredAt;
    this.payload = {
      commentId,
      commentedBy,
      comment,
      commentedOn,
    };
  }
}
