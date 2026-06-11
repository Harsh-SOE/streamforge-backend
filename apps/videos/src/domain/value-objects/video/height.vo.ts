import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class VideoFileHeight {
  private static VideoFileHeightValidationSchema = z.number().positive().optional();

  public constructor(private readonly value?: number) {}

  public static create(value?: number) {
    const parsedVideoHeight = this.VideoFileHeightValidationSchema.safeParse(value);
    if (!parsedVideoHeight.success) {
      const errorMessage = parsedVideoHeight.error.message;
      throw new InvalidValueObjectException({
        message: `VideoHeight validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoFileHeight(parsedVideoHeight.data);
  }

  public getValue(): number | undefined {
    return this.value;
  }
}
