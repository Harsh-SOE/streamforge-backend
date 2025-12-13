import { z } from 'zod';

import { InvalidReactionStatusException } from '@reaction/domain/exceptions';

import { ReactionDomainStatus } from '../../enums';

export class ReactionStatus {
  private static ReactionStatusValidationSchema = z.enum(ReactionDomainStatus);

  public constructor(private readonly value: ReactionDomainStatus) {}

  public static create(value: string): ReactionStatus {
    const parsedReactionStatus = this.ReactionStatusValidationSchema.safeParse(value);
    if (!parsedReactionStatus.success) {
      throw new InvalidReactionStatusException({
        message: `An error occured while validating the ReactionStatus: ${value}`,
        meta: parsedReactionStatus.error,
      });
    }
    return new ReactionStatus(parsedReactionStatus.data);
  }

  public getValue(): ReactionDomainStatus {
    return this.value;
  }
}
