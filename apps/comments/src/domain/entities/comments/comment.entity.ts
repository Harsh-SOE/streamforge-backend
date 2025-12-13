import { v4 as uuidv4 } from 'uuid';

import { CommentText, UserId, VideoId } from '../../value-objects';

export class CommentEntity {
  public constructor(
    private readonly id: string,
    private readonly userId: UserId,
    private readonly videoId: VideoId,
    private commentText: CommentText,
  ) {}

  public static create(userId: string, videoId: string, commentText: string): CommentEntity {
    return new CommentEntity(
      uuidv4(),
      UserId.create(userId),
      VideoId.create(videoId),
      CommentText.create(commentText),
    );
  }

  public getId(): string {
    return this.id;
  }

  public getUserId(): string {
    return this.userId.getValue();
  }

  public getVideoId(): string {
    return this.videoId.getValue();
  }

  public getCommentText(): string {
    return this.commentText.getValue();
  }

  public getSnapshot() {
    return {
      userId: this.userId,
      videoId: this.videoId,
      commentText: this.commentText,
    };
  }

  public updateCommentText(newComment: string): CommentText {
    return CommentText.create(newComment);
  }
}
