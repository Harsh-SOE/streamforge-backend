import { Injectable } from '@nestjs/common';

import { IQueryPersistanceACL } from '@app/ports/anti-corruption';

import { VideoQueryModel } from '@videos/query-model';

import { Video } from '@peristance/videos';

import {
  PersistanceToQueryPublishEnumMapper,
  PersistanceToQueryVisibilityEnumMapper,
} from '../enums/to-query';
import { QueryToPersistancePublishEnumMapper } from '../enums/to-persistance';

@Injectable()
export class VideoQueryPeristanceACL implements IQueryPersistanceACL<
  VideoQueryModel,
  Omit<Video, 'publishedAt' | 'updatedAt'>
> {
  public toQueryModel(
    schema: Omit<Video, 'publishedAt' | 'updatedAt'>,
  ): VideoQueryModel {
    const videoPublishStatusForQuery = PersistanceToQueryPublishEnumMapper.get(
      schema.videoPublishStatus,
    );
    const videoVisibilityStatusForQuery =
      PersistanceToQueryVisibilityEnumMapper.get(schema.videoVisibiltyStatus);

    if (!videoPublishStatusForQuery || !videoVisibilityStatusForQuery) {
      throw new Error();
    }

    return {
      videoProps: {
        id: schema.id,
        ownerId: schema.ownerId,
        channelId: schema.channelId,
        title: schema.title,
        videoFileIdentifier: schema.videoFileIdentifier,
        videoThumbnailIdentifier: schema.videoThumbnailIdentifer,
        description: schema.description ?? undefined,
        categories: schema.categories,
        videoPublishStatus: videoPublishStatusForQuery,
        videoVisibilityStatus: videoVisibilityStatusForQuery,
      },
    };
  }
  toPersistance(
    model: VideoQueryModel,
  ): Omit<Video, 'publishedAt' | 'updatedAt'> {
    const {
      id,
      ownerId,
      channelId,
      title,
      videoFileIdentifier,
      videoThumbnailIdentifier,
      categories,
      videoPublishStatus,
      videoVisibilityStatus,
      description,
    } = model.videoProps;
    const videoPublishStatusForPersistance =
      QueryToPersistancePublishEnumMapper.get(videoPublishStatus);
    const videoVisibilityStatusForPersistance =
      PersistanceToQueryVisibilityEnumMapper.get(videoVisibilityStatus);

    if (
      !videoPublishStatusForPersistance ||
      !videoVisibilityStatusForPersistance
    ) {
      throw new Error();
    }

    return {
      id,
      ownerId,
      channelId,
      title,
      description: description ?? null,
      videoFileIdentifier: videoFileIdentifier,
      videoThumbnailIdentifer: videoThumbnailIdentifier,
      categories,
      videoPublishStatus: videoPublishStatusForPersistance,
      videoVisibiltyStatus: videoVisibilityStatusForPersistance,
    };
  }
}
