import { z } from 'zod';

import { InvalidValueObjectException } from '@videos/domain/exceptions';

import { DomainVideoVisibiltyState } from '../../enums';

export class VideoVisibilty {
  private static VideoVisibilityStatusValidationSchema = z.enum(DomainVideoVisibiltyState);

  public constructor(private readonly value: DomainVideoVisibiltyState) {}

  public static create(value?: string): VideoVisibilty {
    if (!value) {
      return new VideoVisibilty(DomainVideoVisibiltyState.PRIVATE);
    }
    const parsedVisibilityState = this.VideoVisibilityStatusValidationSchema.safeParse(value);
    if (!parsedVisibilityState.success) {
      const errorMessage = parsedVisibilityState.error.message;
      throw new InvalidValueObjectException({
        message: `VideoVisibilityStatus validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoVisibilty(parsedVisibilityState.data);
  }

  public getValue(): DomainVideoVisibiltyState {
    return this.value;
  }
}
