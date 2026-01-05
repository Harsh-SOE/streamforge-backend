import { AggregateRoot } from '@nestjs/cqrs';

import { VideoCreatedDomainEvent } from '@videos/domain/domain-events';

import { VideoEntity } from '../../entities';
import { VideoAggregateOptions } from './options';

export class VideoAggregate extends AggregateRoot {
  private constructor(public videoEntity: VideoEntity) {
    super();
  }

  public static create(aggregateProps: VideoAggregateOptions) {
    const {
      id,
      userId,
      channelId,
      title,
      videoThumbnailIdentifier,
      videoFileIdentifier,
      categories,
      publishStatus,
      visibilityStatus,
      description,
    } = aggregateProps;

    const videoEntity = VideoEntity.create({
      id,
      userId,
      channelId,
      title,
      videoThumbnailIdentifier,
      videoFileIdentifier,
      categories,
      publishStatus,
      visibilityStatus,
      description,
    });

    const videoAggregate = new VideoAggregate(videoEntity);

    videoAggregate.apply(
      new VideoCreatedDomainEvent({
        videoId: videoAggregate.getSnapshot().id,
        userId,
        channelId,
        title,
        categories,
        description,
        visibility: visibilityStatus,
        fileIdentifier: videoFileIdentifier,
        thumbnailIdentifier: videoThumbnailIdentifier,
      }),
    );

    return videoAggregate;
  }

  public getSnapshot() {
    return this.videoEntity.getSnapShot();
  }

  public getVideoEntity() {
    return this.videoEntity;
  }

  public updateVideo(data: {
    newTitle?: string;
    newFileIdentifier?: string;
    newVisibilityStatus?: string;
    newCategories?: string[];
    newDescription?: string;
    newPublishStatus?: string;
    newThumbnailIdentifier?: string;
  }) {
    const videoEntity = this.getVideoEntity();

    if (data.newTitle) videoEntity.updateTitle(data.newTitle);
    if (data.newDescription) videoEntity.updateDescription(data.newDescription);
    if (data.newPublishStatus) videoEntity.updatePublishStatus(data.newPublishStatus);
    if (data.newVisibilityStatus) videoEntity.updateVisibiltyStatus(data.newVisibilityStatus);
    if (data.newFileIdentifier) videoEntity.updateVideoFileIdentifier(data.newFileIdentifier);
    if (data.newThumbnailIdentifier)
      videoEntity.updateVideoFileIdentifier(data.newThumbnailIdentifier);
    if (data.newCategories) videoEntity.updateCategories(data.newCategories);

    return videoEntity;
  }

  public updateVideoVisibilityStatus(newStatus: string) {
    this.getVideoEntity().updateVisibiltyStatus(newStatus);
  }

  public updateVideoPublishStatus(newStatus: string) {
    this.getVideoEntity().updatePublishStatus(newStatus);
  }

  public updateVideoDetails(data: {
    newTitle?: string;
    newDescription?: string;
    newThumbnailIdentifier?: string;
    categories?: Array<string>;
  }) {
    const videoEntity = this.getVideoEntity();

    if (data.newTitle) videoEntity.updateTitle(data.newTitle);
    if (data.newDescription) videoEntity.updateDescription(data.newDescription);
    if (data.newThumbnailIdentifier)
      videoEntity.updateVideoFileIdentifier(data.newThumbnailIdentifier);
    if (data.categories) videoEntity.updateCategories(data.categories);

    return videoEntity;
  }

  public addCategoriesToVideo(addedCategories: Array<string>) {
    const videoEntity = this.getVideoEntity();

    const currentCategories = videoEntity.getCategories();

    currentCategories.push(
      ...addedCategories.filter((category) => !currentCategories.includes(category)),
    );

    videoEntity.updateCategories(currentCategories);
  }

  public removeCategoriesFromVideo(removedCategories: Array<string>) {
    const videoEntity = this.getVideoEntity();

    const currentCategories = videoEntity.getCategories();

    const catergories = currentCategories.filter(
      (category) => !removedCategories.includes(category),
    );

    videoEntity.updateCategories(catergories);
  }
}
