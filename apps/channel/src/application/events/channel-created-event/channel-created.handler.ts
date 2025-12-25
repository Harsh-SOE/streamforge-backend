import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { CHANNEL_EVENTS } from '@app/clients';
import { MESSAGE_BROKER } from '@app/ports/message-broker';

import { KafkaMessageBrokerAdapter } from '@channel/infrastructure/message-bus/adapters';

import { ChannelCreatedEvent } from './channel-created.event';

@EventsHandler(ChannelCreatedEvent)
export class ChannelCreatedEventHandler implements IEventHandler<ChannelCreatedEvent> {
  public constructor(
    @Inject(MESSAGE_BROKER) private readonly messageBus: KafkaMessageBrokerAdapter,
  ) {}

  async handle({ channelCreatedEventDto }: ChannelCreatedEvent) {
    await this.messageBus.publishMessage(
      CHANNEL_EVENTS.CHANNEL_CREATED,
      JSON.stringify(channelCreatedEventDto),
    );
  }
}
