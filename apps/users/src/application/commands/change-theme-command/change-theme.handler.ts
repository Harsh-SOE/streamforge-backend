import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserPreferredThemeChangedResponse } from '@app/contracts/users';

import { UserNotFoundException } from '@users/application/exceptions';
import { USER_REROSITORY_PORT, UserRepositoryPort } from '@users/application/ports';
import { TransportToDomainThemeEnumACL } from '@users/infrastructure/anti-corruption/theme-preference-acl';

import { ChangeThemeCommand } from './change-theme.command';

@CommandHandler(ChangeThemeCommand)
export class ChangeThemeCommandHandler implements ICommandHandler<ChangeThemeCommand> {
  constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute({
    userChangePreferredThemeDto,
  }: ChangeThemeCommand): Promise<UserPreferredThemeChangedResponse> {
    const { id, themePerference } = userChangePreferredThemeDto;

    const foundUserAggregate = await this.userRepository.findOneUserById(id);

    if (!foundUserAggregate) {
      throw new UserNotFoundException({
        message: `User with id:${id} was not found in the database`,
      });
    }

    const domainThemePreference = TransportToDomainThemeEnumACL[themePerference];

    foundUserAggregate.changeUserPreferredTheme(domainThemePreference);

    await this.userRepository.updateOneUserById(id, foundUserAggregate);

    return {
      response: 'Theme was changed successfully',
      theme: foundUserAggregate.getUserSnapshot().themePreference,
    };
  }
}
