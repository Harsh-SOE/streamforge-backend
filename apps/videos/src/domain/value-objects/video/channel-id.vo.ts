import z from 'zod';

import { InvalidChannelIdException } from '@videos/domain/exceptions';

export class VideoChannelId {
  private static VideoChannelIdValidationSchema = z.uuid();

  public constructor(private readonly value: string) {}

  public static create(value: string) {
    const parsedVideoChannelId = this.VideoChannelIdValidationSchema.safeParse(value);
    if (!parsedVideoChannelId.success) {
      const errorMessage = parsedVideoChannelId.error.message;
      throw new InvalidChannelIdException({
        message: `Video channelId validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoChannelId(parsedVideoChannelId.data);
  }

  public getValue(): string {
    return this.value;
  }
}
