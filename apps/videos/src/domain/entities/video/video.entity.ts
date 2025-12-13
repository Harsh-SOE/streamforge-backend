import { VideoDomainPublishStatus, VideoDomainVisibiltyStatus } from '@videos/domain/enums';

import {
  VideoDescription,
  VideoOwnerId,
  VideoTitle,
  VideoFileIdentifier,
  VideoVisibilty,
  VideoPublish,
  VideoId,
  VideoChannelId,
  VideoCategories,
  VideoThumbnailFileIdentifier,
} from '../../value-objects';

export interface VideoProps {
  readonly id: VideoId;
  readonly ownerId: VideoOwnerId;
  readonly channelId: VideoChannelId;
  title: VideoTitle;
  videoThumbnailIdentifer: VideoThumbnailFileIdentifier;
  categories: VideoCategories;
  videoFileIdentifier: VideoFileIdentifier;
  publishStatus: VideoPublish;
  visibilityStatus: VideoVisibilty;
  description?: VideoDescription;
}

export class VideoEntity {
  public constructor(private videoProps: VideoProps) {}

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

  public getSnapShot() {
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
