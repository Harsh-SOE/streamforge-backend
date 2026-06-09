import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetPresignedUrlDto, GetPreSignedUrlResponse } from '@app/contracts/protocols/channel';

import { CHANNEL_STORAGE_PORT, ChannelStoragePort } from '@channel/application/ports';

import { GeneratePreSignedUrlCommand } from './generate-presigned-url.command';
import { LOGGER_PORT, LoggerPort } from '@app/common/ports/logger';

@CommandHandler(GeneratePreSignedUrlCommand)
export class GeneratePreSignedUrlHandler implements ICommandHandler<
  GetPresignedUrlDto,
  GetPreSignedUrlResponse
> {
  public constructor(
    @Inject(CHANNEL_STORAGE_PORT)
    private readonly storageAdapter: ChannelStoragePort,
    @Inject(LOGGER_PORT) private readonly logger: LoggerPort,
  ) {}

  public async execute({ fileName, userId }: GetPresignedUrlDto): Promise<GetPreSignedUrlResponse> {
    if (!fileName) {
      fileName = `cover-image-${new Date().toISOString()}-${userId}.mp4`;
    }

    const storageIdentifierResponse =
      await this.storageAdapter.getPresignedUrlForChannelCoverImage(fileName);

    this.logger.info(`Generated URL:${storageIdentifierResponse.presignedUrl}`);

    return {
      response: 'Presigned url generated successfully',
      ...storageIdentifierResponse,
    };
  }
}
