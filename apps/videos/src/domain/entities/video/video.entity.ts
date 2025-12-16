import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';

import {
  VideoDescription,
  VideoTitle,
  VideoFileIdentifier,
  VideoVisibilty,
  VideoPublish,
  VideoCategories,
  VideoThumbnailFileIdentifier,
  VideoId,
  VideoChannelId,
  VideoOwnerId,
} from '../../value-objects';

import { CreateVideoEntityOptions, VideoProps, VideoSnapshot } from './options';

export class VideoEntity {
  private constructor(private videoProps: VideoProps) {}

  public static create(data: CreateVideoEntityOptions) {
    const {
      id,
      ownerId,
      channelId,
      categories,
      publishStatus,
      title,
      videoFileIdentifier,
      videoThumbnailIdentifier,
      visibilityStatus,
      description,
    } = data;

    return new VideoEntity({
      id: VideoId.create(id),
      channelId: VideoChannelId.create(channelId),
      ownerId: VideoOwnerId.create(ownerId),
      categories: VideoCategories.create(categories),
      title: VideoTitle.create(title),
      publishStatus: VideoPublish.create(publishStatus),
      videoFileIdentifier: VideoFileIdentifier.create(videoFileIdentifier),
      videoThumbnailIdentifer: VideoThumbnailFileIdentifier.create(videoThumbnailIdentifier),
      visibilityStatus: VideoVisibilty.create(visibilityStatus),
      description: VideoDescription.create(description),
    });
  }

  public getId(): string {
    return this.videoProps.id.getValue();
  }

  public getOwnerId(): string {
    return this.videoProps.ownerId.getValue();
  }

  public getChannelId(): string {
    return this.videoProps.channelId.getValue();
  }

  public getTitle(): string {
    return this.videoProps.title.getValue();
  }

  public getVideoFileIdentifier(): string {
    return this.videoProps.videoFileIdentifier.getValue();
  }

  public getVideoThumbnailIdentifier(): string {
    return this.videoProps.videoThumbnailIdentifer.getValue();
  }

  public getDescription(): string | undefined {
    return this.videoProps.description?.getValue();
  }

  public getCategories(): string[] {
    return this.videoProps.categories.getValue();
  }

  public getPublishStatus(): VideoDomainPublishStatus {
    return this.videoProps.publishStatus.getValue();
  }

  public getVisibiltyStatus(): VideoDomainVisibiltyStatus {
    return this.videoProps.visibilityStatus.getValue();
  }

  public getSnapShot(): VideoSnapshot {
    return {
      id: this.videoProps.id.getValue(),
      ownerId: this.videoProps.ownerId.getValue(),
      channelId: this.videoProps.channelId.getValue(),
      title: this.videoProps.title.getValue(),
      videoFileIdentifier: this.videoProps.videoFileIdentifier.getValue(),
      videoThumbnailIdentifier: this.videoProps.videoThumbnailIdentifer.getValue(),
      categories: this.videoProps.categories.getValue(),
      description: this.videoProps.description?.getValue(),
      publishStatus: this.videoProps.publishStatus.getValue(),
      visibilityStatus: this.videoProps.visibilityStatus.getValue(),
    };
  }

  public updateVideoThumbnailIdentifier(newThumbnailIdentifier: string): void {
    this.videoProps.videoThumbnailIdentifer =
      VideoThumbnailFileIdentifier.create(newThumbnailIdentifier);
  }

  public updateVideoFileIdentifier(newFileIdentifier: string): void {
    this.videoProps.videoFileIdentifier = VideoFileIdentifier.create(newFileIdentifier);
  }

  public updateTitle(newTitle: string): void {
    this.videoProps.title = VideoTitle.create(newTitle);
  }

  public updateCategories(newCategories: string[]): void {
    this.videoProps.categories = VideoCategories.create(newCategories);
  }

  public updateDescription(newDescription: string): void {
    this.videoProps.description = VideoDescription.create(newDescription);
  }

  public updatePublishStatus(newStatus: string): void {
    this.videoProps.publishStatus = VideoPublish.create(newStatus);
  }

  public updateVisibiltyStatus(newVisibiltyStatus: string): void {
    this.videoProps.visibilityStatus = VideoVisibilty.create(newVisibiltyStatus);
  }
}
