import { Inject } from '@nestjs/common';
import { ICommandHandler } from '@nestjs/cqrs';

import { VideoUploadedVerifiedResponse } from '@app/contracts/protocols/videos';

import { VideoNotFoundException } from '@videos/application/exceptions';
import { VideoPrismaRepositoryAdapter } from '@videos/infrastructure/database/prisma';
import {
  STORAGE_PORT,
  VIDEOS_RESPOSITORY_PORT,
  VideosStoragePort,
} from '@videos/application/ports';

import { VerifyUploadedMediaCommand } from './verify-uploaded-media.command';

export class VerifyUploadedMediaHandler implements ICommandHandler<VerifyUploadedMediaCommand> {
  public constructor(
    @Inject(STORAGE_PORT)
    private readonly videoStorageAdapter: VideosStoragePort,
    @Inject(VIDEOS_RESPOSITORY_PORT)
    private readonly videoRepositoryAdapter: VideoPrismaRepositoryAdapter,
  ) {}

  async execute({
    checkUploadedVideoDto,
  }: VerifyUploadedMediaCommand): Promise<VideoUploadedVerifiedResponse> {
    const { id } = checkUploadedVideoDto;

    const result = await this.videoStorageAdapter.verifyRawMedia(id);

    if (!result)
      return {
        // video was not verified...
        id: id,
        uploaded: false,
      };

    // video verified...

    // load domain model here...
    const videoAggregate = await this.videoRepositoryAdapter.findOneVideoById(id);
    if (!videoAggregate) {
      throw new VideoNotFoundException({ message: `Video with id:${id} was not found` });
    }

    // update the domain so that it includes the file path in s3...
    videoAggregate.completeUpload({
      videoFileIdentifier: `/videos/raw/${id}`,
      videoThumbnailIdentifier: `/videos/raw/${id}`,
    });

    // call the database repository so that database recored is also updated...
    await this.videoRepositoryAdapter.updateOneVideoById(id, videoAggregate);

    // fire an event video ready to process that transcoder service will consume and then extract the metadata, transcode and save the video...

    return {
      id: checkUploadedVideoDto.id,
      uploaded: result.exists,
    };
  }
}
