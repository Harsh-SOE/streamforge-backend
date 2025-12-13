import { z } from 'zod';

import { InvalidTitleException } from '@videos/domain/exceptions';

export class VideoTitle {
  private static VideoTitleValidationSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Video title should contain atleast 3 characters')
    .max(35, 'Video title cannot have more than 35 characters');

  public constructor(private readonly value: string) {}

  public static create(value: string) {
    const parsedVideoTitle = VideoTitle.VideoTitleValidationSchema.safeParse(value);
    if (!parsedVideoTitle.success) {
      const errorMessages = parsedVideoTitle.error.message;
      throw new InvalidTitleException({
        message: `Invalid value for VideoTitle. Reason: ${errorMessages}`,
      });
    }
    return new VideoTitle(parsedVideoTitle.data);
  }

  public getValue(): string {
    return this.value;
  }
}
