import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetChannelResponse } from '@app/contracts/query';

import {
  CHANNEL_QUERY_REPOSITORY_PORT,
  ChannelQueryRepositoryPort,
} from '@query/application/ports';

import { GetChannelFromUserIdQuery } from './get-channel-from-userid.query';

@QueryHandler(GetChannelFromUserIdQuery)
export class GetChannelFromUserIdHandler implements IQueryHandler<GetChannelFromUserIdQuery> {
  constructor(
    @Inject(CHANNEL_QUERY_REPOSITORY_PORT)
    private readonly channelQueryRepository: ChannelQueryRepositoryPort,
  ) {}

  async execute({
    getChannelFromUserIdDto,
  }: GetChannelFromUserIdQuery): Promise<GetChannelResponse> {
    const channel = await this.channelQueryRepository.getChannelFromId(
      getChannelFromUserIdDto.userId,
    );
    return {
      found: channel ? true : false,
      channel: channel ?? undefined,
    };
  }
}
