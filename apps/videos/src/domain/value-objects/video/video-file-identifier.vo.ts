import z from 'zod';

import { InvalidVideoFileIndentifierException } from '@videos/domain/exceptions';

export class VideoFileIdentifier {
  private static VideoFileIdentifierValidationSchema = z.string();

  public constructor(private readonly value: string) {}

  public static create(value: string) {
    const parsedVideoFileIdentifier = this.VideoFileIdentifierValidationSchema.safeParse(value);
    if (!parsedVideoFileIdentifier.success) {
      const errorMessage = parsedVideoFileIdentifier.error.message;
      throw new InvalidVideoFileIndentifierException({
        message: `Video fileIdentifier validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoFileIdentifier(parsedVideoFileIdentifier.data);
  }

  public getValue() {
    return this.value;
  }
}
