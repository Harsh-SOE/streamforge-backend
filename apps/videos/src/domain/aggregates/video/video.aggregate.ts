import { AggregateRoot } from '@nestjs/cqrs';

import {
  VideoDraftCreatedDomainEvent,
  VideoPublishedDomainEvent,
  VideoTranscodedDomainEvent,
  VideoUploadCompletedDomainEvent,
  // VideoProcessingFailedDomainEvent,
  // VideoTranscodingStartedDomainEvent,
} from '@videos/domain/domain-events';
import { DomainVideoState, DomainVideoVisibiltyState } from '@videos/domain/enums';

import { VideoEntity } from '../../entities';
import {
  CompleteVideoUploadOptions,
  CreateVideoFromDraftOptions,
  FailVideoProcessingOptions,
  MarkVideoTranscodedOptions,
  VideoSnapshotOptions,
  UpdateVideoDetails,
} from './options';

export class VideoAggregate extends AggregateRoot {
  private constructor(public videoEntity: VideoEntity) {
    super();
  }

  public static createFromSnapshot(data: VideoSnapshotOptions): VideoAggregate {
    const videoEntity = VideoEntity.create(data);
    return new VideoAggregate(videoEntity);
  }

  public getVideoEntity(): VideoEntity {
    return this.videoEntity;
  }

  public getSnapshot() {
    return this.videoEntity.getSnapShot();
  }

  private ensureState(expectedState: DomainVideoState, message: string): void {
    if (this.videoEntity.getVideoState() !== expectedState) {
      throw new Error(message);
    }
  }

  private ensureVideoCanBePublished() {
    const {
      videoFileIdentifier,
      videoThumbnailIdentifier,
      hlsManifestIdentifier,
      durationSeconds,
    } = this.videoEntity.getSnapShot();

    if (!videoFileIdentifier) {
      throw new Error('Video file identifier is required before publishing');
    }

    if (!videoThumbnailIdentifier) {
      throw new Error('Video thumbnail identifier is required before publishing');
    }

    if (!hlsManifestIdentifier) {
      throw new Error('HLS manifest identifier is required before publishing');
    }

    if (!durationSeconds) {
      throw new Error('Video duration is required before publishing');
    }

    return {
      videoFileIdentifier,
      videoThumbnailIdentifier,
      hlsManifestIdentifier,
      durationSeconds,
    };
  }

  public static createFromDraft(data: CreateVideoFromDraftOptions): VideoAggregate {
    const { id, ownerId, channelId, title, categories, description } = data;

    const videoEntity = VideoEntity.create({
      id,
      ownerId,
      channelId,
      title,
      categories,
      description,
      visibilityState: DomainVideoVisibiltyState.PRIVATE,
      state: DomainVideoState.DRAFT,

      videoFileIdentifier: undefined,
      videoThumbnailIdentifier: undefined,
      hlsManifestIdentifier: undefined,

      durationSeconds: undefined,
      width: undefined,
      height: undefined,
      sizeBytes: undefined,
      mimeType: undefined,

      failureReason: undefined,

      uploadedAt: undefined,
      processingStartedAt: undefined,
      transcodedAt: undefined,
      publishedAt: undefined,
    });

    const aggregate = new VideoAggregate(videoEntity);

    aggregate.apply(
      new VideoDraftCreatedDomainEvent({
        videoId: videoEntity.getId(),
        title: videoEntity.getTitle(),
        ownerId: videoEntity.getOwnerId(),
        state: videoEntity.getVideoState(),
        channelId: videoEntity.getChannelId(),
        categories: videoEntity.getCategories(),
        description: videoEntity.getDescription(),
        visibility: videoEntity.getVisibilityState(),
      }),
    );

    return aggregate;
  }

  public updateDetails(updateVideoDetails: UpdateVideoDetails): void {
    const { title, categories, description, visibilityState } = updateVideoDetails;

    if (title) this.videoEntity.updateTitle(title);
    if (description) this.videoEntity.updateDescription(description);
    if (categories) this.videoEntity.updateCategories(categories);
    if (visibilityState) this.videoEntity.updateVisibilityState(visibilityState);

    // this.apply(
    //   new VideoDetailsUpdatedDomainEvent({
    //     videoId: this.videoEntity.getId(),
    //     ownerId: this.videoEntity.getOwnerId(),
    //     channelId: this.videoEntity.getChannelId(),
    //     title: this.videoEntity.getTitle(),
    //     description: this.videoEntity.getDescription(),
    //     categories: this.videoEntity.getCategories(),
    //     visibilityState: this.videoEntity.getVisibiltyState(),
    //   }),
    // );
  }

