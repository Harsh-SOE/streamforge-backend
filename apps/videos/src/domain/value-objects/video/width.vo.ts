import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class VideoFileWidth {
  private static VideoFileWidthValidationSchema = z.number().positive().optional();

  public constructor(private readonly value?: number) {}

  public static create(value?: number) {
    const parsedVideoWidth = this.VideoFileWidthValidationSchema.safeParse(value);
    if (!parsedVideoWidth.success) {
      const errorMessage = parsedVideoWidth.error.message;
      throw new InvalidValueObjectException({
        message: `VideoWidth validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoFileWidth(parsedVideoWidth.data);
  }

  public getValue(): number | undefined {
    return this.value;
  }
}
