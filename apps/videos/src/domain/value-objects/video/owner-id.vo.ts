import z from 'zod';

import { InvalidOwnerIdException } from '@videos/domain/exceptions';

export class VideoOwnerId {
  private static VideoOwnerIdValidationSchema = z.uuid();

  public constructor(private readonly value: string) {}

  public static create(value: string) {
    const parsedVideoOwnerId = this.VideoOwnerIdValidationSchema.safeParse(value);
    if (!parsedVideoOwnerId.success) {
      const errorMessage = parsedVideoOwnerId.error.message;
      throw new InvalidOwnerIdException({
        message: `Video ownerId validation has failed. Reason: ${errorMessage}`,
      });
    }
    return new VideoOwnerId(parsedVideoOwnerId.data);
  }

  public getValue(): string {
    return this.value;
  }
}
