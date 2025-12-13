import z from 'zod';

import { InvalidVideoThumbnailIndentifierException } from '@videos/domain/exceptions';

export class VideoThumbnailFileIdentifier {
  private static VideoThumbnailIdentifierValidationSchema = z.string();

  public constructor(private readonly value: string) {}

  public static create(value: string) {
    const parsedVideoThumbnailIdentifier =
      this.VideoThumbnailIdentifierValidationSchema.safeParse(value);
    if (!parsedVideoThumbnailIdentifier.success) {
      const errorMessage = parsedVideoThumbnailIdentifier.error.message;
      throw new InvalidVideoThumbnailIndentifierException({
        message: `Video thumbnailIdentifier validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoThumbnailFileIdentifier(parsedVideoThumbnailIdentifier.data);
  }

  public getValue() {
    return this.value;
  }
}
