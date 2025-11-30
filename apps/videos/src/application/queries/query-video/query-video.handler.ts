import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { VideosFoundResponse } from '@app/contracts/videos';

import {
  VIDEO_QUERY_RESPOSITORY_PORT,
  VideoQueryRepositoryPort,
} from '@videos/application/ports';
import {
  QueryToTransportPublishEnumMapper,
  QueryToTransportVisibilityEnumMapper,
} from '@videos/infrastructure/anti-corruption/enums/to-transport';

import { QueryVideo } from './query-video.query';

@QueryHandler(QueryVideo)
export class QueryVideoHandler implements IQueryHandler<QueryVideo> {
  constructor(
    @Inject(VIDEO_QUERY_RESPOSITORY_PORT)
    private readonly video: VideoQueryRepositoryPort,
  ) {}

  async execute({ videoFindDto }: QueryVideo): Promise<VideosFoundResponse> {
    const { categories, limit, skip } = videoFindDto;
    const videos = await this.video.QueryVideos(
      {
        and: [{ field: 'categories', operator: 'eq', value: categories }],
      },
      { limit, skip },
    );

    videos.map((video) => {
      const videoPublishStatusForGrpc = QueryToTransportPublishEnumMapper.get(
        video.videoProps.videoPublishStatus,
      );
      const videoVisibilityStatusForGrpc =
        QueryToTransportVisibilityEnumMapper.get(
          video.videoProps.videoVisibilityStatus,
        );

      if (!videoPublishStatusForGrpc || !videoVisibilityStatusForGrpc) {
        throw new Error();
      }
      return {
        ...video,
        videoPublishStatus: videoPublishStatusForGrpc,
        videoVisibilityStatus: videoVisibilityStatusForGrpc,
      };
    });

    return {
      videoFindDto: videos.map((video) => ({
        id: video.videoProps.id,
        title: video.videoProps.title,
        videoFileIdentifier: video.videoProps.videoFileIdentifier,
        thumbnail: video.videoProps.videoThumbnailIdentifier,
        categories: video.videoProps.categories,
        description: video.videoProps.description,
        videoPublishStatus: video.videoProps.videoPublishStatus,
        videoVisibilityStatus: video.videoProps.videoVisibilityStatus,
      })),
    };
  }
}
