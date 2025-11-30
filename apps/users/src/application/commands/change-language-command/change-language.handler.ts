import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { UserPreferredLanguageChangedResponse } from '@app/contracts/users';

import {
  USER_COMMAND_REROSITORY_PORT,
  UserCommandRepositoryPort,
} from '@users/application/ports';
import { UserNotFoundException } from '@users/application/exceptions';

import { ChangeLanguageCommand } from './change-language.command';

@CommandHandler(ChangeLanguageCommand)
export class ChangeLanguageCommandHandler implements ICommandHandler<ChangeLanguageCommand> {
  constructor(
    @Inject(USER_COMMAND_REROSITORY_PORT)
    private readonly userRepository: UserCommandRepositoryPort,
    private eventPublisher: EventPublisher,
  ) {}

  async execute({
    userChangePreferredLanguageDto,
  }: ChangeLanguageCommand): Promise<UserPreferredLanguageChangedResponse> {
    const { id, language } = userChangePreferredLanguageDto;

    const foundUserAggregate = await this.userRepository.findOneById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    const userAggregateWithEvent =
      this.eventPublisher.mergeObjectContext(foundUserAggregate);

    userAggregateWithEvent.changeUserPreferredlanguage(language);

    await this.userRepository.updateOneById(id, userAggregateWithEvent);

    userAggregateWithEvent.commit();

    return {
      response: 'Language changed successfully',
      language: userAggregateWithEvent.getUserSnapshot().languagePreference,
    };
  }
}
