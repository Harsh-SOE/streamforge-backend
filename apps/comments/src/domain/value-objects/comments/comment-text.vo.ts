import { string } from 'zod';

import { InvalidCommentTextException } from '@comments/domain/exceptions';

export class CommentText {
  private static CommentTextValidationSchema = string();

  public constructor(private value: string) {}

  public static create(value: string) {
    const parsedCommentValue = CommentText.CommentTextValidationSchema.safeParse(value);

    if (!parsedCommentValue.success) {
      const message = parsedCommentValue.error.message;
      throw new InvalidCommentTextException({
        message: `Comment text has failed validation. Reason: ${message}`,
      });
    }
    return new CommentText(parsedCommentValue.data);
  }

  public getValue(): string {
    return this.value;
  }
}
