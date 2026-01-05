import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserNotificationStatusChangedResponse } from '@app/contracts/users';

import { UserNotFoundException } from '@users/application/exceptions';
import { USER_REROSITORY_PORT, UserRepositoryPort } from '@users/application/ports';

import { ChangeNotificationCommand } from './change-notification-status.command';

@CommandHandler(ChangeNotificationCommand)
export class ChangeNotificationCommandHandler implements ICommandHandler<ChangeNotificationCommand> {
  constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute({
    userChangeNotificationStatusDto,
  }: ChangeNotificationCommand): Promise<UserNotificationStatusChangedResponse> {
    const { id, notificationStatus } = userChangeNotificationStatusDto;

    const foundUserAggregate = await this.userRepository.findOneUserById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    foundUserAggregate.changeUserNotificationPreference(notificationStatus);

    await this.userRepository.updateOneUserById(id, foundUserAggregate);

    return {
      response: 'notification status changed successfully',
      status: foundUserAggregate.getUserSnapshot().notification,
    };
  }
}
