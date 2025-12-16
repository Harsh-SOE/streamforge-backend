import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import { VideoAggregate } from '@videos/domain/aggregates';

import { Video } from '@peristance/videos';

@Injectable()
export class VideoAggregatePersistanceACL implements IAggregatePersistanceACL<
  VideoAggregate,
  Omit<Video, 'publishedAt' | 'updatedAt'>
> {
  public toAggregate(persistance: Omit<Video, 'publishedAt' | 'updatedAt'>): VideoAggregate {
    // TODO mapper for enums 'PERSISTANCE' -> 'DOMAIN'...
    return VideoAggregate.create({
      id: persistance.id,
      ownerId: persistance.ownerId,
      channelId: persistance.channelId,
      title: persistance.title,
      videoThumbnailIdentifier: persistance.videoThumbnailIdentifer,
      videoFileIdentifier: persistance.videoFileIdentifier,
      categories: persistance.categories,
      publishStatus: persistance.videoPublishStatus.toString(),
      visibilityStatus: persistance.videoVisibiltyStatus.toString(),
      description: persistance.description ?? undefined,
    });
  }

  public toPersistance(aggregate: VideoAggregate): Omit<Video, 'publishedAt' | 'updatedAt'> {
    const videoEntity = aggregate.getVideoEntity();
    return {
      id: videoEntity.getId(),
      ownerId: videoEntity.getOwnerId(),
      channelId: videoEntity.getChannelId(),
      title: videoEntity.getTitle(),
      videoFileIdentifier: videoEntity.getVideoFileIdentifier(),
      videoThumbnailIdentifer: videoEntity.getVideoThumbnailIdentifier(),
      categories: videoEntity.getCategories(),
      description: videoEntity.getDescription() ?? null,
      videoPublishStatus: videoEntity.getPublishStatus(),
      videoVisibiltyStatus: videoEntity.getVisibiltyStatus(),
    };
  }
}
