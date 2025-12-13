import { AggregateRoot } from '@nestjs/cqrs';

import { VideoCreatedEvent } from '@videos/application/events';
import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';
import {
  VideoDescription,
  VideoOwnerId,
  VideoPublish,
  VideoTitle,
  VideoFileIdentifier,
  VideoVisibilty,
  VideoChannelId,
  VideoThumbnailFileIdentifier,
  VideoId,
  VideoCategories,
} from '@videos/domain/value-objects';

import { TranscodeVideoMessage } from '@app/contracts/video-transcoder';

import { VideoEntity } from '../../entities/video/video.entity';

export class VideoAggregate extends AggregateRoot {
  public constructor(public videoEntity: VideoEntity) {
    super();
  }

  public static create(aggregateProps: {
    id: string;
    ownerId: string;
    channelId: string;
    title: string;
    videoThumbnailIdentifier: string;
    videoFileIdentifier: string;
    categories: string[];
    description?: string;
    publishStatus: VideoDomainPublishStatus;
    visibilityStatus: VideoDomainVisibiltyStatus;
  }) {
    const {
      id,
      ownerId,
      channelId,
      title,
      videoThumbnailIdentifier: videoThumbnailFileIdentifier,
      videoFileIdentifier,
      categories,
      publishStatus,
      visibilityStatus,
      description,
    } = aggregateProps;

    const videoEntity = new VideoEntity({
      id: VideoId.create(id),
      ownerId: VideoOwnerId.create(ownerId),
      channelId: VideoChannelId.create(channelId),
      title: VideoTitle.create(title),
      videoThumbnailIdentifer: VideoThumbnailFileIdentifier.create(videoThumbnailFileIdentifier),
      videoFileIdentifier: VideoFileIdentifier.create(videoFileIdentifier),
      categories: VideoCategories.create(categories),
      publishStatus: VideoPublish.create(publishStatus),
      visibilityStatus: VideoVisibilty.create(visibilityStatus),
      description: VideoDescription.create(description),
    });

    const videoAggregate = new VideoAggregate(videoEntity);

    const transcodeVideoMessage: TranscodeVideoMessage = {
      fileIdentifier: videoAggregate.getVideo().getVideoFileIdentifier(),
      videoId: videoAggregate.getVideo().getId(),
    };

    videoAggregate.apply(new VideoCreatedEvent(transcodeVideoMessage));
    return videoAggregate;
  }

  public getSnapshot() {
    return this.videoEntity.getSnapShot();
  }

  public getVideo() {
    return this.videoEntity;
  }

  public updateVideo(updateProps: {
    newTitle?: string;
    newFileIdentifier?: string;
    newVisibilityStatus?: string;
    newCategories?: string[];
    newDescription?: string;
    newPublishStatus?: string;
    newThumbnailIdentifier?: string;
  }) {
    if (updateProps.newTitle) this.videoEntity.updateTitle(updateProps.newTitle);
    if (updateProps.newDescription) this.videoEntity.updateDescription(updateProps.newDescription);
    if (updateProps.newPublishStatus)
      this.videoEntity.updatePublishStatus(updateProps.newPublishStatus);
    if (updateProps.newVisibilityStatus)
      this.videoEntity.updateVisibiltyStatus(updateProps.newVisibilityStatus);
    if (updateProps.newFileIdentifier)
      this.videoEntity.updateVideoFileIdentifier(updateProps.newFileIdentifier);
    if (updateProps.newThumbnailIdentifier)
      this.videoEntity.updateVideoFileIdentifier(updateProps.newThumbnailIdentifier);
    if (updateProps.newCategories) this.videoEntity.updateCategories(updateProps.newCategories);
    return this.videoEntity;
  }
}
