import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { VideoFoundResponse } from '@app/contracts/videos';

import { VIDEO_QUERY_RESPOSITORY_PORT, VideoQueryRepositoryPort } from '@videos/application/ports';
import {
  QueryToTransportPublishEnumMapper,
  QueryToTransportVisibilityEnumMapper,
} from '@videos/infrastructure/anti-corruption/enums/to-transport';

import { FindVideoQuery } from './find-video.query';

@QueryHandler(FindVideoQuery)
export class FindVideoHandler implements IQueryHandler<FindVideoQuery> {
  constructor(
    @Inject(VIDEO_QUERY_RESPOSITORY_PORT)
    private readonly video: VideoQueryRepositoryPort,
  ) {}

  async execute({ videoFindDto }: FindVideoQuery): Promise<VideoFoundResponse> {
    const { id } = videoFindDto;
    const video = await this.video.findOneByid(id);

    const videoPublishStatusForGrpc = QueryToTransportPublishEnumMapper.get(
      video.videoProps.videoPublishStatus,
    );
    const videoVisibilityStatusForGrpc = QueryToTransportVisibilityEnumMapper.get(
      video.videoProps.videoVisibilityStatus,
    );

    if (!videoPublishStatusForGrpc || !videoVisibilityStatusForGrpc) {
      throw new Error();
    }

    return {
      ...video.videoProps,
      videoTransportPublishStatus: videoPublishStatusForGrpc,
      videoTransportVisibilityStatus: videoVisibilityStatusForGrpc,
    };
  }
}
