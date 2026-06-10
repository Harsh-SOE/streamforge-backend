import { AggregateRoot } from '@nestjs/cqrs';

import {
  VideoDraftCreatedDomainEvent,
  VideoProcessingFailedDomainEvent,
  VideoPublishedDomainEvent,
  VideoTranscodedDomainEvent,
  VideoTranscodingStartedDomainEvent,
  VideoUploadCompletedDomainEvent,
} from '@videos/domain/domain-events';
import { DomainVideoState } from '@videos/domain/enums';
import { InvalidVideoStateTransitionException } from '@videos/domain/exceptions';

import { VideoEntity } from '../../entities';
import { CreateVideoDraftAggregateOptions, RehydrateVideoAggregateOptions } from './options';

export class VideoAggregate extends AggregateRoot {
  private constructor(public videoEntity: VideoEntity) {
    super();
  }

  public static create(aggregateProps: CreateVideoDraftAggregateOptions) {
    const {
      id,
      userId,
      channelId,
      title,
      videoThumbnailIdentifier,
      videoFileIdentifier,
      hlsManifestIdentifier,
      categories,
      state,
      visibilityState,
      description,
    } = aggregateProps;

    const videoEntity = VideoEntity.create({
      id,
      userId,
      channelId,
      title,
      videoThumbnailIdentifier,
      videoFileIdentifier,
      hlsManifestIdentifier,
      categories,
      state,
      visibilityState,
      description,
    });

    const videoAggregate = new VideoAggregate(videoEntity);

    videoAggregate.apply(
      new VideoDraftCreatedDomainEvent({
        videoId: videoAggregate.getSnapshot().id,
        userId,
        channelId,
        title,
        categories,
        description,
        visibility: videoAggregate.getSnapshot().visibilityState,
        state: videoAggregate.getSnapshot().state,
      }),
    );

    return videoAggregate;
  }

