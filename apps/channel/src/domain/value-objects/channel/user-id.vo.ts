import { InvalidUserIdException } from '@channel/domain/exceptions';
import { Injectable } from '@nestjs/common';
import z from 'zod';

@Injectable()
export class ChannelUserId {
  private static channelUserIdValidationSchema = z.uuid();

  public constructor(private value: string) {}

  public static create(value: string) {
    const parsedChannelUserId = ChannelUserId.channelUserIdValidationSchema.safeParse(value);
    if (!parsedChannelUserId.success) {
      const errorMessage = parsedChannelUserId.error.message;
      throw new InvalidUserIdException({
        message: `Channel's UserId validation failed. Reason: ${errorMessage}`,
      });
    }
    return new ChannelUserId(parsedChannelUserId.data);
  }

  public getValue() {
    return this.value;
  }
}
