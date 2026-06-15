import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class VideoFileSizeBytes {
  private static VideoFileSizeBytesValidationSchema = z.bigint().positive().optional();

  public constructor(private readonly value?: bigint) {}

  public static create(value?: bigint) {
    const parsedVideoHeight = this.VideoFileSizeBytesValidationSchema.safeParse(value);
    if (!parsedVideoHeight.success) {
      const errorMessage = parsedVideoHeight.error.message;
      throw new InvalidValueObjectException({
        message: `VideoFileSize validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoFileSizeBytes(parsedVideoHeight.data);
  }

  public getValue(): bigint | undefined {
    return this.value;
  }
}
