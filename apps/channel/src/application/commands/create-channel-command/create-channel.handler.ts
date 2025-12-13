import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';

import { ChannelCreatedResponse } from '@app/contracts/channel';

import { ChannelAggregate } from '@channel/domain/aggregates';
import {
  CHANNEL_COMMAND_REPOSITORY,
  ChannelCommandRepositoryPort,
} from '@channel/application/ports';

import { CreateChannelCommand } from './create-channel.command';

@CommandHandler(CreateChannelCommand)
export class CreateChannelCommandHandler implements ICommandHandler<CreateChannelCommand> {
  public constructor(
    @Inject(CHANNEL_COMMAND_REPOSITORY)
    private readonly channelCommandRepository: ChannelCommandRepositoryPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({ channelCreateDto }: CreateChannelCommand): Promise<ChannelCreatedResponse> {
    const { userId, channelBio, isChannelMonitized, channelCoverImage, isChannelVerified } =
      channelCreateDto;

    const id = uuidv4();

    const channelAggregate = this.eventPublisher.mergeObjectContext(
      ChannelAggregate.create(
        id,
        userId,
        channelBio,
        channelCoverImage,
        isChannelVerified,
        isChannelMonitized,
      ),
    );

    await this.channelCommandRepository.save(channelAggregate);

    channelAggregate.commit();

    return { channelId: id, response: `Channel created successfully` };
  }
}
