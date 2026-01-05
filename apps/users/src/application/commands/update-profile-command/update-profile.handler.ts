import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserProfileUpdatedResponse } from '@app/contracts/users';

import { UserNotFoundException } from '@users/application/exceptions';
import { USER_REROSITORY_PORT, UserRepositoryPort } from '@users/application/ports';

import { UpdateProfileCommand } from './update-profile.command';

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileCommandHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute({
    userUpdateProfileDto,
  }: UpdateProfileCommand): Promise<UserProfileUpdatedResponse> {
    const { id, dob, phoneNumber, avatar } = userUpdateProfileDto;

    const foundUserAggregate = await this.userRepository.findOneUserById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    const birthday = dob ? new Date(dob) : undefined;

    foundUserAggregate.updateUserProfile({
      dob: birthday,
      phoneNumber: phoneNumber,
      avatar,
    });

    await this.userRepository.updateOneUserById(id, foundUserAggregate);

    return {
      response: 'User profile updated successfully',
      userId: foundUserAggregate.getUserSnapshot().id,
    };
  }
}
