import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserPhoneNumberVerifiedResponse } from '@app/contracts/users';

import { UserNotFoundException } from '@users/application/exceptions';
import { USER_REROSITORY_PORT, UserRepositoryPort } from '@users/application/ports';

import { VerifyPhoneNumberCommand } from './verify-phone-number.command';

@CommandHandler(VerifyPhoneNumberCommand)
export class VerifyPhoneNumberCommandHandler implements ICommandHandler<VerifyPhoneNumberCommand> {
  constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute({
    userVerifyPhoneNumberDto,
  }: VerifyPhoneNumberCommand): Promise<UserPhoneNumberVerifiedResponse> {
    const { id } = userVerifyPhoneNumberDto;

    const foundUserAggregate = await this.userRepository.findOneUserById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    foundUserAggregate.verifyUserPhoneNumber();

    await this.userRepository.updateOneUserById(id, foundUserAggregate);

    return { response: "The user's was verified successfully", verified: true };
  }
}