  public static rehydrate(aggregateProps: RehydrateVideoAggregateOptions) {
    const videoEntity = VideoEntity.create(aggregateProps);
    return new VideoAggregate(videoEntity);
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
    newVisibilityState?: string;
    newCategories?: string[];
    newDescription?: string;
    videoState?: string;
    newThumbnailIdentifier?: string;
  }) {
    const videoEntity = this.getVideoEntity();

    if (data.newTitle) videoEntity.updateTitle(data.newTitle);
    if (data.newDescription) videoEntity.updateDescription(data.newDescription);
    if (data.videoState) videoEntity.updateVideoState(data.videoState);
    if (data.newVisibilityState) videoEntity.updateVisibiltyState(data.newVisibilityState);
    if (data.newFileIdentifier) videoEntity.updateVideoFileIdentifier(data.newFileIdentifier);
    if (data.newThumbnailIdentifier)
      videoEntity.updateVideoThumbnailIdentifier(data.newThumbnailIdentifier);
    if (data.newCategories) videoEntity.updateCategories(data.newCategories);

    return videoEntity;
  }

  public updateVideoVisibilityState(newState: string) {
    this.getVideoEntity().updateVisibiltyState(newState);
  }

  public updateVideoState(newState: string) {
    this.getVideoEntity().updateVideoState(newState);
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

  public completeUpload(data: {
    videoFileIdentifier: string;
    videoThumbnailIdentifier: string;
  }): void {
    const videoEntity = this.getVideoEntity();
    const currentStatus = videoEntity.getVideoState();

    if (currentStatus !== DomainVideoState.PENDING_UPLOAD) {
      throw new InvalidVideoStateTransitionException({
        message: `Only videos pending upload can complete upload. Current status: ${currentStatus}`,
      });
    }

    videoEntity.updateVideoFileIdentifier(data.videoFileIdentifier);
    videoEntity.updateVideoThumbnailIdentifier(data.videoThumbnailIdentifier);
    videoEntity.markAsUploaded();

    const snapshot = this.getSnapshot();

    this.apply(
      new VideoUploadCompletedDomainEvent({
        videoId: snapshot.id,
        userId: snapshot.ownerId,
        channelId: snapshot.channelId,
        fileIdentifier: data.videoFileIdentifier,
        thumbnailIdentifier: data.videoThumbnailIdentifier,
      }),
    );
  }

  public startTranscoding(): void {
    const videoEntity = this.getVideoEntity();
    const currentStatus = videoEntity.getVideoState();

    if (currentStatus !== DomainVideoState.UPLOADED) {
      throw new InvalidVideoStateTransitionException({
        message: `Only uploaded videos can start transcoding. Current status: ${currentStatus}`,
      });
    }

    const fileIdentifier = this.getRequiredFileIdentifier();

    videoEntity.markAsTranscoding();

    const snapshot = this.getSnapshot();

    this.apply(
      new VideoTranscodingStartedDomainEvent({
        videoId: snapshot.id,
        userId: snapshot.ownerId,
        channelId: snapshot.channelId,
        fileIdentifier,
        durationSeconds: 0,
      }),
    );
  }

  public markTranscoded(data: { hlsManifestIdentifier: string }): void {
    const videoEntity = this.getVideoEntity();
    const currentStatus = videoEntity.getVideoState();

    if (
      currentStatus !== DomainVideoState.TRANSCODING &&
      currentStatus !== DomainVideoState.UPLOADED
    ) {
      throw new InvalidVideoStateTransitionException({
        message: `Only uploaded/transcoding videos can be marked transcoded. Current status: ${currentStatus}`,
      });
    }

    this.assertMediaIsAttached();

    videoEntity.updateHlsManifestIdentifier(data.hlsManifestIdentifier);
    videoEntity.markAsReadyToPublish();

    const snapshot = this.getSnapshot();

    this.apply(
      new VideoTranscodedDomainEvent({
        videoId: snapshot.id,
        userId: snapshot.ownerId,
        channelId: snapshot.channelId,
        hlsManifestIdentifier: data.hlsManifestIdentifier,
      }),
    );
  }

  public publish(): void {
    const videoEntity = this.getVideoEntity();
    const currentStatus = videoEntity.getVideoState();

    if (currentStatus !== DomainVideoState.READY_TO_PUBLISH) {
      throw new InvalidVideoStateTransitionException({
        message: `Only ready-to-publish videos can be published. Current status: ${currentStatus}`,
      });
    }

    this.assertMediaIsAttached();

    const hlsManifestIdentifier = videoEntity.getHlsManifestIdentifier();

    if (!hlsManifestIdentifier) {
      throw new InvalidVideoStateTransitionException({
        message: 'Video cannot be published without HLS manifest',
      });
    }

    videoEntity.markAsPublished();

    const snapshot = this.getSnapshot();

    this.apply(
      new VideoPublishedDomainEvent({
        videoId: snapshot.id,
        userId: snapshot.ownerId,
        channelId: snapshot.channelId,
        visibility: snapshot.visibilityState,
        hlsManifestIdentifier: hlsManifestIdentifier,
      }),
    );
  }

  public failProcessing(reason: string): void {
    const videoEntity = this.getVideoEntity();
    const currentStatus = videoEntity.getVideoState();

    if (
      currentStatus !== DomainVideoState.UPLOADED &&
      currentStatus !== DomainVideoState.TRANSCODING
    ) {
      throw new InvalidVideoStateTransitionException({
        message: `Only uploaded/transcoding videos can fail processing. Current status: ${currentStatus}`,
      });
    }

    videoEntity.markAsFailed(reason);

    const snapshot = this.getSnapshot();

    this.apply(
      new VideoProcessingFailedDomainEvent({
        videoId: snapshot.id,
        userId: snapshot.ownerId,
        channelId: snapshot.channelId,
        reason,
      }),
    );
  }

  private assertEditable(): void {
    const currentStatus = this.videoEntity.getVideoState();

    if (currentStatus === DomainVideoState.PUBLISHED) {
      throw new InvalidVideoStateTransitionException({
        message: 'Published video details cannot be edited here',
      });
    }
  }

  private assertMediaIsAttached(): void {
    if (!this.videoEntity.hasUploadedMedia()) {
      throw new InvalidVideoStateTransitionException({
        message: 'Video file and thumbnail must be attached before this transition',
      });
    }
  }

  private getRequiredFileIdentifier(): string {
    const fileIdentifier = this.videoEntity.getVideoFileIdentifier();

    if (!fileIdentifier) {
      throw new InvalidVideoStateTransitionException({
        message: 'Video file identifier is missing',
      });
    }

    return fileIdentifier;
  }
}
