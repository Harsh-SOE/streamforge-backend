import { z } from 'zod';

import { InvalidVisibilityStatusException } from '@videos/domain/exceptions';

import { VideoDomainVisibiltyStatus } from '../../enums';

export class VideoVisibilty {
  private static VideoVisibilityStatusValidationSchema = z.enum(VideoDomainVisibiltyStatus);

  public constructor(private readonly value: VideoDomainVisibiltyStatus) {}

  public static create(value: string): VideoVisibilty {
    const parsedVideoVisibilityStatus = this.VideoVisibilityStatusValidationSchema.safeParse(value);
    if (!parsedVideoVisibilityStatus.success) {
      const errorMessage = parsedVideoVisibilityStatus.error.message;
      throw new InvalidVisibilityStatusException({
        message: `VideoVisibilityStatus validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoVisibilty(parsedVideoVisibilityStatus.data);
  }

  public getValue(): VideoDomainVisibiltyStatus {
    return this.value;
  }
}
