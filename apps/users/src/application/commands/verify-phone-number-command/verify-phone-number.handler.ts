import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserPhoneNumberVerifiedResponse } from '@app/contracts/users';
import {
  USER_COMMAND_REROSITORY_PORT,
  UserCommandRepositoryPort,
} from '@users/application/ports';
import { UserNotFoundException } from '@users/application/exceptions';

import { VerifyPhoneNumberCommand } from './verify-phone-number.command';

@CommandHandler(VerifyPhoneNumberCommand)
export class VerifyPhoneNumberCommandHandler implements ICommandHandler<VerifyPhoneNumberCommand> {
  constructor(
    @Inject(USER_COMMAND_REROSITORY_PORT)
    private readonly userRepository: UserCommandRepositoryPort,
  ) {}

  async execute({
    userVerifyPhoneNumberDto,
  }: VerifyPhoneNumberCommand): Promise<UserPhoneNumberVerifiedResponse> {
    const { id } = userVerifyPhoneNumberDto;

    const foundUserAggregate = await this.userRepository.findOneById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    foundUserAggregate.verifyUserPhoneNumber();

    await this.userRepository.updateOneById(id, foundUserAggregate);

    return { response: "The user's was verified successfully", verified: true };
  }
}
