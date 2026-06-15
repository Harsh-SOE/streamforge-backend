import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class VideoFileDurationInSeconds {
  private static VideoFileDurationInSeconds = z.number().positive().optional();

  public constructor(private readonly value?: number) {}

  public static create(value?: number) {
    const parsedVideoDurationSeconds = this.VideoFileDurationInSeconds.safeParse(value);
    if (!parsedVideoDurationSeconds.success) {
      const errorMessage = parsedVideoDurationSeconds.error.message;
      throw new InvalidValueObjectException({
        message: `VideoDescription validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoFileDurationInSeconds(parsedVideoDurationSeconds.data);
  }

  public getValue(): number | undefined {
    return this.value;
  }
}
