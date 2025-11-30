import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserNotificationStatusChangedResponse } from '@app/contracts/users';

import {
  USER_COMMAND_REROSITORY_PORT,
  UserCommandRepositoryPort,
} from '@users/application/ports';
import { UserNotFoundException } from '@users/application/exceptions';

import { ChangeNotificationCommand } from './change-notification-status.command';

@CommandHandler(ChangeNotificationCommand)
export class ChangeNotificationCommandHandler implements ICommandHandler<ChangeNotificationCommand> {
  constructor(
    @Inject(USER_COMMAND_REROSITORY_PORT)
    private readonly userRepository: UserCommandRepositoryPort,
  ) {}

  async execute({
    userChangeNotificationStatusDto,
  }: ChangeNotificationCommand): Promise<UserNotificationStatusChangedResponse> {
    const { id, notificationStatus } = userChangeNotificationStatusDto;

    const foundUserAggregate = await this.userRepository.findOneById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    foundUserAggregate.changeUserNotificationPreference(notificationStatus);

    await this.userRepository.updateOneById(id, foundUserAggregate);

    return {
      response: 'notification status changed successfully',
      status: foundUserAggregate.getUserSnapshot().notification,
    };
  }
}
