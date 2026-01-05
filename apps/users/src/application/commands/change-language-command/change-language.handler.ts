import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { UserPreferredLanguageChangedResponse } from '@app/contracts/users';

import { UserNotFoundException } from '@users/application/exceptions';
import { USER_REROSITORY_PORT, UserRepositoryPort } from '@users/application/ports';

import { ChangeLanguageCommand } from './change-language.command';

@CommandHandler(ChangeLanguageCommand)
export class ChangeLanguageCommandHandler implements ICommandHandler<ChangeLanguageCommand> {
  constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    private eventPublisher: EventPublisher,
  ) {}

  async execute({
    userChangePreferredLanguageDto,
  }: ChangeLanguageCommand): Promise<UserPreferredLanguageChangedResponse> {
    const { id, language } = userChangePreferredLanguageDto;

    const foundUserAggregate = await this.userRepository.findOneUserById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    const userAggregateWithEvent = this.eventPublisher.mergeObjectContext(foundUserAggregate);

    userAggregateWithEvent.changeUserPreferredLanguage(language);

    await this.userRepository.updateOneUserById(id, userAggregateWithEvent);

    userAggregateWithEvent.commit();

    return {
      response: 'Language changed successfully',
      language: userAggregateWithEvent.getUserSnapshot().languagePreference,
    };
  }
}
