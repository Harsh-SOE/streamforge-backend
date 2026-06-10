import z from 'zod';

import { InvalidPublishStatusException } from '@videos/domain/exceptions';

import { DomainVideoState } from '../../enums';

export class VideoState {
  private static VideoStateValidationSchema = z.enum(DomainVideoState);

  public constructor(private readonly value: DomainVideoState) {}

  public static create(value?: string) {
    if (!value) {
      return new VideoState(DomainVideoState.DRAFT);
    }
    const parsedVideoState = this.VideoStateValidationSchema.safeParse(value);
    if (!parsedVideoState.success) {
      const errorMessage = parsedVideoState.error.message;
      throw new InvalidPublishStatusException({
        message: `VideoPublishStatus validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoState(parsedVideoState.data);
  }

  public getValue(): DomainVideoState {
    return this.value;
  }
}
