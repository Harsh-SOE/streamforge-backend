import { z } from 'zod';

export class VideoId {
  private static VideoIdValidationSchema = z.uuid();

  public constructor(private value: string) {}

  public static create(value: string): VideoId {
    const parsedVideoId = this.VideoIdValidationSchema.safeParse(value);
    if (!parsedVideoId.success) {
      const errorMessage = parsedVideoId.error.message;
      throw new Error(`An error occured while validating the videoId. Reason: ${errorMessage}`);
    }
    return new VideoId(parsedVideoId.data);
  }

  public getValue(): string {
    return this.value;
  }
}
