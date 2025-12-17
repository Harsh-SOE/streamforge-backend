import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { CHANNEL_PROJECTION_REPOSITORY_PORT } from '@projection/application/ports';
import { ChannelCardRepository } from '@projection/infrastructure/repository/adapters';

import { ChannelCreatedEvent } from './channel-created.event';

@EventsHandler(ChannelCreatedEvent)
export class ChannelCreatedProjectionHandler implements IEventHandler<ChannelCreatedEvent> {
  constructor(
    @Inject(CHANNEL_PROJECTION_REPOSITORY_PORT)
    private readonly channelCardRepo: ChannelCardRepository,
  ) {}

  async handle({ channelCreatedEventDto }: ChannelCreatedEvent) {
    await this.channelCardRepo.saveChannel(channelCreatedEventDto);
  }
}
