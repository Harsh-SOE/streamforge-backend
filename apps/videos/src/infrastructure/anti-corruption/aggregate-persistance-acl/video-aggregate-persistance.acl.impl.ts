import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/ports/anti-corruption';

import { VideoAggregate } from '@videos/domain/aggregates';
import { VideoEntity } from '@videos/domain/entities';
import {
  VideoDescription,
  VideoOwnerId,
  VideoPublish,
  VideoTitle,
  VideoFileIdentifier,
  VideoVisibilty,
  VideoThumbnailFileIdentifier,
  VideoCategories,
  VideoChannelId,
  VideoId,
} from '@videos/domain/value-objects';

import { Video } from '@peristance/videos';

@Injectable()
export class VideoAggregatePersistanceACL implements IAggregatePersistanceACL<
  VideoAggregate,
  Omit<Video, 'publishedAt' | 'updatedAt'>
> {
  public toAggregate(
    persistance: Omit<Video, 'publishedAt' | 'updatedAt'>,
  ): VideoAggregate {
    const videoEntity = new VideoEntity({
      id: VideoId.create(persistance.id),
      ownerId: VideoOwnerId.create(persistance.ownerId),
      channelId: VideoChannelId.create(persistance.channelId),
      title: VideoTitle.create(persistance.title),
      videoThumbnailIdentifer: VideoThumbnailFileIdentifier.create(
        persistance.videoThumbnailIdentifer,
      ),
      videoFileIdentifier: VideoFileIdentifier.create(
        persistance.videoFileIdentifier,
      ),
      categories: VideoCategories.create(persistance.categories),
      publishStatus: VideoPublish.create(
        persistance.videoPublishStatus.toString(),
      ),
      visibilityStatus: VideoVisibilty.create(
        persistance.videoVisibiltyStatus.toString(),
      ),
      description: VideoDescription.create(
        persistance.description ?? undefined,
      ),
    });

    return new VideoAggregate(videoEntity);
  }

  public toPersistance(
    aggregate: VideoAggregate,
  ): Omit<Video, 'publishedAt' | 'updatedAt'> {
    return {
      id: aggregate.getVideo().getId(),
      ownerId: aggregate.getVideo().getOwnerId(),
      channelId: aggregate.getVideo().getChannelId(),
      title: aggregate.getVideo().getTitle(),
      videoFileIdentifier: aggregate.getVideo().getVideoFileIdentifier(),
      videoThumbnailIdentifer: aggregate
        .getVideo()
        .getVideoThumbnailIdentifier(),
      categories: aggregate.getVideo().getCategories(),
      description: aggregate.getVideo().getDescription() ?? null,
      videoPublishStatus: aggregate.getVideo().getPublishStatus(),
      videoVisibiltyStatus: aggregate.getVideo().getVisibiltyStatus(),
    };
  }
}
