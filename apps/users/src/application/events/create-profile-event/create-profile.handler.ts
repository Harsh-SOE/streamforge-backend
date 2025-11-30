import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { USERS } from '@app/clients';
import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { MESSAGE_BROKER, MessageBrokerPort } from '@app/ports/message-broker';

import { CreateProfileEvent } from './create-profile.event';

@EventsHandler(CreateProfileEvent)
export class CompleteProfileEventHandler implements IEventHandler<CreateProfileEvent> {
  constructor(
    @Inject(MESSAGE_BROKER) private readonly messageBroker: MessageBrokerPort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  async handle({ user }: CreateProfileEvent) {
    const userPayload = user.getUserSnapshot();
    const { id, handle, email } = userPayload;

    const sendMailPayload = {
      email,
      handle,
      id,
    };

    await this.messageBroker.publishMessage(
      USERS.USER_ONBOARDED_EVENT,
      JSON.stringify(sendMailPayload),
    );

    this.logger.info(
      `User with email:${email}, created a profile: ${JSON.stringify(user)}`,
    );
  }
}
