import { DomainVideoState, DomainVideoVisibiltyState } from '@videos/domain/enums';

import {
  VideoDescription,
  VideoTitle,
  VideoFileIdentifier,
  VideoVisibilty,
  VideoState,
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
      userId,
      channelId,
      categories,
      state = DomainVideoState.PENDING_UPLOAD,
      title,
      videoFileIdentifier,
      videoThumbnailIdentifier,
      hlsManifestIdentifier,
      visibilityState = DomainVideoVisibiltyState.PRIVATE,
      description,
      failureReason,
    } = data;

    return new VideoEntity({
      id: VideoId.create(id),
      channelId: VideoChannelId.create(channelId),
      ownerId: VideoOwnerId.create(userId),
      categories: VideoCategories.create(categories),
      title: VideoTitle.create(title),
      description: VideoDescription.create(description),
      state: VideoState.create(state),
      visibilityState: VideoVisibilty.create(visibilityState),
      videoFileIdentifier: videoFileIdentifier
        ? VideoFileIdentifier.create(videoFileIdentifier)
        : undefined,
      videoThumbnailIdentifer: videoThumbnailIdentifier
        ? VideoThumbnailFileIdentifier.create(videoThumbnailIdentifier)
        : undefined,
      hlsManifestIdentifier: hlsManifestIdentifier
        ? VideoFileIdentifier.create(hlsManifestIdentifier)
        : undefined,
      failureReason,
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

  public getVideoFileIdentifier(): string | undefined {
    return this.videoProps.videoFileIdentifier?.getValue();
  }

  public getVideoThumbnailIdentifier(): string | undefined {
    return this.videoProps.videoThumbnailIdentifer?.getValue();
  }

  public getHlsManifestIdentifier(): string | undefined {
    return this.videoProps.hlsManifestIdentifier?.getValue();
  }

  public getDescription(): string | undefined {
    return this.videoProps.description?.getValue();
  }

  public getCategories(): string[] {
    return this.videoProps.categories.getValue();
  }

  public getVideoState(): DomainVideoState {
    return this.videoProps.state.getValue();
  }

  public getVisibiltyState(): DomainVideoVisibiltyState {
    return this.videoProps.visibilityState.getValue();
  }

  public hasUploadedMedia(): boolean {
    return Boolean(this.videoProps.videoFileIdentifier && this.videoProps.videoThumbnailIdentifer);
  }

  public getFailureReason() {
    return this.videoProps.failureReason;
  }

  public getSnapShot(): VideoSnapshot {
    return {
      id: this.videoProps.id.getValue(),
      ownerId: this.videoProps.ownerId.getValue(),
      channelId: this.videoProps.channelId.getValue(),
      title: this.videoProps.title.getValue(),
      videoFileIdentifier: this.videoProps.videoFileIdentifier?.getValue(),
      videoThumbnailIdentifier: this.videoProps.videoThumbnailIdentifer?.getValue(),
      hlsManifestIdentifier: this.videoProps.hlsManifestIdentifier?.getValue(),
      categories: this.videoProps.categories.getValue(),
      description: this.videoProps.description?.getValue(),
      state: this.videoProps.state.getValue(),
      visibilityState: this.videoProps.visibilityState.getValue(),
    };
  }

  public updateVideoThumbnailIdentifier(newThumbnailIdentifier: string): void {
    this.videoProps.videoThumbnailIdentifer =
      VideoThumbnailFileIdentifier.create(newThumbnailIdentifier);
  }

  public updateVideoFileIdentifier(newFileIdentifier: string): void {
    this.videoProps.videoFileIdentifier = VideoFileIdentifier.create(newFileIdentifier);
  }

  public updateHlsManifestIdentifier(newHlsManifestIdentifier: string): void {
    this.videoProps.hlsManifestIdentifier = VideoFileIdentifier.create(newHlsManifestIdentifier);
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

  public updateVideoState(newStatus: string): void {
    this.videoProps.state = VideoState.create(newStatus);
  }

  public updateVisibiltyState(newVisibiltyStatus: string): void {
    this.videoProps.visibilityState = VideoVisibilty.create(newVisibiltyStatus);
  }

  public markAsUploaded(): void {
    this.updateVideoState(DomainVideoState.UPLOADED);
  }

  public markAsTranscoding(): void {
    this.updateVideoState(DomainVideoState.TRANSCODING);
  }

  public markAsReadyToPublish(): void {
    this.updateVideoState(DomainVideoState.READY_TO_PUBLISH);
  }

  public markAsPublished(): void {
    this.updateVideoState(DomainVideoState.PUBLISHED);
  }

  public markAsFailed(reason: string): void {
    this.updateVideoState(DomainVideoState.FAILED);
    this.videoProps.failureReason = reason;
  }
}
