import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ChannelVerifyByIdResponse } from '@app/contracts/channel';

import {
  CHANNEL_COMMAND_REPOSITORY,
  ChannelCommandRepositoryPort,
} from '@channel/application/ports';

import { VerifyChannelCommand } from './verify-channel.command';

@CommandHandler(VerifyChannelCommand)
export class VerifyChannelHandler implements ICommandHandler<VerifyChannelCommand> {
  public constructor(
    @Inject(CHANNEL_COMMAND_REPOSITORY)
    private readonly channelRepository: ChannelCommandRepositoryPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    verifyChannelDto,
  }: VerifyChannelCommand): Promise<ChannelVerifyByIdResponse> {
    const { id } = verifyChannelDto;

    const channelAggregate = await this.channelRepository.findOneById(id);

    if (!channelAggregate) {
      throw new Error();
    }
    const channelAggregateWithEvents =
      this.eventPublisher.mergeObjectContext(channelAggregate);

    channelAggregateWithEvents.updateChannelVerificationStatus();

    await this.channelRepository.updateOneById(id, channelAggregateWithEvents);

    channelAggregateWithEvents.commit();

    return { response: 'channel was verified' };
  }
}