  /**
   * Called:
   * Client uploads original video + thumbnail, and makes a request to backend.
   */
  public completeUpload(data: CompleteVideoUploadOptions): void {
    this.ensureState(DomainVideoState.DRAFT, 'Only pending-upload videos can complete upload');

    this.videoEntity.updateVideoFileIdentifier(data.videoFileIdentifier);
    this.videoEntity.updateVideoThumbnailIdentifier(data.videoThumbnailIdentifier);

    const now = new Date();

    this.videoEntity.updateUploadedAt(now);
    this.videoEntity.updateProcesssingStartedAt(now);
    this.videoEntity.updateVideoState(DomainVideoState.PROCESSING);

    this.apply(
      new VideoUploadCompletedDomainEvent({
        videoId: this.videoEntity.getId(),
        userId: this.videoEntity.getOwnerId(),
        channelId: this.videoEntity.getChannelId(),
        fileIdentifier: data.videoFileIdentifier,
        thumbnailIdentifier: data.videoThumbnailIdentifier,
      }),
    );
  }

  /**
   * Called when videos service consumes VideoTranscodedIntegrationEvent from the transcoder service.
   */
  public markTranscoded(markVideoTranscodedOptions: MarkVideoTranscodedOptions): void {
    this.ensureState(
      DomainVideoState.PROCESSING,
      'Only processing videos can be marked as transcoded',
    );

    const { height, width, sizeBytes, mimeType, hlsManifestIdentifier, durationSeconds } =
      markVideoTranscodedOptions;

    this.videoEntity.updateHlsManifestIdentifier(hlsManifestIdentifier);
    this.videoEntity.updateVideoFileDurationInSeconds(durationSeconds);

    this.videoEntity.updateVideoFileWidth(width);
    this.videoEntity.updateVideoFileHeight(height);
    this.videoEntity.updateVideoFileMimetype(mimeType);
    this.videoEntity.updateVideoFileSizeInBytes(sizeBytes);
    this.videoEntity.updateTranscodedAt(new Date());
    this.videoEntity.updateVideoState(DomainVideoState.READY_TO_PUBLISH);

    this.apply(
      new VideoTranscodedDomainEvent({
        videoId: this.videoEntity.getId(),
        userId: this.videoEntity.getOwnerId(),
        channelId: this.videoEntity.getChannelId(),
        hlsManifestIdentifier: hlsManifestIdentifier,
        durationSeconds: durationSeconds,
        width: width,
        height: height,
      }),
    );
  }

  /**
   * Called when transcoder service reports failure.
   */
  public failProcessing(failVideoProcessingOptions: FailVideoProcessingOptions): void {
    this.ensureState(DomainVideoState.PROCESSING, 'Only processing videos can fail processing');

    this.videoEntity.updateVideoState(DomainVideoState.FAILED);
    console.log(failVideoProcessingOptions);

    /**
     * Add updateFailureReason() to VideoEntity.
     */
    // this.videoEntity.updateFailureReason(data.reason);

    // this.apply(
    //   new VideoProcessingFailedDomainEvent({
    //     videoId: this.videoEntity.getId(),
    //     ownerId: this.videoEntity.getOwnerId(),
    //     channelId: this.videoEntity.getChannelId(),
    //     reason: data.reason,
    //   }),
    // );
  }

  /**
   * Called when user explicitly publishes the video.
   */
  public publish(): void {
    this.ensureState(
      DomainVideoState.READY_TO_PUBLISH,
      'Only ready-to-publish videos can be published',
    );

    const { hlsManifestIdentifier } = this.ensureVideoCanBePublished();

    const publishedAt = new Date();

    this.videoEntity.updatePublishedAt(publishedAt);
    this.videoEntity.updateVideoState(DomainVideoState.PUBLISHED);

    this.apply(
      new VideoPublishedDomainEvent({
        videoId: this.videoEntity.getId(),
        userId: this.videoEntity.getOwnerId(),
        channelId: this.videoEntity.getChannelId(),
        hlsManifestIdentifier: hlsManifestIdentifier,
        visibility: this.videoEntity.getVisibilityState(),
      }),
    );
  }
}
