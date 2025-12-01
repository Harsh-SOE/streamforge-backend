import { z } from 'zod';

import { InvalidHandleException } from '@users/domain/exceptions';

export class UserAvatar {
  private static UserAvatarValidationSchema = z.url();

  public constructor(private readonly value: string) {}

  public static create(value: string) {
    const parsedUrlResult =
      UserAvatar.UserAvatarValidationSchema.safeParse(value);
    if (!parsedUrlResult.success) {
      const errorMessage = parsedUrlResult.error.message;
      throw new InvalidHandleException({
        message: `Handle validation failed. Reason: ${errorMessage}`,
      });
    }
    return new UserAvatar(parsedUrlResult.data);
  }

  public getValue() {
    return this.value;
  }
}
