import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetPresignedUrlDto, GetPreSignedUrlResponse } from '@app/contracts/channel';

import { CHANNEL_STORAGE_PORT, ChannelStoragePort } from '@channel/application/ports';

import { GeneratePreSignedUrlCommand } from './generate-presigned-url.command';

@CommandHandler(GeneratePreSignedUrlCommand)
export class GeneratePreSignedUrlHandler implements ICommandHandler<
  GetPresignedUrlDto,
  GetPreSignedUrlResponse
> {
  public constructor(
    @Inject(CHANNEL_STORAGE_PORT)
    private readonly storageAdapter: ChannelStoragePort,
  ) {}

  public async execute({ fileName, userId }: GetPresignedUrlDto): Promise<GetPreSignedUrlResponse> {
    if (!fileName) {
      fileName = `cover-image-${new Date().toISOString()}-${userId}.mp4`;
    }

    const storageIdentifierResponse =
      await this.storageAdapter.getPresignedUrlForChannelCoverImage(fileName);

    return {
      response: 'Presigned url generated successfully',
      fileIdentifier: storageIdentifierResponse.fileIdentifier,
      presignedUrl: storageIdentifierResponse.presignedUrl,
    };
  }
}
