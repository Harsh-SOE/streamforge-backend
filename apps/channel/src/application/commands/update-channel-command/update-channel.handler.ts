import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ChannelUpdateByIdResponse } from '@app/contracts/protocols/channel';

import { CHANNEL_REPOSITORY, ChannelCommandRepositoryPort } from '@channel/application/ports';

import { UpdateChannelCommand } from './update-channel.command';

@CommandHandler(UpdateChannelCommand)
export class UpdateChannelCommandHandler implements ICommandHandler<UpdateChannelCommand> {
  constructor(
    @Inject(CHANNEL_REPOSITORY)
    private readonly channelCommandRepository: ChannelCommandRepositoryPort,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute({
    channelUpdateByIdDto,
  }: UpdateChannelCommand): Promise<ChannelUpdateByIdResponse> {
    const { id, channelBio, channelCoverImage } = channelUpdateByIdDto;
    const foundChannelAggregate = await this.channelCommandRepository.findOneChannelById(id);

    if (!foundChannelAggregate) {
      throw new Error();
    }

    const channelAggregate = this.eventPublisher.mergeObjectContext(foundChannelAggregate);

    channelAggregate.updateChannelDetails({ bio: channelBio, coverImage: channelCoverImage });

    await this.channelCommandRepository.updateOneChannelByUserId(id, channelAggregate);

    channelAggregate.commit();

    return { response: 'channel updated successfully' };
  }
}
