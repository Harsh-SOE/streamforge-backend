import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserProfileUpdatedResponse } from '@app/contracts/users';

import {
  USER_COMMAND_REROSITORY_PORT,
  UserCommandRepositoryPort,
} from '@users/application/ports';
import { UserNotFoundException } from '@users/application/exceptions';

import { UpdateProfileCommand } from './update-profile.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileCommandHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @Inject(USER_COMMAND_REROSITORY_PORT)
    private readonly userRepository: UserCommandRepositoryPort,
  ) {}

  async execute({
    userUpdateProfileDto,
  }: UpdateProfileCommand): Promise<UserProfileUpdatedResponse> {
    const { id, dob, phoneNumber } = userUpdateProfileDto;

    const foundUserAggregate = await this.userRepository.findOneById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    const birthday = dob ? new Date(dob) : undefined;

    foundUserAggregate.updateUserProfile(birthday, phoneNumber);

    await this.userRepository.updateOneById(id, foundUserAggregate);

    return {
      response: 'User profile updated successfully',
      userId: foundUserAggregate.getUserSnapshot().id,
    };
  }
}
