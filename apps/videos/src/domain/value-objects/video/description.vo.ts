import z from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

export class VideoDescription {
  private static VideoDescriptionValidationSchema = z.string().optional();

  public constructor(private readonly value?: string) {}

  public static create(value?: string) {
    const parsedVideoDescription = this.VideoDescriptionValidationSchema.safeParse(value);
    if (!parsedVideoDescription.success) {
      const errorMessage = parsedVideoDescription.error.message;
      throw new InvalidValueObjectException({
        message: `VideoDescription validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoDescription(parsedVideoDescription.data);
  }

  public getValue(): string | undefined {
    return this.value;
  }
}
