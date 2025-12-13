import z from 'zod';

import { InvalidDescriptionException } from '@videos/domain/exceptions';

export class VideoDescription {
  private static VideoDescriptionValidationSchema = z.string().optional();

  public constructor(private readonly value?: string) {}

  public static create(value: string | undefined) {
    const parsedVideoDescription = this.VideoDescriptionValidationSchema.safeParse(value);
    if (!parsedVideoDescription.success) {
      const errorMessage = parsedVideoDescription.error.message;
      throw new InvalidDescriptionException({
        message: `VideoDescription validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoDescription(parsedVideoDescription.data);
  }

  public getValue(): string | undefined {
    return this.value;
  }
}
