import { Injectable } from '@nestjs/common';

import { IAggregatePersistanceACL } from '@app/common/ports/acl';

import { VideoAggregate } from '@videos/domain/aggregates';

import { Video } from '@persistance/videos';

type VideoAggregatePersistence = Pick<
  Video,
  | 'id'
  | 'ownerId'
  | 'channelId'
  | 'title'
  | 'description'
  | 'categories'
  | 'state'
  | 'visibilityState'
  | 'originalFileIdentifier'
  | 'thumbnailIdentifier'
  | 'hlsManifestIdentifier'
  | 'durationSeconds'
  | 'width'
  | 'height'
  | 'sizeBytes'
  | 'mimeType'
  | 'failureReason'
  | 'uploadedAt'
  | 'processingStartedAt'
  | 'transcodedAt'
  | 'publishedAt'
>;

@Injectable()
export class VideoAggregatePersistanceACL implements IAggregatePersistanceACL<
  VideoAggregate,
  VideoAggregatePersistence
> {
  public toAggregate(persistance: VideoAggregatePersistence): VideoAggregate {
    return VideoAggregate.createFromSnapshot({
      id: persistance.id,
      ownerId: persistance.ownerId,
      channelId: persistance.channelId,

      title: persistance.title,
      description: persistance.description ?? undefined,
      categories: persistance.categories,

      state: persistance.state,
      visibilityState: persistance.visibilityState,

      videoFileIdentifier: persistance.originalFileIdentifier ?? undefined,
      videoThumbnailIdentifier: persistance.thumbnailIdentifier ?? undefined,
      hlsManifestIdentifier: persistance.hlsManifestIdentifier ?? undefined,

      durationSeconds: persistance.durationSeconds ?? undefined,
      width: persistance.width ?? undefined,
      height: persistance.height ?? undefined,
      sizeBytes: persistance.sizeBytes ?? undefined,
      mimeType: persistance.mimeType ?? undefined,

      failureReason: persistance.failureReason ?? undefined,

      uploadedAt: persistance.uploadedAt ?? undefined,
      processingStartedAt: persistance.processingStartedAt ?? undefined,
      transcodedAt: persistance.transcodedAt ?? undefined,
      publishedAt: persistance.publishedAt ?? undefined,
    });
  }

  public toPersistance(aggregate: VideoAggregate): VideoAggregatePersistence {
    const videoEntity = aggregate.getVideoEntity();
    return {
      id: videoEntity.getId(),
      ownerId: videoEntity.getOwnerId(),
      channelId: videoEntity.getChannelId(),

      title: videoEntity.getTitle(),
      description: videoEntity.getDescription() ?? null,
      categories: videoEntity.getCategories(),

      state: videoEntity.getVideoState(),
      visibilityState: videoEntity.getVisibilityState(),

      originalFileIdentifier: videoEntity.getVideoFileIdentifier() ?? null,
      thumbnailIdentifier: videoEntity.getVideoThumbnailIdentifier() ?? null,
      hlsManifestIdentifier: videoEntity.getHlsManifestIdentifier() ?? null,

      durationSeconds: videoEntity.getDurationSeconds() ?? null,
      width: videoEntity.getVideoWidth() ?? null,
      height: videoEntity.getVideoHeight() ?? null,
      sizeBytes: videoEntity.getSizeInBytes() ?? null,
      mimeType: videoEntity.getMimetype() ?? null,

      failureReason: videoEntity.getFailureReason() ?? null,

      uploadedAt: videoEntity.getUploadedAt() ?? null,
      processingStartedAt: videoEntity.getProcessingStartedAt() ?? null,
      transcodedAt: videoEntity.getTranscodedAt() ?? null,
      publishedAt: videoEntity.getPublishedAt() ?? null,
    };
  }

  /*

  private toDomainVideoState(state: VideoState): DomainVideoState {
    switch (state) {
      case VideoState.DRAFT:
        return DomainVideoState.DRAFT;

      case VideoState.UPLOADED:
        return DomainVideoState.UPLOADED;

      case VideoState.PROCESSING:
        return DomainVideoState.PROCESSING;

      case VideoState.READY_TO_PUBLISH:
        return DomainVideoState.READY_TO_PUBLISH;

      case VideoState.PUBLISHED:
        return DomainVideoState.PUBLISHED;

      case VideoState.FAILED:
        return DomainVideoState.FAILED;

      default:
        throw new Error(`Unsupported Prisma video state: ${state}`);
    }
  }

  private toPrismaVideoState(state: DomainVideoState): VideoState {
    switch (state) {
      case DomainVideoState.DRAFT:
        return VideoState.DRAFT;

      case DomainVideoState.UPLOADED:
        return VideoState.UPLOADED;

      case DomainVideoState.PROCESSING:
        return VideoState.PROCESSING;

      case DomainVideoState.READY_TO_PUBLISH:
        return VideoState.READY_TO_PUBLISH;

      case DomainVideoState.PUBLISHED:
        return VideoState.PUBLISHED;

      case DomainVideoState.FAILED:
        return VideoState.FAILED;

      default:
        throw new Error(`Unsupported domain video state: ${state}`);
    }
  }

  private toDomainVisibilityState(
    visibilityState: VisibilityState,
  ): DomainVideoVisibiltyState {
    switch (visibilityState) {
      case VisibilityState.PUBLIC:
        return DomainVideoVisibiltyState.PUBLIC;

      case VisibilityState.PRIVATE:
        return DomainVideoVisibiltyState.PRIVATE;

      case VisibilityState.UNLISTED:
        return DomainVideoVisibiltyState.UNLISTED;

      default:
        throw new Error(`Unsupported Prisma visibility state: ${visibilityState}`);
    }
  }

  private toPrismaVisibilityState(
    visibilityState: DomainVideoVisibiltyState,
  ): VisibilityState {
    switch (visibilityState) {
      case DomainVideoVisibiltyState.PUBLIC:
        return VisibilityState.PUBLIC;

      case DomainVideoVisibiltyState.PRIVATE:
        return VisibilityState.PRIVATE;

      case DomainVideoVisibiltyState.UNLISTED:
        return VisibilityState.UNLISTED;

      default:
        throw new Error(`Unsupported domain visibility state: ${visibilityState}`);
    }
  }
  */
}
