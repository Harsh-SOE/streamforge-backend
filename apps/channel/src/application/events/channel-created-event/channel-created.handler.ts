import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { CHANNEL_EVENTS } from '@app/clients';

import { KafkaMessageBrokerAdapter } from '@channel/infrastructure/message-bus/adapters';

import { ChannelCreatedEvent } from './channel-created.event';

@EventsHandler(ChannelCreatedEvent)
export class ChannelCreatedEventHandler implements IEventHandler<ChannelCreatedEvent> {
  public constructor(private readonly messageBus: KafkaMessageBrokerAdapter) {}

  async handle({ channelCreatedEventDto }: ChannelCreatedEvent) {
    await this.messageBus.publishMessage(
      CHANNEL_EVENTS.CHANNEEL_CREATED,
      JSON.stringify(channelCreatedEventDto),
    );
  }
}
