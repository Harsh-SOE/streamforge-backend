import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetPresignedUrlDto, GetPreSignedUrlResponse } from '@app/contracts/users';

import { USERS_STORAGE_PORT, UsersStoragePort } from '@users/application/ports';

import { GeneratePreSignedUrlCommand } from './generate-presigned-url.command';

@CommandHandler(GeneratePreSignedUrlCommand)
export class GeneratePreSignedUrlHandler implements ICommandHandler<
  GetPresignedUrlDto,
  GetPreSignedUrlResponse
> {
  public constructor(
    @Inject(USERS_STORAGE_PORT)
    private readonly storageAdapter: UsersStoragePort,
  ) {}

  public async execute({ fileName, userId }: GetPresignedUrlDto): Promise<GetPreSignedUrlResponse> {
    if (!fileName) {
      fileName = `video-${new Date().toISOString()}-${userId}.mp4`;
    }

    const presignedUrl = await this.storageAdapter.getPresignedUrlForUserAvatar(fileName);

    return {
      response: 'Presigned url generated successfully',
      fileIdentifier: presignedUrl,
    };
  }
}
