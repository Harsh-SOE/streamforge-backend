import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CHANNEL_QUERY_REPOSITORY_PORT, ChannelQueryRepositoryPort } from '@read/application/ports';

import { GetChannelResponse } from '@app/contracts/protocols/read';

import { GetChannelFromIdQuery } from './get-channel-from-id.query';

@QueryHandler(GetChannelFromIdQuery)
export class GetChannelFromIdHandler implements IQueryHandler<GetChannelFromIdQuery> {
  constructor(
    @Inject(CHANNEL_QUERY_REPOSITORY_PORT)
    private readonly channelQueryRepository: ChannelQueryRepositoryPort,
  ) {}

  async execute({ getChannelFromIdDto }: GetChannelFromIdQuery): Promise<GetChannelResponse> {
    const channel = await this.channelQueryRepository.getChannelFromId(
      getChannelFromIdDto.channelId,
    );
    return {
      found: channel ? true : false,
      channel: channel ?? undefined,
    };
  }
}
