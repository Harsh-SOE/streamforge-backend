import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class VideoFileMimetype {
  private static VideoFileMimetypeValidationSchema = z.string().optional();

  public constructor(private readonly value?: string) {}

  public static create(value?: string) {
    const parsedVideoMimetype = this.VideoFileMimetypeValidationSchema.safeParse(value);
    if (!parsedVideoMimetype.success) {
      const errorMessage = parsedVideoMimetype.error.message;
      throw new InvalidValueObjectException({
        message: `VideoFileMimetype validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoFileMimetype(parsedVideoMimetype.data);
  }

  public getValue(): string | undefined {
    return this.value;
  }
}
