import { z } from 'zod';
import { Injectable } from '@nestjs/common';

import { InvalidBioException } from '@channel/domain/exceptions';

@Injectable()
export class ChannelBio {
  private static channelValidationSchema = z.string().optional();

  public constructor(private value?: string) {}

  public static create(value?: string) {
    const parsedChannelBio = ChannelBio.channelValidationSchema.safeParse(value);

    if (!parsedChannelBio.success) {
      const errorMessage = parsedChannelBio.error.message;
      throw new InvalidBioException({
        message: `Channel's Bio validation failed. Reason: ${errorMessage}`,
      });
    }
    return new ChannelBio(parsedChannelBio.data);
  }

  public getValue() {
    return this.value;
  }
}
