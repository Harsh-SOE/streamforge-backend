import { v4 as uuidv4 } from 'uuid';
import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { UserProfileCreatedResponse } from '@app/contracts/protocols/users';

import { UserAggregate } from '@users/domain/aggregates';
import { USER_REROSITORY_PORT, UserRepositoryPort } from '@users/application/ports';

import { CreateProfileCommand } from './create-profile.command';

@CommandHandler(CreateProfileCommand)
export class CompleteSignupCommandHandler implements ICommandHandler<CreateProfileCommand> {
  constructor(
    @Inject(USER_REROSITORY_PORT)
    private readonly userRepository: UserRepositoryPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    userCreateProfileDto,
  }: CreateProfileCommand): Promise<UserProfileCreatedResponse> {
    const { authId, email, handle, avatar } = userCreateProfileDto;

    const id = uuidv4();

    const userAggregate = this.eventPublisher.mergeObjectContext(
      UserAggregate.create({
        id: id,
        userAuthId: authId,
        handle: handle,
        email: email,
        avatarUrl: avatar,
      }),
    );

    await this.userRepository.saveOneUser(userAggregate);

    userAggregate.commit();

    // save then publish event: dangerous, use outbox pattern here...

    return {
      response: 'User signup successful',
      userId: userAggregate.getUserSnapshot().id,
    };
  }
}
