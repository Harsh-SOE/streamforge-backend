import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { LOGGER_PORT, LoggerPort } from '@app/ports/logger';
import { GetPreSignedUrlResponse } from '@app/contracts/videos';

import { STORAGE_PORT, VideosStoragePort } from '@videos/application/ports';

import { GeneratePreSignedUrlThumbnailCommand } from './generate-presigned-url-thumbnail.command';

@CommandHandler(GeneratePreSignedUrlThumbnailCommand)
export class GeneratePreSignedUrlThumbnailHandler implements ICommandHandler<
  GeneratePreSignedUrlThumbnailCommand,
  GetPreSignedUrlResponse
> {
  public constructor(
    @Inject(STORAGE_PORT) private readonly storageAdapter: VideosStoragePort,
    @Inject(LOGGER_PORT) private readonly loggerPort: LoggerPort,
  ) {}

  public async execute({
    generatePreSignedUrlDto,
  }: GeneratePreSignedUrlThumbnailCommand): Promise<GetPreSignedUrlResponse> {
    let fileName = generatePreSignedUrlDto.fileName;
    const userId = generatePreSignedUrlDto.userId;

    if (!fileName) {
      fileName = `video-${new Date().toISOString()}-${userId}.mp4`;
    }

    const presignedUrlResponse = await this.storageAdapter.getPresignedUrlForThumbnail(fileName);

    const response = {
      response: 'Presigned url generated successfully',
      presignedUrl: presignedUrlResponse.presignedUrl,
      fileIdentifier: presignedUrlResponse.fileIdentifier,
    };

    return response;
  }
}
