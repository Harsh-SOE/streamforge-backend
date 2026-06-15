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
  HlsManifestIdentifier,
  VideoFileDurationInSeconds,
  VideoFileWidth,
  VideoFileHeight,
  VideoFileSizeBytes,
  VideoFileMimetype,
} from '../../value-objects';
import { CreateVideoEntityOptions, VideoProps, VideoSnapshot } from './options';

export class VideoEntity {
  private constructor(private videoProps: VideoProps) {}

  public static create(data: CreateVideoEntityOptions): VideoEntity {
    const {
      id,
      ownerId,
      channelId,
      categories,
      title,
      videoFileIdentifier,
      videoThumbnailIdentifier,
      hlsManifestIdentifier,
      state,
      visibilityState,
      description,
      durationSeconds,
      width,
      height,
      sizeBytes,
      mimeType,
      failureReason,
      uploadedAt,
      processingStartedAt,
      transcodedAt,
      publishedAt,
    } = data;

    return new VideoEntity({
      id: VideoId.create(id),
      channelId: VideoChannelId.create(channelId),
      ownerId: VideoOwnerId.create(ownerId),
      categories: VideoCategories.create(categories),
      title: VideoTitle.create(title),
      state: VideoState.create(state),
      visibilityState: VideoVisibilty.create(visibilityState),
      description: description ? VideoDescription.create(description) : undefined,
      videoFileIdentifier: videoFileIdentifier
        ? VideoFileIdentifier.create(videoFileIdentifier)
        : undefined,
      videoThumbnailIdentifier: videoThumbnailIdentifier
        ? VideoThumbnailFileIdentifier.create(videoThumbnailIdentifier)
        : undefined,
      hlsManifestIdentifier: hlsManifestIdentifier
        ? HlsManifestIdentifier.create(hlsManifestIdentifier)
        : undefined,
      durationSeconds: VideoFileDurationInSeconds.create(durationSeconds),
      width: VideoFileWidth.create(width),
      height: VideoFileHeight.create(height),
      sizeBytes: VideoFileSizeBytes.create(sizeBytes),
      mimeType: VideoFileMimetype.create(mimeType),
      failureReason,
      uploadedAt,
      processingStartedAt,
      transcodedAt,
      publishedAt,
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
    return this.videoProps.videoThumbnailIdentifier?.getValue();
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

  public getVisibilityState(): DomainVideoVisibiltyState {
    return this.videoProps.visibilityState.getValue();
  }

  public getDurationSeconds(): number | undefined {
    return this.videoProps.durationSeconds?.getValue();
  }

  public getVideoWidth(): number | undefined {
    return this.videoProps.width?.getValue();
  }

  public getVideoHeight(): number | undefined {
    return this.videoProps.height?.getValue();
  }

  public getSizeInBytes(): bigint | undefined {
    return this.videoProps.sizeBytes?.getValue();
  }

  public getMimetype(): string | undefined {
    return this.videoProps.mimeType?.getValue();
  }

  public getFailureReason() {
    return this.videoProps.failureReason;
  }

  public getUploadedAt(): Date | undefined {
    return this.videoProps.uploadedAt;
  }

  public getProcessingStartedAt(): Date | undefined {
    return this.videoProps.processingStartedAt;
  }

  public getTranscodedAt(): Date | undefined {
    return this.videoProps.transcodedAt;
  }

  public getPublishedAt(): Date | undefined {
    return this.videoProps.publishedAt;
  }

  public getSnapShot(): VideoSnapshot {
    return {
      id: this.videoProps.id.getValue(),
      ownerId: this.videoProps.ownerId.getValue(),
      channelId: this.videoProps.channelId.getValue(),
      title: this.videoProps.title.getValue(),
      videoFileIdentifier: this.videoProps.videoFileIdentifier?.getValue(),
      videoThumbnailIdentifier: this.videoProps.videoThumbnailIdentifier?.getValue(),
      hlsManifestIdentifier: this.videoProps.hlsManifestIdentifier?.getValue(),
      categories: this.videoProps.categories.getValue(),
      description: this.videoProps.description?.getValue(),
      state: this.videoProps.state.getValue(),
      visibilityState: this.videoProps.visibilityState.getValue(),
      durationSeconds: this.videoProps.durationSeconds?.getValue(),
      width: this.videoProps.width?.getValue(),
      height: this.videoProps.height?.getValue(),
      sizeBytes: this.videoProps.sizeBytes?.getValue(),
      mimeType: this.videoProps.mimeType?.getValue(),
      failureReason: this.videoProps.failureReason,
      uploadedAt: this.videoProps.uploadedAt,
      processingStartedAt: this.videoProps.processingStartedAt,
      transcodedAt: this.videoProps.transcodedAt,
      publishedAt: this.videoProps.publishedAt,
    };
  }

  public updateVideoThumbnailIdentifier(newThumbnailIdentifier: string): void {
    this.videoProps.videoThumbnailIdentifier =
      VideoThumbnailFileIdentifier.create(newThumbnailIdentifier);
  }

  public updateVideoFileIdentifier(newFileIdentifier: string): void {
    this.videoProps.videoFileIdentifier = VideoFileIdentifier.create(newFileIdentifier);
  }

  public updateHlsManifestIdentifier(newHlsManifestIdentifier: string): void {
    this.videoProps.hlsManifestIdentifier = HlsManifestIdentifier.create(newHlsManifestIdentifier);
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

  public updateVisibilityState(newVisibiltyStatus: string): void {
    this.videoProps.visibilityState = VideoVisibilty.create(newVisibiltyStatus);
  }

  public updateVideoFileWidth(newWidth: number): void {
    this.videoProps.width = VideoFileWidth.create(newWidth);
  }

  public updateVideoFileHeight(newHeight: number): void {
    this.videoProps.height = VideoFileHeight.create(newHeight);
  }

  public updateVideoFileMimetype(mimeType: string): void {
    this.videoProps.mimeType = VideoFileMimetype.create(mimeType);
  }

  public updateVideoFileSizeInBytes(sizeInBytes: bigint): void {
    this.videoProps.sizeBytes = VideoFileSizeBytes.create(sizeInBytes);
  }

  public updateVideoFileDurationInSeconds(durationSeconds: number): void {
    this.videoProps.durationSeconds = VideoFileDurationInSeconds.create(durationSeconds);
  }

  public updateUploadedAt(uploadedAt: Date) {
    this.videoProps.uploadedAt = uploadedAt;
  }

  public updateProcesssingStartedAt(processingStartedAt: Date) {
    this.videoProps.processingStartedAt = processingStartedAt;
  }

  public updateTranscodedAt(transcodedAt: Date) {
    this.videoProps.transcodedAt = transcodedAt;
  }

  public updatePublishedAt(publishedAt: Date) {
    this.videoProps.publishedAt = publishedAt;
  }
}
