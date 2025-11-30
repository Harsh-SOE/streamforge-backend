import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ChannelFoundResponse } from '@app/contracts/channel';

import {
  CHANNEL_QUERY_REPOSITORY,
  ChannelQueryRepositoryPort,
} from '@channel/application/ports';

import { FindChannelByIdQuery } from './find-channel-by-id.query';

@QueryHandler(FindChannelByIdQuery)
export class FindChannelByIdQueryHandler implements IQueryHandler<FindChannelByIdQuery> {
  public constructor(
    @Inject(CHANNEL_QUERY_REPOSITORY)
    private readonly channelRespository: ChannelQueryRepositoryPort,
  ) {}

  async execute({
    findChannelById: findChannelById,
  }: FindChannelByIdQuery): Promise<ChannelFoundResponse> {
    const { id } = findChannelById;
    const channel = await this.channelRespository.findById(id);

    return {
      channel: channel
        ? {
            ...channel,
            bio: channel.bio ?? undefined,
            channelCoverImage: channel.ChannelCoverImage ?? undefined,
            isChannelMonitized: channel.isChannelMonitized ?? undefined,
            isChannelVerified: channel.isChannelVerified ?? undefined,
          }
        : undefined,
    };
  }
}
