import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { VideoAggregate } from '@videos/domain/aggregates';

import { Video } from '@persistance/videos';

type VideoAggregatePersistence = Pick<
  Video,
  | 'id'
  | 'ownerId'
  | 'channelId'
  | 'title'
  | 'description'
  | 'categories'
  | 'state'
  | 'visibilityState'
  | 'originalFileIdentifier'
  | 'thumbnailIdentifier'
  | 'hlsManifestIdentifier'
  | 'failureReason'
>;

@Injectable()
export class VideoAggregatePersistanceACL implements IAggregatePersistanceACL<
  VideoAggregate,
  VideoAggregatePersistence
> {
  public toAggregate(persistance: VideoAggregatePersistence): VideoAggregate {
    return VideoAggregate.rehydrate({
      id: persistance.id,
      userId: persistance.ownerId,
      channelId: persistance.channelId,
      title: persistance.title,
      categories: persistance.categories,
      description: persistance.description ?? undefined,

      videoFileIdentifier: persistance.originalFileIdentifier ?? undefined,
      videoThumbnailIdentifier: persistance.thumbnailIdentifier ?? undefined,
      hlsManifestIdentifier: persistance.hlsManifestIdentifier ?? undefined,

      state: persistance.state,
      visibilityState: persistance.visibilityState,
      failureReason: persistance.failureReason ?? undefined,
    });
  }

  public toPersistance(aggregate: VideoAggregate): VideoAggregatePersistence {
    const videoEntity = aggregate.getVideoEntity();
    return {
      id: videoEntity.getId(),
      ownerId: videoEntity.getOwnerId(),
      channelId: videoEntity.getChannelId(),
      title: videoEntity.getTitle(),
      originalFileIdentifier: videoEntity.getVideoFileIdentifier() ?? null,
      thumbnailIdentifier: videoEntity.getVideoThumbnailIdentifier() ?? null,
      hlsManifestIdentifier: videoEntity.getHlsManifestIdentifier() ?? null,
      categories: videoEntity.getCategories(),
      description: videoEntity.getDescription() ?? null,
      state: videoEntity.getVideoState(),
      visibilityState: videoEntity.getVisibiltyState(),
      failureReason: videoEntity.getFailureReason?.() ?? null,
    };
  }
}
